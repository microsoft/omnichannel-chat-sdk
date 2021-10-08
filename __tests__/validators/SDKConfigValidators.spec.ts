import validateSDKConfig, {defaultChatSDKConfig} from '../../src/validators/SDKConfigValidators';

describe('SDKConfigValidators', () => {
    it('Data masking SDK config should be set to default values if not set', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.dataMasking = {};

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.dataMasking).toStrictEqual(defaultChatSDKConfig.dataMasking);
    });

    it('Data masking SDK config should to default values if not valid', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.dataMasking = {
            disable: 123,
            maskingCharacter: '@@'
        };

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.dataMasking.disable).toBe(defaultChatSDKConfig!.dataMasking!.disable);
        expect(chatSDKConfig.dataMasking.maskingCharacter).toBe(defaultChatSDKConfig!.dataMasking!.maskingCharacter);
        expect(chatSDKConfig.dataMasking.maskingCharacter.length).toBe(1);
    });

    it('Persistent Chat Token Update Time SDK config should be set to default values if not set', () => {
        const chatSDKConfig: any = {};
        chatSDKConfig.persistentChat = {
            disable: false
        };

        validateSDKConfig(chatSDKConfig);

        expect(chatSDKConfig.persistentChat.tokenUpdateTime).toBeDefined();
        expect(chatSDKConfig.persistentChat.tokenUpdateTime).toStrictEqual(defaultChatSDKConfig!.persistentChat!.tokenUpdateTime);
    });
});