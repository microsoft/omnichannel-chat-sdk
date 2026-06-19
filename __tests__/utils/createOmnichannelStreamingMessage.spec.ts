/* eslint-disable @typescript-eslint/no-explicit-any */

import createOmnichannelStreamingMessage, { CreateOmnichannelStreamingMessageOptionalParams } from '../../src/utils/createOmnichannelStreamingMessage';
import LiveChatVersion from '../../src/core/LiveChatVersion';

const makeFakeEvent = (overrides: Record<string, any> = {}): any => ({
    id: 'msg-1',
    message: 'hello world',
    sender: { communicationUserId: 'bot-id', kind: 'communicationUser' },
    senderDisplayName: 'Bot',
    createdOn: new Date('2026-01-01'),
    editedOn: new Date('2026-01-01'),
    threadId: 'thread-1',
    recipient: { communicationUserId: 'user-id', kind: 'communicationUser' },
    type: 'text',
    version: '1',
    streamingMetadata: {
        streamingMessageType: 'streaming',
        streamingSequenceNumber: 1,
    },
    metadata: {},
    ...overrides,
});

const makeParams = (overrides: Partial<CreateOmnichannelStreamingMessageOptionalParams> = {}): CreateOmnichannelStreamingMessageOptionalParams => ({
    liveChatVersion: LiveChatVersion.V2,
    eventName: 'streamingChatMessageChunkReceived',
    sequenceCounters: new Map(),
    finalizedMessageIds: new Set(),
    logger: null,
    ...overrides,
});

