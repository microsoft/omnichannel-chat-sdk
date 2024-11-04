export default interface OmnichannelChatToken {
    chatId?: string;
    regionGTMS?: Record<string, string>;
    requestId?: string;
    token?: string;
    expiresIn?: string;
    visitorId?: string;
    voiceVideoCallToken?: any;
    acsEndpoint?: string;
    amsEndpoint?: string;
}