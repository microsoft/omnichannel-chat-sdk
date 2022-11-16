import { ic3ClientVersion, webChatACSAdapterVersion, webChatDirectLineVersion, webChatIC3AdapterVersion } from "../config/settings";

const getIC3ClientCDNUrl = (version = ic3ClientVersion): string => {
    const IC3ClientCDNUrl = `https://comms.omnichannelengagementhub.com/release/${version}/Scripts/SDK/SDK.min.js`;
    return IC3ClientCDNUrl;
}

const getIC3AdapterCDNUrl = (version = webChatIC3AdapterVersion): string => {
    const IC3AdapterCDNUrl = `https://webchatic3.blob.core.windows.net/webchat-ic3adapter/${version}/botframework-webchat-adapter-ic3.production.min.js`;
    return IC3AdapterCDNUrl;
}

const getACSAdapterCDNUrl = (version = webChatACSAdapterVersion): string => {
    const ACSAdapterCDNUrl = `https://unpkg.com/acs_webchat-chat-adapter@${version}/dist/chat-adapter.js`;
    return ACSAdapterCDNUrl;
}

const getDirectLineCDNUrl = (version = webChatDirectLineVersion): string => {
    const DirectLineCDNUrl = `https://unpkg.com/botframework-directlinejs@${version}/dist/directline.js`;
    return DirectLineCDNUrl;
}

export default {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl,
    getDirectLineCDNUrl
}

export {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl,
    getDirectLineCDNUrl
}