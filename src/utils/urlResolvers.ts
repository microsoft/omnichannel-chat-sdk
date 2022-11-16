import ChatSDKConfig from "../core/ChatSDKConfig";
import LiveChatVersion from "../core/LiveChatVersion";
import ChatAdapterProtocols from "../core/messaging/ChatAdapterProtocols";
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

const resolveDirectLineCDNUrl = (chatSDKConfig: ChatSDKConfig) => {
    if (chatSDKConfig.chatAdapterConfig && 'webChatDirectLineCDNUrl' in chatSDKConfig.chatAdapterConfig) {
        return chatSDKConfig.chatAdapterConfig.webChatDirectLineCDNUrl as string;
    }

    if (chatSDKConfig.chatAdapterConfig && 'webChatDirectLineVersion' in chatSDKConfig.chatAdapterConfig) {
        return libraries.getDirectLineCDNUrl(chatSDKConfig.chatAdapterConfig.webChatDirectLineVersion);
    }

    return libraries.getDirectLineCDNUrl();
}

const resolveACSAdapterCDNUrl = (chatSDKConfig: ChatSDKConfig) => {
    if (chatSDKConfig.chatAdapterConfig && 'webChatACSAdapterCDNUrl' in chatSDKConfig.chatAdapterConfig) {
        return chatSDKConfig.chatAdapterConfig.webChatACSAdapterCDNUrl as string;
    }

    if (chatSDKConfig.chatAdapterConfig && 'webChatACSAdapterVersion' in chatSDKConfig.chatAdapterConfig) {
        return libraries.getACSAdapterCDNUrl(chatSDKConfig.chatAdapterConfig.webChatACSAdapterVersion);
    }

    return libraries.getACSAdapterCDNUrl();
};

const resolveIC3AdapterCDNUrl = (chatSDKConfig: ChatSDKConfig) => {
    if (chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterCDNUrl' in chatSDKConfig.chatAdapterConfig) {
        return chatSDKConfig.chatAdapterConfig.webChatIC3AdapterCDNUrl as string;
    }

    if (chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterVersion' in chatSDKConfig.chatAdapterConfig) {
        return libraries.getIC3AdapterCDNUrl(chatSDKConfig.chatAdapterConfig.webChatIC3AdapterVersion);
    }

    return libraries.getIC3AdapterCDNUrl();
};

const resolveChatAdapterUrl = (chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string): string => {
    const supportedChatAdapterProtocols = [ChatAdapterProtocols.ACS, ChatAdapterProtocols.IC3, ChatAdapterProtocols.DirectLine];
    if (protocol && !supportedChatAdapterProtocols.includes(protocol as string)) {
        throw new Error(`ChatAdapter for protocol ${protocol} currently not supported`);
    }

    if (protocol === ChatAdapterProtocols.DirectLine) {
        return resolveDirectLineCDNUrl(chatSDKConfig);
    } else if (protocol === ChatAdapterProtocols.ACS || liveChatVersion === LiveChatVersion.V2) {
        return resolveACSAdapterCDNUrl(chatSDKConfig);
    } else if (protocol === ChatAdapterProtocols.IC3 || liveChatVersion === LiveChatVersion.V1) {
        return resolveIC3AdapterCDNUrl(chatSDKConfig);
    }

    return '';
};

export default {
    resolveIC3ClientUrl,
    resolveChatAdapterUrl
}

export {
    resolveIC3ClientUrl,
    resolveChatAdapterUrl
}