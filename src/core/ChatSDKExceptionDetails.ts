/**
 *  Interface for ChatSDK exceptions
 *
 *  @param response {string} Response of the exception in CamelCase. The format should be easily caught and handle in code. (e.g: ChatConfigRetrievalFailure)
 *  @param message {string} User friendly message. Usually used to be displayed to the users.
 *  @param errorObject {string} Error object in string format. It's useful for investigation.
 */
interface ChatSDKExceptionDetails {
    response: string;
    message?: string;
    errorObject?: string;
    isNetworkOffline?: boolean;
}

export default ChatSDKExceptionDetails;