describe('createOmnichannelStreamingMessage', () => {
    describe('normalizeStreamingMetadata', () => {
        it('should return "start" type when eventName is streamingChatMessageStarted regardless of ACS value', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'streaming', streamingSequenceNumber: 1 },
            });
            const params = makeParams({ eventName: 'streamingChatMessageStarted' });

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.streamingMetadata.streamingMessageType).toBe('start');
        });

        it('should return "streaming" type for chunk events', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'streaming', streamingSequenceNumber: 2 },
            });
            const params = makeParams({ eventName: 'streamingChatMessageChunkReceived' });

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.streamingMetadata.streamingMessageType).toBe('streaming');
        });

        it('should return "final" type for final chunk events', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            });
            const params = makeParams({ eventName: 'streamingChatMessageChunkReceived' });

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.streamingMetadata.streamingMessageType).toBe('final');
            expect(result!.streamingMetadata.streamEndReason).toBe('completed');
        });

        it('should fallback to "streaming" when streamingMessageType is undefined on chunk event', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingSequenceNumber: 3 },
            });
            const params = makeParams({ eventName: 'streamingChatMessageChunkReceived' });

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.streamingMetadata.streamingMessageType).toBe('streaming');
        });

        it('should override to "start" even when ACS sends undefined on start event', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingSequenceNumber: 1 },
            });
            const params = makeParams({ eventName: 'streamingChatMessageStarted' });

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.streamingMetadata.streamingMessageType).toBe('start');
        });

        it('should use ACS sequence number when provided', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'streaming', streamingSequenceNumber: 42 },
            });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.streamingMetadata.streamingSequenceNumber).toBe(42);
        });

        it('should generate fallback sequence number when ACS does not provide one', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'streaming' },
            });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.streamingMetadata.streamingSequenceNumber).toBe(1);

            // Second call with same message ID should increment
            const result2 = createOmnichannelStreamingMessage(event, params);
            expect(result2!.streamingMetadata.streamingSequenceNumber).toBe(2);
        });

        it('should default streamEndReason to "completed" when final has no endReason', () => {
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamingSequenceNumber: 5 },
            });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.streamingMetadata.streamEndReason).toBe('completed');
        });
    });

    describe('duplicate final detection', () => {
        it('should drop duplicate final for the same message ID', () => {
            const finalizedMessageIds = new Set<string>();
            const params = makeParams({ finalizedMessageIds });

            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            });

            // First final should succeed
            const result1 = createOmnichannelStreamingMessage(event, params);
            expect(result1).toBeDefined();

            // Second final with same ID should be dropped
            const result2 = createOmnichannelStreamingMessage(event, params);
            expect(result2).toBeUndefined();
        });

        it('should track finalized message IDs', () => {
            const finalizedMessageIds = new Set<string>();
            const params = makeParams({ finalizedMessageIds });

            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            });

            createOmnichannelStreamingMessage(event, params);

            expect(finalizedMessageIds.has('msg-1')).toBe(true);
        });

        it('should clean up sequence counters on final', () => {
            const sequenceCounters = new Map<string, number>();
            sequenceCounters.set('msg-1', 4);
            const params = makeParams({ sequenceCounters });

            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            });

            createOmnichannelStreamingMessage(event, params);

            expect(sequenceCounters.has('msg-1')).toBe(false);
        });
    });

    describe('message content', () => {
        it('should set content from event.message', () => {
            const event = makeFakeEvent({ message: 'chunk content here' });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.content).toBe('chunk content here');
        });

        it('should handle missing message content gracefully', () => {
            const event = makeFakeEvent({ message: undefined });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result).toBeDefined();
            expect(result!.content).toBe('');
        });
    });

    describe('policyViolation', () => {
        it('should surface policyViolation when present', () => {
            const event = makeFakeEvent({
                policyViolation: { result: 'contentBlocked' },
            });
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.policyViolation).toEqual({ result: 'contentBlocked' });
        });

        it('should not include policyViolation when absent', () => {
            const event = makeFakeEvent();
            const params = makeParams();

            const result = createOmnichannelStreamingMessage(event, params);

            expect(result!.policyViolation).toBeUndefined();
        });
    });

    describe('telemetry logging', () => {
        it('should log when streamingMessageType is missing', () => {
            const logger = { recordIndividualEvent: jest.fn() };
            const event = makeFakeEvent({
                streamingMetadata: { streamingSequenceNumber: 1 },
            });
            const params = makeParams({ logger, eventName: 'streamingChatMessageChunkReceived' });

            createOmnichannelStreamingMessage(event, params);

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('MetadataMissingType'),
                expect.any(String),
                expect.objectContaining({ messageId: 'msg-1' })
            );
        });

        it('should log when final is missing streamEndReason', () => {
            const logger = { recordIndividualEvent: jest.fn() };
            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamingSequenceNumber: 5 },
            });
            const params = makeParams({ logger });

            createOmnichannelStreamingMessage(event, params);

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('FinalMissingReason'),
                expect.any(String),
                expect.objectContaining({ messageId: 'msg-1' })
            );
        });

        it('should log when content is missing', () => {
            const logger = { recordIndividualEvent: jest.fn() };
            const event = makeFakeEvent({ message: undefined });
            const params = makeParams({ logger });

            createOmnichannelStreamingMessage(event, params);

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('ChunkNoContent'),
                expect.any(String),
                expect.objectContaining({ messageId: 'msg-1' })
            );
        });

        it('should log duplicate final', () => {
            const logger = { recordIndividualEvent: jest.fn() };
            const finalizedMessageIds = new Set<string>();
            const params = makeParams({ logger, finalizedMessageIds });

            const event = makeFakeEvent({
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            });

            createOmnichannelStreamingMessage(event, params);
            createOmnichannelStreamingMessage(event, params);

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('DuplicateFinal'),
                expect.any(String),
                expect.objectContaining({ messageId: 'msg-1' })
            );
        });

        it('should log policyViolation when present', () => {
            const logger = { recordIndividualEvent: jest.fn() };
            const event = makeFakeEvent({
                policyViolation: { result: 'warning' },
            });
            const params = makeParams({ logger });

            createOmnichannelStreamingMessage(event, params);

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('PolicyViolation'),
                expect.any(String),
                expect.objectContaining({ messageId: 'msg-1', result: 'warning' })
            );
        });
    });

    describe('LRU sequence counter eviction', () => {
        it('should evict oldest sequence counter when MAX_TRACKED_STREAMS is reached', () => {
            const sequenceCounters = new Map<string, number>();
            // Fill to 1000 entries
            for (let i = 0; i < 1000; i++) {
                sequenceCounters.set(`existing-${i}`, i);
            }
            const logger = { recordIndividualEvent: jest.fn() };
            const params = makeParams({ sequenceCounters, logger });

            const event = makeFakeEvent({
                id: 'new-msg',
                streamingMetadata: { streamingMessageType: 'streaming' },
            });

            createOmnichannelStreamingMessage(event, params);

            // Oldest entry should have been evicted
            expect(sequenceCounters.has('existing-0')).toBe(false);
            // New entry should exist
            expect(sequenceCounters.has('new-msg')).toBe(true);
            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('CounterEvicted'),
                expect.any(String),
                expect.objectContaining({ evictedMessageId: 'existing-0' })
            );
        });
    });

    describe('LRU finalizedMessageIds eviction', () => {
        it('should evict oldest finalized ID when MAX_TRACKED_STREAMS is reached', () => {
            const finalizedMessageIds = new Set<string>();
            // Fill to 1000 entries
            for (let i = 0; i < 1000; i++) {
                finalizedMessageIds.add(`finalized-${i}`);
            }
            const logger = { recordIndividualEvent: jest.fn() };
            const params = makeParams({ finalizedMessageIds, logger });

            // New message with final type
            const event = makeFakeEvent({
                id: 'new-final-msg',
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed' },
            });

            createOmnichannelStreamingMessage(event, params);

            // Oldest entry should have been evicted
            expect(finalizedMessageIds.has('finalized-0')).toBe(false);
            // New entry should exist
            expect(finalizedMessageIds.has('new-final-msg')).toBe(true);
            // Size should still be 1000
            expect(finalizedMessageIds.size).toBe(1000);
            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                expect.stringContaining('FinalizedIdEvicted'),
                expect.any(String),
                expect.objectContaining({ evictedMessageId: 'finalized-0' })
            );
        });

        it('should not evict when adding a duplicate final (already in set)', () => {
            const finalizedMessageIds = new Set<string>();
            for (let i = 0; i < 1000; i++) {
                finalizedMessageIds.add(`finalized-${i}`);
            }
            const params = makeParams({ finalizedMessageIds });

            // Duplicate final for existing ID — should be dropped before reaching eviction
            const event = makeFakeEvent({
                id: 'finalized-500',
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed' },
            });

            const result = createOmnichannelStreamingMessage(event, params);

            // Should be dropped as duplicate
            expect(result).toBeUndefined();
            // Size unchanged
            expect(finalizedMessageIds.size).toBe(1000);
        });
    });
});
