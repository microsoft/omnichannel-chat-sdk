/**
 * Enum of ChatSDK standard errors.
 * 
 * @enum {string}
 */
enum ChatSDKErrors {
    /** Failure in ChatAdapter initialization */
    ChatAdapterInitializationFailure = "ChatAdapterInitializationFailure",
    /** Failure in loading a script dynamically */
    ScriptLoadFailure = "ScriptLoadFailure",
    /** Feature not supported in the platform used */
    UnsupportedPlatform = "UnsupportedPlatform",
    /** Conversation has been closed (WrapUp/Closed state) */
    ClosedConversation = "ClosedConversation",
    /** Conversation is invalid or not found */
    InvalidConversation = "InvalidConversation"
}

export default ChatSDKErrors;