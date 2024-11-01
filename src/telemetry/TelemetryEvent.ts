enum TelemetryEvent {
    ValidateOmnichannelConfig = "ValidateOmnichannelConfig",
    ValidateSDKConfig = "ValidateSDKConfig",
    InitializeChatSDK = "InitializeChatSDK",
    InitializeChatSDKParallel = "InitializeChatSDKParallel",
    InitializeMessagingClient = "InitializeMessagingClient ",
    InitializeComponents = "InitializeComponents",
    InitializeLoadChatConfig = "InitializeLoadChatConfig",
    StartChat = "StartChat",
    EndChat = "EndChat",
    GetLiveChatConfig = "GetLiveChatConfig",
    GetAuthToken = "GetAuthToken",
    GetPreChatSurvey = "GetPreChatSurvey",
    GetChatToken = "GetChatToken",
    GetConversationDetails = "GetConversationDetails",
    GetCurrentLiveChatContext = "GetCurrentLiveChatContext",
    GetMessages = "GetMessages",
    SendMessages = "SendMessages",
    SendTypingEvent = "SendTypingEvent",
    OnAgentEndSession = "OnAgentEndSession",
    OnNewMessage = "OnNewMessage",
    OnTypingEvent = "OnTypingEvent",
    UploadFileAttachment = "UploadFileAttachment",
    DownloadFileAttachment = "DownloadFileAttachment",
    EmailLiveChatTranscript = "EmailLiveChatTranscript",
    GetLiveChatTranscript = "GetLiveChatTranscript",
    CreateACSAdapter = "CreateACSAdapter",
    CreateDirectLine = "CreateDirectLine",
    GetVoiceVideoCalling = "GetVoiceVideoCalling",
    InitializeVoiceVideoCallingSDK = "InitializeVoiceVideoCallingSDK",
    AcceptVoiceCall = "AcceptVoiceCall",
    AcceptVideoCall = "AcceptVideoCall",
    RejectCall = "RejectCall",
    StopCall = "StopCall",
    OnCallDisconnected = "OnCallDisconnected",
    UpdateChatToken = "UpdateChatToken",
    GetChatReconnectContext = "GetChatReconnectContext",
    GetPostChatSurveyContext = "GetPostChatSurveyContext",
    GetAgentAvailability = "GetAgentAvailability",
    GetGeolocation = "GetGeolocation",
    GetChatReconnectContextWithReconnectId = "GetChatReconnectContextWithReconnectId",
    GetChatReconnectContextWithAuthToken = "GetChatReconnectContextWithAuthToken"

}

export default TelemetryEvent;