/* eslint-disable @typescript-eslint/no-explicit-any */

export default interface IChatToken {
    chatId?: string;
    regionGTMS?: any;
    requestId?: string;
    token?: string;
    expiresIn?: string;
    visitorId?: string;
    voiceVideoCallToken?: any;
    acsEndpoint?: string;
    amsEndpoint?: string;
}