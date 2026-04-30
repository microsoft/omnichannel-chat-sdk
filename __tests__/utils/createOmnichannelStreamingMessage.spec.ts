/* eslint-disable @typescript-eslint/no-explicit-any */

import LiveChatVersion from '../../src/core/LiveChatVersion';
import createOmnichannelStreamingMessage from '../../src/utils/createOmnichannelStreamingMessage';
import { makeStreamChunkEvent, makeStreamFinalEvent, makeStreamStartEvent } from './streamingFixtures';

describe('createOmnichannelStreamingMessage', () => {
    let sequenceCounters: Map<string, number>;
    let finalizedMessageIds: Set<string>;
    let logger: any;

    beforeEach(() => {
        sequenceCounters = new Map();
        finalizedMessageIds = new Set();
        logger = { recordIndividualEvent: jest.fn() };
    });

    it('converts a start event into an OmnichannelStreamingMessage with type=start', () => {
        const event = makeStreamStartEvent({ id: 'm1', message: '' });

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageStarted',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result).toBeDefined();
        expect(result!.id).toBe('m1');
        expect(result!.streamingMetadata.streamingMessageType).toBe('start');
        expect(result!.streamingMetadata.streamingSequenceNumber).toBe(0);
    });

    it('converts a chunk event into a streaming message with type=streaming', () => {
        const event = makeStreamChunkEvent(3, 'Hello world', { id: 'm1' });

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result).toBeDefined();
        expect(result!.streamingMetadata.streamingMessageType).toBe('streaming');
        expect(result!.streamingMetadata.streamingSequenceNumber).toBe(3);
        expect(result!.content).toBe('Hello world');
    });

    it('converts a final event and adds messageId to finalizedMessageIds', () => {
        const event = makeStreamFinalEvent(7, 'Done', 'completed');
        event.id = 'm1';

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result!.streamingMetadata.streamingMessageType).toBe('final');
        expect(result!.streamingMetadata.streamEndReason).toBe('completed');
        expect(finalizedMessageIds.has('m1')).toBe(true);
    });

    it('defaults missing streamingMessageType to "start" for start events with telemetry warning', () => {
        const event = makeStreamStartEvent({ streamingMetadata: undefined });
        event.id = 'm1';

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageStarted',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result!.streamingMetadata.streamingMessageType).toBe('start');
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingMetadataMissingType',
            'WSStream',
            expect.objectContaining({ messageId: 'm1' })
        );
    });

    it('defaults missing streamingMessageType to "streaming" for chunk events', () => {
        const event = makeStreamChunkEvent(2, 'partial');
        event.id = 'm1';
        event.streamingMetadata = undefined as any;

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result!.streamingMetadata.streamingMessageType).toBe('streaming');
    });

    it('defaults missing streamEndReason on final to "completed" with warning telemetry', () => {
        const event = makeStreamFinalEvent(5, 'Done');
        event.id = 'm1';
        event.streamingMetadata = { streamingMessageType: 'final', streamingSequenceNumber: 5 };

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result!.streamingMetadata.streamEndReason).toBe('completed');
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingFinalMissingReason',
            'WSStream',
            expect.objectContaining({ messageId: 'm1' })
        );
    });

    it('drops duplicate final events for the same messageId', () => {
        const finalA = makeStreamFinalEvent(5, 'Done', 'completed');
        finalA.id = 'm1';
        const finalB = makeStreamFinalEvent(5, 'Done again', 'completed');
        finalB.id = 'm1';

        createOmnichannelStreamingMessage(finalA, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        const second = createOmnichannelStreamingMessage(finalB, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(second).toBeUndefined();
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingDuplicateFinal',
            'WSStream',
            expect.objectContaining({ messageId: 'm1' })
        );
    });

    it('logs StreamingChunkAfterFinal but still emits a chunk that arrives post-final', () => {
        const finalEvent = makeStreamFinalEvent(5, 'Done', 'completed');
        finalEvent.id = 'm1';
        const lateChunk = makeStreamChunkEvent(6, 'Late');
        lateChunk.id = 'm1';

        createOmnichannelStreamingMessage(finalEvent, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });
        const late = createOmnichannelStreamingMessage(lateChunk, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(late).toBeDefined();
        expect(late!.streamingMetadata.streamingMessageType).toBe('streaming');
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingChunkAfterFinal',
            'WSStream',
            expect.objectContaining({ messageId: 'm1' })
        );
    });

    it('passes policyViolation through and logs StreamingPolicyViolation telemetry', () => {
        const event = makeStreamChunkEvent(2, 'flagged');
        event.id = 'm1';
        (event as any).policyViolation = { result: 'contentBlocked' };

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result!.policyViolation).toEqual({ result: 'contentBlocked' });
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingPolicyViolation',
            'WSStream',
            expect.objectContaining({ messageId: 'm1', result: 'contentBlocked' })
        );
    });

    it('evicts oldest sequence counter at MAX_TRACKED_STREAMS and logs eviction', () => {
        // Pre-fill 256 counters with arbitrary messageIds.
        for (let i = 0; i < 256; i++) {
            sequenceCounters.set(`pre-${i}`, 1);
        }

        // Now process a fresh chunk for a brand-new messageId without ACS sequence number.
        const event = makeStreamChunkEvent(0, 'new stream');
        event.id = 'fresh';
        event.streamingMetadata = { streamingMessageType: 'streaming' };

        const result = createOmnichannelStreamingMessage(event, {
            liveChatVersion: LiveChatVersion.V2,
            eventName: 'streamingChatMessageChunkReceived',
            sequenceCounters,
            finalizedMessageIds,
            logger,
        });

        expect(result).toBeDefined();
        expect(sequenceCounters.has('fresh')).toBe(true);
        expect(sequenceCounters.has('pre-0')).toBe(false);
        expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
            'StreamingCounterEvicted',
            'WSStream',
            expect.objectContaining({ evictedMessageId: 'pre-0' })
        );
    });
});
