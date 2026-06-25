import {
    StreamingChatMessageChunkReceivedEvent,
    StreamingChatMessageStartEvent,
} from '@azure/communication-signaling';

import LiveChatVersion from '../core/LiveChatVersion';
import OmnichannelStreamingMessage from '../core/messaging/OmnichannelStreamingMessage';
import StreamingMetadata from '../core/messaging/StreamingMetadata';
import TelemetryEvent from '../telemetry/TelemetryEvent';
import { MessageSource } from '../telemetry/MessageSource';
import createOmnichannelMessage from './createOmnichannelMessage';

const MAX_TRACKED_STREAMS = 1000;

export interface CreateOmnichannelStreamingMessageOptionalParams {
    liveChatVersion: LiveChatVersion;
    eventName: 'streamingChatMessageStarted' | 'streamingChatMessageChunkReceived';
    sequenceCounters: Map<string, number>;
    finalizedMessageIds: Set<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: { recordIndividualEvent: (event: string, source: string, props: any) => void } | null;
}

const createOmnichannelStreamingMessage = (
    event: StreamingChatMessageStartEvent | StreamingChatMessageChunkReceivedEvent,
    params: CreateOmnichannelStreamingMessageOptionalParams
): OmnichannelStreamingMessage | undefined => {
    // Drop duplicate finals — log and bail before doing any other work.
    const incomingType = event.streamingMetadata?.streamingMessageType;
    if (incomingType === 'final' && params.finalizedMessageIds.has(event.id)) {
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingDuplicateFinal,
            MessageSource.WebSocketStreaming,
            { messageId: event.id }
        );
        return undefined;
    }

    // ACS chunks are typed as ChatMessageEditedEvent; defensively log if the
    // content field is missing (should be impossible per protocol but the
    // type system lets it slip through). createOmnichannelMessage handles
    // the absent-content case by falling back to empty string.
    if (event.message === undefined || event.message === null) {
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingChunkNoContent,
            MessageSource.WebSocketStreaming,
            { messageId: event.id, eventName: params.eventName }
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseMessage = createOmnichannelMessage(event as any, {
        liveChatVersion: params.liveChatVersion,
    });
    const streamingMetadata = normalizeStreamingMetadata(event, params);

    if (streamingMetadata.streamingMessageType === 'final') {
        // LRU-bounded: evict oldest finalized ID when at capacity.
        if (params.finalizedMessageIds.size >= MAX_TRACKED_STREAMS && !params.finalizedMessageIds.has(event.id)) {
            const oldestId = params.finalizedMessageIds.values().next().value;
            if (oldestId !== undefined) {
                params.finalizedMessageIds.delete(oldestId);
                params.logger?.recordIndividualEvent(
                    TelemetryEvent.StreamingFinalizedIdEvicted,
                    MessageSource.WebSocketStreaming,
                    { evictedMessageId: oldestId }
                );
            }
        }
        params.finalizedMessageIds.add(event.id);
        params.sequenceCounters.delete(event.id);
    } else if (params.finalizedMessageIds.has(event.id)) {
        // Late chunk after final — log but still emit so consumers can
        // decide UX behavior.
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingChunkAfterFinal,
            MessageSource.WebSocketStreaming,
            { messageId: event.id }
        );
    }

    // Surface policyViolation (only present on chunk-typed events).
    const policyViolation = (event as StreamingChatMessageChunkReceivedEvent).policyViolation;
    if (policyViolation) {
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingPolicyViolation,
            MessageSource.WebSocketStreaming,
            { messageId: event.id, result: policyViolation.result }
        );
    }

    return {
        ...baseMessage,
        streamingMetadata,
        ...(policyViolation ? { policyViolation } : {}),
    } as OmnichannelStreamingMessage;
};

function normalizeStreamingMetadata(
    event: StreamingChatMessageStartEvent | StreamingChatMessageChunkReceivedEvent,
    params: CreateOmnichannelStreamingMessageOptionalParams
): StreamingMetadata {
    const fallbackType: StreamingMetadata['streamingMessageType'] =
        params.eventName === 'streamingChatMessageStarted' ? 'start' : 'streaming';

    if (event.streamingMetadata?.streamingMessageType === undefined) {
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingMetadataMissingType,
            MessageSource.WebSocketStreaming,
            { messageId: event.id, eventName: params.eventName }
        );
    }

    // For start events, the event name takes precedence over what ACS sends.
    // ACS currently sends streamingMessageType: "streaming" even for the start event
    // (event 250 / streamingChatMessageStarted), so we override to "start".
    const inferredType = params.eventName === 'streamingChatMessageStarted'
        ? 'start'
        : (event.streamingMetadata?.streamingMessageType ?? fallbackType);
    const inferredSequence = recordAndGetSequence(event, params);

    let endReason = event.streamingMetadata?.streamEndReason;
    if (inferredType === 'final' && endReason === undefined) {
        params.logger?.recordIndividualEvent(
            TelemetryEvent.StreamingFinalMissingReason,
            MessageSource.WebSocketStreaming,
            { messageId: event.id }
        );
        endReason = 'completed';
    }

    return {
        streamingMessageType: inferredType,
        streamingSequenceNumber: inferredSequence,
        streamEndReason: endReason,
    };
}

function recordAndGetSequence(
    event: StreamingChatMessageStartEvent | StreamingChatMessageChunkReceivedEvent,
    params: CreateOmnichannelStreamingMessageOptionalParams
): number {
    const fromAcs = event.streamingMetadata?.streamingSequenceNumber;
    if (fromAcs !== undefined) {
        return fromAcs;
    }

    // SDK fallback: monotonic counter per messageId, LRU-bounded at MAX_TRACKED_STREAMS.
    if (
        params.sequenceCounters.size >= MAX_TRACKED_STREAMS &&
        !params.sequenceCounters.has(event.id)
    ) {
        const oldestKey = params.sequenceCounters.keys().next().value;
        if (oldestKey !== undefined) {
            params.sequenceCounters.delete(oldestKey);
            params.logger?.recordIndividualEvent(
                TelemetryEvent.StreamingCounterEvicted,
                MessageSource.WebSocketStreaming,
                { evictedMessageId: oldestKey }
            );
        }
    }
    const next = (params.sequenceCounters.get(event.id) ?? 0) + 1;
    params.sequenceCounters.set(event.id, next);
    return next;
}

export default createOmnichannelStreamingMessage;
