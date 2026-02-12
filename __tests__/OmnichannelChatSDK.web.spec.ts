/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */

export {}; // Fix for "Cannot redeclare block-scoped variable 'OmnichannelChatSDK'"

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import * as settings from '../src/config/settings';

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import AriaTelemetry from "../src/telemetry/AriaTelemetry";
import CallingOptionsOptionSetNumber from "../src/core/CallingOptionsOptionSetNumber";
import { ChatSDKErrorName } from "../src/core/ChatSDKError";
import ConversationMode from '../src/core/ConversationMode';
import WebUtils from "../src/utils/WebUtils";
import libraries from "../src/utils/libraries";
import platform from "../src/utils/platform";

jest.mock('@microsoft/omnichannel-amsclient', () => ({default: jest.fn()}));
describe('Omnichannel Chat SDK (Web), Sequential', () => {
    (settings as any).ariaTelemetryKey = '';
    (AriaTelemetry as any)._disable = true;
    AWTLogManager.initialize = jest.fn();

    function fail(message = 'Test Expected to Fail') {
        throw new Error(message);
    }

    const omnichannelConfig = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(platform, 'isNode').mockReturnValue(true);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(false);
    });

    it('ChatSDK.startChat() with sendDefaultInitContext should pass getContext to OCClient.sessionInit()', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            useCreateConversation: {
                disable: true,
            }
        });
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

        const optionalParams = {
            sendDefaultInitContext: true
        }

        jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
            ChatId: '',
            Token: '',
            RegionGtms: '{}'
        }));

        jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();

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
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            useCreateConversation: {
                disable: true,
            }
        });
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

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
        jest.spyOn(console, 'error');

        try {
            await chatSDK.startChat(optionalParams);
            fail("Error expected");
        } catch (error : any ) {
            expect(error.message).toEqual(ChatSDKErrorName.UnsupportedPlatform);
            expect(console.error).toHaveBeenCalledWith("sendDefaultInitContext is only supported on browser");
        }
    });

    it('ChatSDK.createChatAdapter() should be returned succesfully on Web platform', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig ,);
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();
        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();

        await chatSDK.startChat();

        jest.spyOn(libraries, 'getIC3AdapterCDNUrl');
        jest.spyOn(WebUtils, 'loadScript');

        try {
            await chatSDK.createChatAdapter();
            expect(libraries.getIC3AdapterCDNUrl).toHaveBeenCalledTimes(1);
            expect(WebUtils.loadScript).toHaveBeenCalledTimes(1);
        } catch (error : any ) {
            expect(error).not.toBeInstanceOf(Error);
        }
    });

    it('ChatSDK.createChatAdapter() should not work if other protocol was set', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();
        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();

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
        } catch (error : any ) {
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
        chatSDK.OCClient.createConversation = jest.fn();
        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();

        await chatSDK.startChat();

        jest.spyOn(platform, 'isNode').mockReturnValue(false);
        jest.spyOn(console, 'error');

        try {
            await chatSDK.getVoiceVideoCalling();
        } catch (error : any ) {
            expect(error.message).toEqual('FeatureDisabled');
            expect(console.error).toHaveBeenCalledWith('Voice and video call is not enabled');
        }
    });

    it('ChatSDK.getPersistentChatHistory() should work on Web platform', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            persistentChat: { disable: false, tokenUpdateTime: 21600000 }
        });

        chatSDK.getChatToken = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;
        chatSDK.authenticatedUserToken = 'test-auth-token';

        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

        chatSDK["isPersistentChat"] = true;
        chatSDK.chatToken = { chatId: 'test-chat-id' };

        jest.spyOn(chatSDK.OCClient, 'getPersistentChatHistory').mockResolvedValue(Promise.resolve({
            chatMessages: [],
            nextPageToken: null
        }));

        jest.spyOn(platform, 'isNode').mockReturnValue(false);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

        const result = await chatSDK.getPersistentChatHistory();

        expect(chatSDK.OCClient.getPersistentChatHistory).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ chatMessages: [], nextPageToken: null });
    });

    it('ChatSDK.getPersistentChatHistory() should throw error if authenticated token is missing on Web', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            persistentChat: { disable: false, tokenUpdateTime: 21600000 }
        });

        chatSDK.getChatToken = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;
        chatSDK.authenticatedUserToken = null; // No auth token
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize();

        chatSDK["isPersistentChat"] = true;
        chatSDK.chatToken = { chatId: 'test-chat-id' };

        jest.spyOn(platform, 'isNode').mockReturnValue(false);
        jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
        jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

        try {
            await chatSDK.getPersistentChatHistory();
            fail("Error expected");
        } catch (error: any) {
            expect(error.message).toBe(ChatSDKErrorName.AuthenticatedUserTokenNotFound);
        }
    });

    describe('Mid-Conversation Authentication (MidAuth) - Web', () => {
        it('ChatSDK.authenticateChat() should work on Web platform', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            // Set up active conversation
            chatSDK.conversation = { disconnect: jest.fn() };
            chatSDK.chatToken = { chatId: 'test-chat-id' };
            chatSDK.authenticatedUserToken = null;

            chatSDK.OCClient.midConversationAuthenticateChat = jest.fn().mockResolvedValue(Promise.resolve());

            jest.spyOn(platform, 'isNode').mockReturnValue(false);
            jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
            jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

            await chatSDK.authenticateChat('web-auth-token');

            expect(chatSDK.OCClient.midConversationAuthenticateChat).toHaveBeenCalledTimes(1);
            expect(chatSDK.authenticatedUserToken).toBe('web-auth-token');
        });

        it('ChatSDK.startChat() with deferInitialAuth=true should work on Web platform', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = { authenticationEndpoint: 'https://auth.endpoint' };
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'createConversation').mockResolvedValue(Promise.resolve({
                ChatId: 'test-chat-id',
                Token: 'test-token',
                RegionGtms: '{}'
            }));
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();

            jest.spyOn(platform, 'isNode').mockReturnValue(false);
            jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
            jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

            chatSDK["deferInitialAuth"] = true;
            await chatSDK.startChat();

            // Verify chat started without authentication
            expect(chatSDK.authenticatedUserToken).toBe(null);
        });

        it('ChatSDK full MidAuth flow should work on Web: startChat with deferInitialAuth -> authenticateChat', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = { authenticationEndpoint: 'https://auth.endpoint' };
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'createConversation').mockResolvedValue(Promise.resolve({
                ChatId: 'test-chat-id',
                Token: 'test-token',
                RegionGtms: '{}'
            }));
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn().mockResolvedValue({ disconnect: jest.fn() });

            jest.spyOn(platform, 'isNode').mockReturnValue(false);
            jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
            jest.spyOn(platform, 'isBrowser').mockReturnValue(true);

            // Step 1: Start chat with deferred authentication
            chatSDK["deferInitialAuth"] = true;
            await chatSDK.startChat();

            expect(chatSDK.authenticatedUserToken).toBe(null);
            expect(chatSDK.chatToken.chatId).toBe('test-chat-id');

            // Step 2: Authenticate the chat mid-conversation
            chatSDK.OCClient.midConversationAuthenticateChat = jest.fn().mockResolvedValue(Promise.resolve());

            await chatSDK.authenticateChat('mid-conversation-token');

            expect(chatSDK.authenticatedUserToken).toBe('mid-conversation-token');
            expect(chatSDK.OCClient.midConversationAuthenticateChat).toHaveBeenCalledWith(
                chatSDK.requestId,
                {
                    chatId: 'test-chat-id',
                    authenticatedUserToken: 'mid-conversation-token'
                }
            );
        });
    });
});