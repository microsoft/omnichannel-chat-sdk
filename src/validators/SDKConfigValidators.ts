import IChatSDKConfig, { IDataMaskingSDKConfig } from "../core/IChatSDKConfig";

const defaultChatSDKConfig: IChatSDKConfig = {
    dataMasking: {
        disable: false,
        maskingCharacter: '#'
    }
};

/**
 * Validates data masking SDK config.
 * @param dataMaskingConfig DataMasking SDK Config.
 */
const validateDataMaskingConfig = (dataMaskingConfig: IDataMaskingSDKConfig) => {
    if (typeof dataMaskingConfig.disable !== "boolean") {
        dataMaskingConfig.disable = defaultChatSDKConfig.dataMasking.disable;
    }

    if (typeof dataMaskingConfig.maskingCharacter !== "string" || dataMaskingConfig.maskingCharacter.length !== 1) {
        dataMaskingConfig.maskingCharacter = defaultChatSDKConfig.dataMasking.maskingCharacter;
    }
}

const validateSDKConfig = (chatSDKConfig: IChatSDKConfig) => {
    if (chatSDKConfig.dataMasking) {
        validateDataMaskingConfig(chatSDKConfig.dataMasking);
    }
}

export {
    defaultChatSDKConfig
};

export default validateSDKConfig;