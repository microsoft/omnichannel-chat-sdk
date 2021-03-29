enum TelemetryEvent {
    ValidateOmnichannelConfig = "ValidateOmnichannelConfig",
    ValidateSDKConfig = "ValidateSDKConfig",
    InitializeChatSDK = "InitializeChatSDK",
    StartChat = "StartChat",
    EndChat = "EndChat",
    GetLiveChatConfig = "GetLiveChatConfig",
    GetChatToken = "GetChatToken",
    SendTypingEvent = "SendTypingEvent",
    OnAgentEndSession = "OnAgentEndSession",
    UploadFileAttachment = "UpdateFileAttachment",
    DownloadFileAttachment = "DownloadFileAttachment",
    EmailLiveChatTranscript = "EmailLiveChatTranscript",
    GetLiveChatTranscript = "GetLiveChatTranscript",
    CreateIC3Adapter = "CreateChatAdapter",
    CreateACSAdapter = "CreateACSAdapter",
    GetVoiceVideoCalling = "GetVoiceVideoCalling",
    GetIC3Client = "GetIC3Client",
    InitializeVoiceVideoCallingSDK = "InitializeVoiceVideoCallingSDK",
    AcceptVoiceCall = "AcceptVoiceCall",
    AcceptVideoCall = "AcceptVideoCall",
    RejectVoiceCall = "RejectVoiceCall",
    RejectVideoCall = "RejectVideoCall",
    StopCall = "StopCall",
    onCallDisconnected = "onCallDisconnected"
}

export const startEvent = (event: TelemetryEvent): string => {
    return `${event}Started`;
}

export const completeEvent = (event: TelemetryEvent): string => {
    return `${event}Completed`;
}

export const failEvent = (event: TelemetryEvent): string => {
    return `${event}Failed`;
}

export default TelemetryEvent;