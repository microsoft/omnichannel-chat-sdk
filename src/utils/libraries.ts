import { webChatACSAdapterVersion, webChatDirectLineVersion } from "../config/settings";

const getACSAdapterCDNUrl = (version = webChatACSAdapterVersion): string => {
    const ACSAdapterCDNUrl = `https://unpkg.com/acs_webchat-chat-adapter@${version}/dist/chat-adapter.js`;
    return ACSAdapterCDNUrl;
}

const getDirectLineCDNUrl = (version = webChatDirectLineVersion): string => {
    const DirectLineCDNUrl = `https://unpkg.com/botframework-directlinejs@${version}/dist/directline.js`;
    return DirectLineCDNUrl;
}

export default {
    getACSAdapterCDNUrl,
    getDirectLineCDNUrl
}

export {
    getACSAdapterCDNUrl,
    getDirectLineCDNUrl
}