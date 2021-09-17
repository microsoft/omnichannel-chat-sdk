import { ic3ClientVersion, webChatIC3AdapterVersion, webChatACSAdapterVersion } from "../config/settings";

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

export default {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl
}

export {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl
}