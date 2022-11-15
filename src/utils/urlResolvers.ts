import ChatSDKConfig from "../core/ChatSDKConfig";
import libraries from "./libraries";

const resolveIC3ClientUrl = (chatSDKConfig: ChatSDKConfig): string => {
    if (chatSDKConfig.ic3Config && 'ic3ClientCDNUrl' in chatSDKConfig.ic3Config) {
        return chatSDKConfig.ic3Config.ic3ClientCDNUrl as string;
    }

    if (chatSDKConfig.ic3Config && 'ic3ClientVersion' in chatSDKConfig.ic3Config) {
        return libraries.getIC3ClientCDNUrl(chatSDKConfig.ic3Config.ic3ClientVersion);
    }

    return libraries.getIC3ClientCDNUrl();
};

export default {
    resolveIC3ClientUrl
}

export {
    resolveIC3ClientUrl
}