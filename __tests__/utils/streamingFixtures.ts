/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    StreamingChatMessageStartEvent,
    StreamingChatMessageChunkReceivedEvent,
    StreamEndReason,
} from '@azure/communication-signaling';

export function makeStreamStartEvent(
    overrides: Partial<StreamingChatMessageStartEvent> = {}
): StreamingChatMessageStartEvent {
    return {
        id: "msg-1",
        message: "",
        threadId: "thread-1",
        sender: { kind: "communicationUser", communicationUserId: "bot-1" } as any,
        senderDisplayName: "Bot",
        recipient: { kind: "communicationUser", communicationUserId: "user-1" } as any,
        type: "Text",
        version: "1",
        createdOn: new Date("2026-04-29T12:00:00Z"),
        metadata: {},
        streamingMetadata: { streamingMessageType: "start", streamingSequenceNumber: 0 },
        ...overrides,
    };
}

export function makeStreamChunkEvent(
    seq: number,
    content: string,
    overrides: Partial<StreamingChatMessageChunkReceivedEvent> = {}
): StreamingChatMessageChunkReceivedEvent {
    return {
        ...makeStreamStartEvent({ message: content }),
        editedOn: new Date("2026-04-29T12:00:01Z"),
        streamingMetadata: { streamingMessageType: "streaming", streamingSequenceNumber: seq },
        ...overrides,
    };
}

export function makeStreamFinalEvent(
    seq: number,
    content: string,
    reason: StreamEndReason = "completed"
): StreamingChatMessageChunkReceivedEvent {
    return makeStreamChunkEvent(seq, content, {
        streamingMetadata: {
            streamingMessageType: "final",
            streamingSequenceNumber: seq,
            streamEndReason: reason,
        },
    });
}
