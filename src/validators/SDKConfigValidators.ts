import ChatSDKConfig, { DataMaskingSDKConfig, PersistentChatConfig } from "../core/ChatSDKConfig";
import {ariaTelemetryKey} from "../config/settings";

const defaultChatSDKConfig: ChatSDKConfig = {
    dataMasking: {
        disable: false,
        maskingCharacter: '#'
    },
    telemetry: {
        disable: false,
        ariaTelemetryKey
    },
    persistentChat: {
        disable: true,
        tokenUpdateTime: 21600000
    },
    chatReconnect: {
        disable: true,
    }
};

/**
 * Validates data masking SDK config.
 * @param dataMaskingConfig DataMasking SDK Config.
 */
const validateDataMaskingConfig = (dataMaskingConfig: DataMaskingSDKConfig) => {
    if (typeof dataMaskingConfig.disable !== "boolean") {
        dataMaskingConfig.disable = defaultChatSDKConfig!.dataMasking!.disable; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    if (typeof dataMaskingConfig.maskingCharacter !== "string" || dataMaskingConfig.maskingCharacter.length !== 1) {
        dataMaskingConfig.maskingCharacter = defaultChatSDKConfig!.dataMasking!.maskingCharacter; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
}

const validatePersistentChatConfig = (persistentChatConfig: PersistentChatConfig): void => {
    if (typeof persistentChatConfig.tokenUpdateTime !== "number" || !persistentChatConfig.tokenUpdateTime) {
        persistentChatConfig.tokenUpdateTime = defaultChatSDKConfig!.persistentChat!.tokenUpdateTime; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
}

const validateSDKConfig = (chatSDKConfig: ChatSDKConfig): void => {
    if (chatSDKConfig.dataMasking) {
        validateDataMaskingConfig(chatSDKConfig.dataMasking);
    }

    if (chatSDKConfig.persistentChat) {
        validatePersistentChatConfig(chatSDKConfig.persistentChat);
    }
}

export {
    defaultChatSDKConfig
};

export default validateSDKConfig;