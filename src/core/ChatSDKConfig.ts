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

interface ChatTokenRenewalConfig {
    disable: boolean;
    /** Turns off retrying chat requests that fail with 401 while the token has not expired. */
    disableUnauthorizedRecovery?: boolean;
    /** Renewal stops after this many failures in a row. Default 8. */
    maxConsecutiveFailures?: number;
    /** Longest wait between renewal attempts after failures, in milliseconds. Default 600000 (10 minutes). */
    maxRetryCooldownInMs?: number;
    /** Renewal of an authenticated chat stops after this many HTTP 400/401/403 responses in a row. Default 3. */
    maxConsecutiveAuthFailures?: number;
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
    useCreateConversation?: CreateConversationConfig,
    chatTokenRenewal?: ChatTokenRenewalConfig
}

export {
    DataMaskingSDKConfig,
    PersistentChatConfig
};

export default ChatSDKConfig;
