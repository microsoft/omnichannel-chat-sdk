import { getOmnichannelChatSdkVersion } from "./version";

const setOcUserAgent = (OCClient: any, ocUserAgent?: string[]): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const version = getOmnichannelChatSdkVersion();
    const userAgent = `omnichannel-chat-sdk/${version}`;

    if (!OCClient.ocUserAgent) {
        OCClient.ocUserAgent = [];
    }

    OCClient.ocUserAgent = [userAgent, ...OCClient.ocUserAgent];

    if (ocUserAgent) {
        OCClient.ocUserAgent = [...ocUserAgent, ...OCClient.ocUserAgent];
    }
}

export default setOcUserAgent;