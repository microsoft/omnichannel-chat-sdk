import IChatSDKConfig, { IDataMaskingSDKConfig, PersistentChatConfig } from "../core/IChatSDKConfig";
import {ariaTelemetryKey} from "../config/settings";

const defaultChatSDKConfig: IChatSDKConfig = {
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
const validateDataMaskingConfig = (dataMaskingConfig: IDataMaskingSDKConfig) => {
    if (typeof dataMaskingConfig.disable !== "boolean") {
        dataMaskingConfig.disable = defaultChatSDKConfig!.dataMasking!.disable; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    if (typeof dataMaskingConfig.maskingCharacter !== "string" || dataMaskingConfig.maskingCharacter.length !== 1) {
        dataMaskingConfig.maskingCharacter = defaultChatSDKConfig!.dataMasking!.maskingCharacter; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
}

const validatePersistentChatConfig = (persistentChatConfig: PersistentChatConfig): void => {
    if (typeof persistentChatConfig.tokenUpdateTime !== "number" || !persistentChatConfig.tokenUpdateTime) {
        persistentChatConfig.tokenUpdateTime = defaultChatSDKConfig.persistentChat!.tokenUpdateTime;
    }
}

const validateSDKConfig = (chatSDKConfig: IChatSDKConfig): void => {
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