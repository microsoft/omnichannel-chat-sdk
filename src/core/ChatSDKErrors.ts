/**
 * Enum of ChatSDK standard errors.
 *
 * @enum {string}
 */
enum ChatSDKErrors {
    /** Failure in ChatAdapter initialization */
    ChatAdapterInitializationFailure = "ChatAdapterInitializationFailure",
    /** Live Chat Version currently not supported with ChatSDK */
    UnsupportedLiveChatVersion = "UnsupportedLiveChatVersion",
    /** Failure in OCSDK initialization */
    OCSDKInitializationFailure = "OCSDKInitializationFailure",
    /** Failure in messaging/communication SDK initialization */
    MessagingSDKInitializationFailure = "MessagingSDKInitializationFailure",
    /** Failure in retrieval of ChatConfig */
    ChatConfigRetrievalFailure = "ChatConfigRetrievalFailure",
    /** ChatSDK is not initialized */
    UninitializedChatSDK = "UninitializedChatSDK",
    /** Failure in retrieving ChatToken */
    ChatTokenRetrievalFailure = "ChatTokenRetrievalFailure",
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