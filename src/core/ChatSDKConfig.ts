import ChatAdapterConfig from "./messaging/ChatAdapterConfig";
import IC3Config from "./messaging/IC3Config";

interface DataMaskingSDKConfig {
    disable: boolean,
    maskingCharacter: string
}

interface TelemetrySDKConfig {
    disable: boolean,
    ariaTelemetryKey?: string,
    ariaCollectorUri?: string,
    runtimeId?: string
}

interface PersistentChatConfig {
    disable: boolean;
    tokenUpdateTime: number;
}

interface ChatReconnectConfig {
    disable: boolean;
}

interface CreateConversationConfig {
    disable: boolean;
}

/**
 * Non-backward compatible configurations or experimentals. Subject to change any time. Internal use only.
 * It should not be used by external clients unless explicitly stated in case fallback is needed.
 */
interface InternalChatSDKConfig {
    createCoreServicesOrgUrlAtRuntime?: boolean;
    disableAMSWhitelistedUrls?: boolean;
    disableAMSRegionBasedUrl?: boolean;
}

interface ChatSDKConfig {
    dataMasking?: DataMaskingSDKConfig,
    telemetry?: TelemetrySDKConfig,
    persistentChat?: PersistentChatConfig,
    chatReconnect?: ChatReconnectConfig,
    getAuthToken?: () => Promise<string|null>,
    ic3Config?: IC3Config,
    chatAdapterConfig?: ChatAdapterConfig,
    internalConfig?: InternalChatSDKConfig,
    ocUserAgent?: string[],
    useCreateConversation?: CreateConversationConfig
}

export {
    DataMaskingSDKConfig,
    PersistentChatConfig
};

export default ChatSDKConfig;
