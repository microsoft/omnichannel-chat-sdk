// Ported from https://github.com/microsoft/omnichannel-sdk/blob/main/src/Common/OmnichannelEndpoints.ts

export default class OmnichannelEndpoints {
    public static readonly LiveChatConfigPath = "livechatconnector/config";
    public static readonly LiveChatSessionInitPath = "livechatconnector/sessioninit";
    public static readonly LiveChatAuthSessionInitPath = "livechatconnector/auth/sessioninit";
    public static readonly LiveChatv2GetChatTokenPath = "livechatconnector/v2/getchattoken";
    public static readonly LiveChatv2AuthGetChatTokenPath = "livechatconnector/v2/auth/getchattoken";
    public static readonly LiveChatSessionClosePath = "livechatconnector/sessionclose";
    public static readonly SendTypingIndicatorPath = "inbound/typingindicator/livechat/sendtypingindicator";
    public static readonly LiveChatTranscriptEmailRequestPath = "livechatconnector/createemailrequest";
    public static readonly LiveChatLiveWorkItemDetailsPath = "livechatconnector/getliveworkitemdetails";
    public static readonly LiveChatv2GetChatTranscriptPath = "livechatconnector/v2/getchattranscripts";
    public static readonly LiveChatAuthLiveWorkItemDetailsPath = "livechatconnector/auth/getliveworkitemdetails";
    public static readonly LiveChatAuthChatMapRecord = "livechatconnector/auth/validateauthchatmaprecord";
    public static readonly LiveChatAuthSessionClosePath= "livechatconnector/auth/sessionclose"
}