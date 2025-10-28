import { getOmnichannelChatSdkVersion } from "./version";
import ocSDKConfiguration from "../config/ocSDKConfiguration";

const createOcSDKConfiguration = (useCoreServices: boolean, customUserAgent?: string[]): {[key: string]: number | boolean | string[]} => {
    const version = getOmnichannelChatSdkVersion();
    const chatSdkUserAgent = `omnichannel-chat-sdk/${version}`;

    // Combine custom user agents with the chat SDK user agent
    const userAgents = customUserAgent ? [...customUserAgent, chatSdkUserAgent] : [chatSdkUserAgent];

    const configuration = {
        ...ocSDKConfiguration,
        ocUserAgent: userAgents
    };

    if (useCoreServices) {
        configuration.useUnauthReconnectIdSigQueryParam = true;
    }

    return configuration;
};

export default createOcSDKConfiguration;