/**
 *  Interface for ChatSDK exceptions
 *
 *  @param response {string} Response of the exception in CamelCase. The format should be easily caught and handle in code. (e.g: ChatConfigRetrievalFailure)
 *  @param message {string} User friendly message. Usually used to be displayed to the users.
 *  @param errorObject {string} Error object in string format. It's useful for investigation.
 *  @param clientElapsedMs {number} [OPTIONAL] Elapsed time in milliseconds from client's perspective for the operation
 *  @param cancellationReason {string} [OPTIONAL] Reason for cancellation (timeout, user, network, etc.)
 *  @param online {boolean} [OPTIONAL] Browser's online status at the time of failure (navigator.onLine)
 */
interface ChatSDKExceptionDetails {
    response: string;
    message?: string;
    errorObject?: string;
    // Tier 1 telemetry fields (ADO 6373382)
    clientElapsedMs?: number;
    cancellationReason?: string;
    online?: boolean;
}

export default ChatSDKExceptionDetails;