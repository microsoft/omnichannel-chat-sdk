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
    UploadFileAttachment = "UploadFileAttachment",
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
    RejectCall = "RejectCall",
    StopCall = "StopCall",
    OnCallDisconnected = "OnCallDisconnected"
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