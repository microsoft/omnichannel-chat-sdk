/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment node
 */

import * as settings from '../src/config/settings';

import { ChatSDKError, ChatSDKErrorName } from "../src/core/ChatSDKError";

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import ConversationMode from '../src/core/ConversationMode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

describe('Omnichannel Chat SDK (Node), Sequential', () => {
    (settings as any).ariaTelemetryKey = '';
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
        if (global.navigator) {
            (global as any).navigator = undefined;
        }

        if (global.window.document) {
            (global as any).window.document = undefined;
        }

        jest.clearAllMocks();
    });

    it('ChatSDK.startChat() with sendDefaultInitContext should not work on non-browser platform', async () => {

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;

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

        const errorMessage = 'UnsupportedPlatform';
        let failure = false;

        try {
            await chatSDK.startChat(optionalParams);
            fail("Error expected");
        } catch (error : any ) {
            failure = true;
            expect(error.message).toBe(errorMessage);
        }

        expect(failure).toBe(true);
    });

    it('ChatSDK.createChatAdapter() should not work on React Native platform', async () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;

        await chatSDK.initialize();

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.createChatAdapter();
            fail("Error expected");
        } catch (error : any ) {
            expect(error).toEqual('ChatAdapter is only supported on browser');
        }
    });

    it('ChatSDK.getVoiceVideoCalling() should not work on React Native platform', async () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;

        await chatSDK.initialize();

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();

        jest.spyOn(console, 'error');

        await chatSDK.startChat();

        try {
            await chatSDK.getVoiceVideoCalling();
            fail("Error expected");
        } catch (error : any ) {
            expect(error.message).toEqual('UnsupportedPlatform');
            expect(console.error).toHaveBeenCalledWith('VoiceVideoCalling is only supported on browser');
        }
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });

    describe('Mid-Conversation Authentication (MidAuth) - Node', () => {
        it('ChatSDK.authenticateChat() should work on Node platform', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            // Set up active conversation
            chatSDK.conversation = { disconnect: jest.fn() };
            chatSDK.chatToken = { chatId: 'test-chat-id' };
            chatSDK.authenticatedUserToken = null;

            chatSDK.OCClient.midConversationAuthenticateChat = jest.fn().mockResolvedValue(Promise.resolve());

            await chatSDK.authenticateChat('node-auth-token');

            expect(chatSDK.OCClient.midConversationAuthenticateChat).toHaveBeenCalledTimes(1);
            expect(chatSDK.authenticatedUserToken).toBe('node-auth-token');
        });

        it('ChatSDK.startChat() with deferInitialAuth=true should work on Node platform', async () => {
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
            chatSDK.AMSClient = { initialize: jest.fn() };

            chatSDK["deferInitialAuth"] = true;
            await chatSDK.startChat();

            // Verify chat started without authentication
            expect(chatSDK.authenticatedUserToken).toBe(null);
        });

        it('ChatSDK.authenticateChat() should throw error if no active conversation on Node platform', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            // conversation is null, chatToken.chatId is not set
            chatSDK.conversation = null;
            chatSDK.chatToken = {};

            try {
                await chatSDK.authenticateChat('test-token');
                fail("Error expected");
            } catch (error: any) {
                expect(error.message).toBe('InvalidConversation');
            }
        });
    });
});