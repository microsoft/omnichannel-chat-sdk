/* eslint-disable @typescript-eslint/no-explicit-any */

import { StreamingMessagePrinter } from '../../../src/utils/printers/StreamingMessagePrinter';
import { makeStreamChunkEvent, makeStreamStartEvent } from '../streamingFixtures';

describe('StreamingMessagePrinter', () => {
    it('printifies a start event with id, tags, bot flag, content size, and streaming metadata', () => {
        const event = makeStreamStartEvent({
            id: 'm1',
            metadata: { tags: 'public,bot' },
            message: 'Hi',
        });

        const result = StreamingMessagePrinter.printify(event);

        expect(result.id).toBe('m1');
        expect(result.tags).toEqual(['public', 'bot']);
        expect(result.bot).toBe(false);
        expect((result as any).streamingMessageType).toBe('start');
        expect((result as any).streamingSequenceNumber).toBe(0);
    });

    it('printifies a chunk event without leaking raw content (length only)', () => {
        const event = makeStreamChunkEvent(3, 'sensitive content here');
        event.id = 'm1';

        const result = StreamingMessagePrinter.printify(event);

        expect(result.id).toBe('m1');
        expect(result.content).not.toContain('sensitive content here');
        expect(result.content).toBe('22 chars');
    });

    it('returns an empty PrintableMessage when event is falsy', () => {
        const result = StreamingMessagePrinter.printify(undefined as any);
        expect(result).toEqual({});
    });
});
