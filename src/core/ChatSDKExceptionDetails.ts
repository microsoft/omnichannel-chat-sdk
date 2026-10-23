/**
 *  Interface for ChatSDK exceptions
 *
 *  @param response {string} Response of the exception in CamelCase. The format should be easily caught and handle in code. (e.g: ChatConfigRetrievalFailure)
 *  @param message {string} User friendly message. Usually used to be displayed to the users.
 *  @param errorObject {string} Error object in string format. It's useful for investigation.
 *  @param cancellationReason {string} [OPTIONAL] Privacy-safe network or cancellation category
 *  @param online {boolean} [OPTIONAL] Browser online status at the time of failure
 *  @param failureStage {string} [OPTIONAL] Stage of a multi-step operation that failed
 *  @param httpStatus {number} [OPTIONAL] HTTP response status, when available
 *  @param isRetryable {boolean} [OPTIONAL] Whether retrying the operation may succeed
 *  @param retryAfterMs {number} [OPTIONAL] Server-provided retry delay in milliseconds
 */
interface ChatSDKExceptionDetails {
    response: string;
    message?: string;
    errorObject?: string;
    cancellationReason?: string;
    online?: boolean;
    failureStage?: string;
    httpStatus?: number;
    isRetryable?: boolean;
    retryAfterMs?: number;
}

export default ChatSDKExceptionDetails;