/**
 * @jest-environment jsdom
 */

export {}; // Fix for "Cannot redeclare block-scoped variable 'OmnichannelChatSDK'"

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import libraries from "../src/utils/libraries";
import platform from "../src/utils/platform";
import WebUtils from "../src/utils/WebUtils";
import CallingOptionsOptionSetNumber from "../src/core/CallingOptionsOptionSetNumber";
import AriaTelemetry from "../src/telemetry/AriaTelemetry";
import * as settings from '../src/config/settings';
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import ChatSDKErrors from "../src/core/ChatSDKErrors";

describe('Omnichannel Chat SDK (Web)', () => {
    (settings as any).ariaTelemetryKey = '';
    (AriaTelemetry as any)._disable = true;
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '',
        orgId: '',
        widgetId: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(platform, 'isNode').mockReturnValue(true);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(false);
    });

    it('ChatSDK.startChat() with sendDefaultInitContext should pass getContext to OCClient.sessionInit()', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

        chatSDK.IC3Client = {
            initialize: jest.fn(),
            joinConversation: jest.fn()
        }

        const optionalParams = {
            sendDefaultInitContext: true
        }

        jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
            ChatId: '',
            Token: '',
            RegionGtms: '{}'
        }));

        jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

        jest.spyOn(platform, 'isNode').mockReturnValue(false);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

        await chatSDK.startChat(optionalParams);

        const sessionInitOptionalParams = {
            getContext: optionalParams.sendDefaultInitContext
        }

        expect(chatSDK.OCClient.sessionInit.mock.calls[0][1]).toMatchObject(sessionInitOptionalParams);
    });

    it('ChatSDK.startChat() with sendDefaultInitContext should throw an error if not used on Web Platform', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

        chatSDK.IC3Client = {
            initialize: jest.fn(),
            joinConversation: jest.fn()
        }

        const optionalParams = {
            sendDefaultInitContext: true
        }

        jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
            ChatId: '',
            Token: '',
            RegionGtms: '{}'
        }));

        jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

        jest.spyOn(platform, 'isNode').mockReturnValue(true);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(false);

        try {
            await chatSDK.startChat(optionalParams);
        } catch (error) {
            expect(error.message).toEqual(ChatSDKErrors.UnsupportedPlatform);
        }
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

        jest.spyOn(libraries, 'getIC3AdapterCDNUrl');
        jest.spyOn(WebUtils, 'loadScript');

        try {
            await chatSDK.createChatAdapter();
            expect(libraries.getIC3AdapterCDNUrl).toHaveBeenCalledTimes(1);
            expect(WebUtils.loadScript).toHaveBeenCalledTimes(1);
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

        const protocol = 'UnsupportedProtocol';
        const optionalParams = {
            protocol
        }
        try {
            await chatSDK.createChatAdapter(optionalParams);
        } catch (error) {
            expect(error).toEqual(`ChatAdapter for protocol ${protocol} currently not supported`);
        }
    });

    it('ChatSDK.getVoiceVideoCalling() should not work if callingOption is set to \'NoCalling\'', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize();

        chatSDK.callingOption = CallingOptionsOptionSetNumber.NoCalling;
        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.IC3Client.initialize = jest.fn();
        chatSDK.IC3Client.joinConversation = jest.fn();

        await chatSDK.startChat();

        jest.spyOn(platform, 'isNode').mockReturnValue(false);

        try {
            await chatSDK.getVoiceVideoCalling();
        } catch (error) {
            expect(error.message).toEqual('FeatureDisabled');
        }
    });
});