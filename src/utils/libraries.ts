import { ic3ClientVersion, webChatIC3AdapterVersion } from "../config/settings";

const getIC3ClientCDNUrl = () => {
    const IC3ClientCDNUrl: string =  `https://comms.omnichannelengagementhub.com/release/${ic3ClientVersion}/Scripts/SDK/SDK.min.js`;
    return IC3ClientCDNUrl;
}

const getIC3AdapterCDNUrl = () => {
    const IC3AdapterCDNUrl: string = `https://webchatic3.blob.core.windows.net/webchat-ic3adapter/${webChatIC3AdapterVersion}/botframework-webchat-adapter-ic3.production.min.js`;
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