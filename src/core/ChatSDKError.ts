/**
 * Enum of ChatSDK standard errors.
 *
 * @enum {string}
 */
export enum ChatSDKErrorName {
    /** Failure in ChatAdapter initialization */
    ChatAdapterInitializationFailure = "ChatAdapterInitializationFailure",
    /** Live Chat Version currently not supported with ChatSDK */
    UnsupportedLiveChatVersion = "UnsupportedLiveChatVersion",
    /** Failure in OCSDK initialization */
    OmnichannelClientInitializationFailure = "OmnichannelClientInitializationFailure",
    /** Failure in messaging/communication client creation */
    MessagingClientCreationFailure = "MessagingClientCreationFailure",
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
    /** Feature is not enabled. */
    FeatureDisabled = "FeatureDisabled",
    /** Conversation has been closed (WrapUp/Closed state) */
    ClosedConversation = "ClosedConversation",
    /** Conversation is invalid or not found */
    InvalidConversation = "InvalidConversation",
    /** Failure in retrieval of the conversation given the authenticated user id */
    AuthenticatedChatConversationRetrievalFailure = "AuthenticatedChatConversationRetrievalFailure",
    /** Failure on retrieving conversation from persistent chat */
    PersistentChatConversationRetrievalFailure = "PersistentChatConversationRetrievalFailure",
    /** Failure on conversation init due to widget being outside of operating hours */
    WidgetUseOutsideOperatingHour = "WidgetUseOutsideOperatingHour",
    /** Failure in conversation initialization */
    ConversationInitializationFailure = "ConversationInitializationFailure",
    /** Failure in closure of the conversation */
    ConversationClosureFailure = "ConversationClosureFailure",
    /** Failure in messaging/communication client initialization */
    MessagingClientInitializationFailure = "MessagingClientInitializationFailure",
    /** Failure in message/communication client joining the conversation */
    MessagingClientConversationJoinFailure = "MessagingClientConversationJoinFailure",
    /** Failure on retrieving live chat transcript of a conversation */
    LiveChatTranscriptRetrievalFailure = "LiveChatTranscriptRetrievalFailure",
    /** Failure on retrieving conversation details */
    ConversationDetailsRetrievalFailure = "ConversationDetailsRetrievalFailure",
    /** Failure on finding the contact id related to the auth code */
    AuthContactIdNotFoundFailure = "AuthContactIdNotFoundFailure",
    /** AuthTokenProvider is not implemented */
    GetAuthTokenNotFound = "GetAuthTokenNotFound",
    /** Failure on retrieving AuthToken from AuthTokenProvider */
    GetAuthTokenFailed = "GetAuthTokenFailed",
    /** AuthToken is undefined */
    UndefinedAuthToken = "UndefinedAuthToken"
}

export class ChatSDKError {
    public message: ChatSDKErrorName;
    public httpResponseStatusCode: number | undefined;

    constructor(message: ChatSDKErrorName, httpResponseStatusCode?: number) {
        this.message = message;
        this.httpResponseStatusCode = httpResponseStatusCode;
    }

    toString(): string {
        return this.message as string;
    }
}