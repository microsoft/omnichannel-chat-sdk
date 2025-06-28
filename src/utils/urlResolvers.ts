import ChatSDKConfig from "../core/ChatSDKConfig";
import ChatAdapterProtocols from "../core/messaging/ChatAdapterProtocols";
import libraries from "./libraries";

const resolveDirectLineCDNUrl = (chatSDKConfig: ChatSDKConfig) => {
    if (chatSDKConfig.chatAdapterConfig && 'webChatDirectLineCDNUrl' in chatSDKConfig.chatAdapterConfig) {
        return chatSDKConfig.chatAdapterConfig.webChatDirectLineCDNUrl as string;
    }

    if (chatSDKConfig.chatAdapterConfig && 'webChatDirectLineVersion' in chatSDKConfig.chatAdapterConfig) {
        return libraries.getDirectLineCDNUrl(chatSDKConfig.chatAdapterConfig.webChatDirectLineVersion);
    }

    return libraries.getDirectLineCDNUrl();
}

const resolveChatAdapterUrl = (chatSDKConfig: ChatSDKConfig, protocol: string): string => {
    if (protocol !== ChatAdapterProtocols.DirectLine) {
        throw new Error(`ChatAdapter for protocol ${protocol} currently not supported`);
    }

    return resolveDirectLineCDNUrl(chatSDKConfig);
};

export default {
    resolveChatAdapterUrl
}

export {
    resolveChatAdapterUrl
}