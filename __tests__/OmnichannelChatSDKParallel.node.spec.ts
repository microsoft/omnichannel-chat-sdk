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

describe('Omnichannel Chat SDK (Node) Parallel initialization', () => {
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

        await chatSDK.initialize({ useParallelLoad: true });

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
        await chatSDK.initialize({ useParallelLoad: true });

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        // if chatSDK.AMSClient is null, retry 3 times before failing and wait 2 second between each retry

        while (chatSDK.AMSClient === null) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.createChatAdapter();
            fail("Error should have been thrown");
        } catch (error : any ) {
            console.log(error);
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
        await chatSDK.initialize({ useParallelLoad: true });

        while (chatSDK.AMSClient === null) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();

        jest.spyOn(console, 'error');

        await chatSDK.startChat();

        try {
            await chatSDK.getVoiceVideoCalling();
            fail("Error should have been thrown");
        } catch (error : any ) {
            console.log(error);
            expect(error.message).toEqual('UnsupportedPlatform');
            expect(console.error).toHaveBeenCalledWith('VoiceVideoCalling is only supported on browser');
        }
    });

    it('ChatSDK.getPersistentChatHistory() should work on Node.js platform with parallel initialization', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            persistentChat: { disable: false, tokenUpdateTime: 21600000 }
        });
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;
        chatSDK.OCClient = {
            getChatConfig: jest.fn().mockResolvedValue(Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: {
                    PreChatSurvey: { msdyn_prechatenabled: false },
                    msdyn_conversationmode: ConversationMode.PersistentChat
                },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: { msdyn_localeid: '1033' },
                LiveChatVersion: 2
            })),
            getPersistentChatHistory: jest.fn()
        };

        await chatSDK.initialize({ useParallelLoad: true });

        // Wait for AMSClient to be ready
        while (chatSDK.AMSClient === null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.OCClient.createConversation = jest.fn();

        // Set up persistent chat state
        chatSDK["isPersistentChat"] = true;
        chatSDK.authenticatedUserToken = 'test-auth-token';
        chatSDK.chatToken = { chatId: 'test-chat-id' };

        jest.spyOn(chatSDK.OCClient, 'getPersistentChatHistory').mockResolvedValue(Promise.resolve({
            conversationResponse: []
        }));

        const result = await chatSDK.getPersistentChatHistory();

        expect(chatSDK.OCClient.getPersistentChatHistory).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ conversationResponse: [] });
    });

    it('ChatSDK.getPersistentChatHistory() should throw error if not initialized with parallel load on Node.js', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };

        // Don't initialize
        chatSDK.isInitialized = false;

        try {
            await chatSDK.getPersistentChatHistory();
            fail("Error expected");
        } catch (error: any) {
            expect(error.message).toBe(ChatSDKErrorName.UninitializedChatSDK);
        }
    });

    describe('Mid-Conversation Authentication (MidAuth) - Node Parallel Initialization', () => {
        it('ChatSDK.startChat() with deferInitialAuth=true should work with parallel initialization on Node', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = { authenticationEndpoint: 'https://auth.endpoint' };
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize({ useParallelLoad: true });

            // Wait for AMSClient to be ready
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            jest.spyOn(chatSDK.OCClient, 'createConversation').mockResolvedValue(Promise.resolve({
                ChatId: 'test-chat-id',
                Token: 'test-token',
                RegionGtms: '{}'
            }));
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();

            chatSDK["deferInitialAuth"] = true;
            await chatSDK.startChat();

            // Verify chat started without authentication
            expect(chatSDK.authenticatedUserToken).toBe(null);
            expect(chatSDK.chatToken.chatId).toBe('test-chat-id');
        });

        it('ChatSDK.authenticateChat() should work after parallel initialization on Node', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize({ useParallelLoad: true });

            // Wait for AMSClient to be ready
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Set up active conversation
            chatSDK.conversation = { disconnect: jest.fn() };
            chatSDK.chatToken = { chatId: 'test-chat-id' };
            chatSDK.authenticatedUserToken = null;

            chatSDK.OCClient.midConversationAuthenticateChat = jest.fn().mockResolvedValue(Promise.resolve());

            await chatSDK.authenticateChat('node-parallel-auth-token');

            expect(chatSDK.OCClient.midConversationAuthenticateChat).toHaveBeenCalledTimes(1);
            expect(chatSDK.authenticatedUserToken).toBe('node-parallel-auth-token');
        });

        it('ChatSDK.authenticateChat() should throw error if no active conversation with parallel initialization on Node', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize({ useParallelLoad: true });

            // Wait for AMSClient to be ready
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

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

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});