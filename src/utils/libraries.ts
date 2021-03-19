import { ic3ClientVersion, webChatIC3AdapterVersion } from "../config/settings";

const getIC3ClientCDNUrl = (version = ic3ClientVersion): string => {
    const IC3ClientCDNUrl = `https://comms.omnichannelengagementhub.com/release/${version}/Scripts/SDK/SDK.min.js`;
    return IC3ClientCDNUrl;
}

const getIC3AdapterCDNUrl = (version = webChatIC3AdapterVersion): string => {
    const IC3AdapterCDNUrl = `https://webchatic3.blob.core.windows.net/webchat-ic3adapter/${version}/botframework-webchat-adapter-ic3.production.min.js`;
    return IC3AdapterCDNUrl;
}

export default {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl
}

export {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl
}