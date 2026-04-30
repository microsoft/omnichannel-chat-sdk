import OmnichannelMessage from "./OmnichannelMessage";
import PolicyViolation from "./PolicyViolation";
import StreamingMetadata from "./StreamingMetadata";

/**
 * Streaming message chunk delivered through chatSDK.onStreamingMessage.
 * Extends OmnichannelMessage with required streamingMetadata; policyViolation
 * is optional and only present when ACS moderation flagged the chunk.
 */
export interface OmnichannelStreamingMessage extends OmnichannelMessage {
    streamingMetadata: StreamingMetadata;
    policyViolation?: PolicyViolation;
}

export default OmnichannelStreamingMessage;
