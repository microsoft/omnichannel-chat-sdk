enum TelemetryEvent {
    ValidateOmnichannelConfig = "ValidateOmnichannelConfig",
    ValidateSDKConfig = "ValidateSDKConfig",
    InitializeChatSDK = "InitializeChatSDK",
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
    CreateIC3Adapter = "CreateChatAdapter",
    CreateACSAdapter = "CreateACSAdapter",
    CreateDirectLine = "CreateDirectLine",
    GetVoiceVideoCalling = "GetVoiceVideoCalling",
    GetIC3Client = "GetIC3Client",
    InitializeVoiceVideoCallingSDK = "InitializeVoiceVideoCallingSDK",
    AcceptVoiceCall = "AcceptVoiceCall",
    AcceptVideoCall = "AcceptVideoCall",
    RejectCall = "RejectCall",
    StopCall = "StopCall",
    OnCallDisconnected = "OnCallDisconnected",
    UpdateChatToken = "UpdateChatToken",
    GetChatReconnectContext = "GetChatReconnectContext",
    GetPostChatSurveyContext = "GetPostChatSurveyContext",
    GetAgentAvailability = "GetAgentAvailability"
}

export default TelemetryEvent;