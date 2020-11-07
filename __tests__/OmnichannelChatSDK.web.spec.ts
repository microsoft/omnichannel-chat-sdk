/**
 * @jest-environment jsdom
 */

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

describe('Omnichannel Chat SDK (Web)', () => {
    const omnichannelConfig = {
        orgUrl: '',
        orgId: '',
        widgetId: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ChatSDK.createChatAdapter() should be returned succesfully on Web platform', async () => {
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
        } catch (error) {
            expect(error).not.toBeInstanceOf(Error);
        }
    });
});