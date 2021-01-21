/**
 * @jest-environment jsdom
 */

export {}; // Fix for "Cannot redeclare block-scoped variable 'OmnichannelChatSDK'"

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import platform from "../src/utils/platform";

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

    it('ChatSDK.createChatAdapter() should not work if other protocol was set', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.IC3Client.initialize = jest.fn();
        chatSDK.IC3Client.joinConversation = jest.fn();

        await chatSDK.startChat();

        jest.spyOn(platform, 'isNode').mockReturnValue(false);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

        const protocol = 'DirectLine';
        try {
            await chatSDK.createChatAdapter(protocol);
        } catch (error) {
            console.log(error);
            expect(error).toEqual(`ChatAdapter for protocol ${protocol} currently not supported`);
        }
    });
});