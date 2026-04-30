import {
    StreamingChatMessageChunkReceivedEvent,
    StreamingChatMessageStartEvent,
} from "@azure/communication-signaling";

import { PrintableMessage } from "./types/PrintableMessageType";

export class StreamingMessagePrinter {
    static printify(
        event: StreamingChatMessageStartEvent | StreamingChatMessageChunkReceivedEvent
    ): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (!event) {
            return result;
        }
        result.id = event.id;
        result.tags = event?.metadata?.tags ? event.metadata.tags.replace(/"/g, "").split(",").filter((tag: string) => tag.length > 0) : [];
        result.bot = event?.metadata?.tags?.includes("public") ? false : true;
        result.card = false;
        // Privacy: never log raw streaming content. Stamp the byte length only.
        result.content = event?.message ? `${event.message.length} chars` : "";
        result.created = event.createdOn;
        // Streaming-specific fields. PrintableMessage doesn't formally carry these
        // today; the cast lets dashboards consume them as additional context.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any).streamingMessageType = event?.streamingMetadata?.streamingMessageType;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any).streamingSequenceNumber = event?.streamingMetadata?.streamingSequenceNumber;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any).streamEndReason = event?.streamingMetadata?.streamEndReason;
        return result;
    }
}
