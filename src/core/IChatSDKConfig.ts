import ChatAdapterConfig from "./ChatAdapterConfig";
import IC3Config from "./IC3Config";

interface IDataMaskingSDKConfig {
    disable: boolean,
    maskingCharacter: string
}

interface TelemetrySDKConfig {
    disable: boolean,
    ariaTelemetryKey?: string
}

interface PersistentChatConfig {
    disable: boolean;
    tokenUpdateTime: number;
}

interface ChatReconnectConfig {
    disable: boolean;
}

interface IChatSDKConfig {
    dataMasking?: IDataMaskingSDKConfig,
    telemetry?: TelemetrySDKConfig,
    persistentChat?: PersistentChatConfig,
    chatReconnect?: ChatReconnectConfig,
    getAuthToken?: () => Promise<string|null>,
    ic3Config?: IC3Config,
    chatAdapterConfig?: ChatAdapterConfig
}

export {
    IDataMaskingSDKConfig,
    PersistentChatConfig
};

export default IChatSDKConfig;
