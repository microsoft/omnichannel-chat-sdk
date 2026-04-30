/**
 * Metadata describing a streaming message's lifecycle position.
 * Mirrors ACS's StreamingMessageMetadata, with all fields required after
 * SDK-side normalization in createOmnichannelStreamingMessage.
 */
export interface StreamingMetadata {
    streamingMessageType: "start" | "informative" | "streaming" | "final";
    streamingSequenceNumber: number;
    streamEndReason?: "completed" | "expired" | "canceled";
}

export default StreamingMetadata;
