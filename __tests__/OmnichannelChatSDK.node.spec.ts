/**
 * @jest-environment node
 */

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

describe('Omnichannel Chat SDK (Node)', () => {
    const omnichannelConfig = {
        orgUrl: '',
        orgId: '',
        widgetId: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ChatSDK.createChatAdapter() should not work on React Native platform', async () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';
        const errorMessage = 'ChatAdapter is only supported on browser';

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.IC3Client.initialize = jest.fn();
        chatSDK.IC3Client.joinConversation = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.createChatAdapter();
            console.log(chatSDK.createChatAdapter().rejects);
        } catch (error) {
            expect(error).toEqual(errorMessage);
        }
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});