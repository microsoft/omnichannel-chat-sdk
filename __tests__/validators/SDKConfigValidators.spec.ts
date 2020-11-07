import validateSDKConfig, {defaultChatSDKConfig} from '../../src/validators/SDKConfigValidators';

describe('SDKConfigValidators', () => {
    it('Data masking SDK config should be set to default values if not set', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.dataMasking = {};

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.dataMasking.disable).toBe(defaultChatSDKConfig.dataMasking.disable);
        expect(chatSDKConfig.dataMasking.maskingCharacter).toBe(defaultChatSDKConfig.dataMasking.maskingCharacter);
    });

    it('Data masking SDK config should to default values if not valid', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.dataMasking = {
            maskingCharacter: '@@'
        };

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.dataMasking.disable).toBe(defaultChatSDKConfig.dataMasking.disable);
        expect(chatSDKConfig.dataMasking.maskingCharacter).toBe(defaultChatSDKConfig.dataMasking.maskingCharacter);
    });

    it('Data masking SDK config masking character MUST be a string of length 1', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.dataMasking = {
            maskingCharacter: ''
        };

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.dataMasking.maskingCharacter.length).toBe(1);
    });
});