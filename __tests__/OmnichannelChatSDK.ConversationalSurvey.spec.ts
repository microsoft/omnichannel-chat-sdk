/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AWTLogManager } = require("../src/external/aria/webjs/AriaSDK");

describe('OmnichannelChatSDK - Conversational Survey', () => {
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: 'https://test.omnichannelengagementhub.com',
        orgId: 'test-org-id',
        widgetId: 'test-widget-id'
    };

    let chatSDK: any;

    beforeEach(() => {
        chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.isInitialized = true;
        chatSDK.chatToken = { chatId: 'test-chat-id' };
        chatSDK.liveChatConfig = {
            LiveWSAndLiveChatEngJoin: {
                msdyn_isConversationalPostChatSurveyEnabled: 'false'
            }
        };
        chatSDK.conversation = { disconnect: jest.fn() };
        chatSDK.IC3Client = null;
        chatSDK.OCClient = { sessionId: null };
        chatSDK.refreshTokenTimer = null;
        chatSDK.closeChat = jest.fn().mockResolvedValue(undefined);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            completeScenario: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('React Native Platform', () => {
        beforeEach(() => {
            // Mock React Native environment
            global.navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete global.navigator;
        });

        it('should wait for conversational survey when enabled', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            chatSDK.onNewMessage = jest.fn(callback => {
                messageCallback = callback;
                return Promise.resolve();
            });

            const endChatPromise = chatSDK.endChat();

            // Simulate survey start message
            setTimeout(() => {
                messageCallback({
                    tags: ['system', 'startconversationalsurvey']
                });
            }, 10);

            // Simulate survey end message
            setTimeout(() => {
                messageCallback({
                    tags: ['system', 'endconversationalsurvey']
                });
            }, 20);

            await endChatPromise;

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(
                'WaitForConversationalSurvey',
                expect.objectContaining({
                    IsReactNative: true,
                    SurveyEnabled: true,
                    WaitingForSurvey: true
                })
            );
        });

        it('should not wait for survey when config disabled', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'false';
            chatSDK.onNewMessage = jest.fn();

            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
            expect(chatSDK.onNewMessage).not.toHaveBeenCalled();
        });

        it('should not wait for survey when isSessionEnded is true', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';
            chatSDK.onNewMessage = jest.fn();

            await chatSDK.endChat({ isSessionEnded: true });

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
            expect(chatSDK.onNewMessage).not.toHaveBeenCalled();
        });

        it('should handle survey start message before survey end', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            chatSDK.onNewMessage = jest.fn(callback => {
                messageCallback = callback;
                return Promise.resolve();
            });

            const endChatPromise = chatSDK.endChat();

            // Send survey messages in sequence
            setTimeout(() => {
                messageCallback({ tags: ['system', 'startconversationalsurvey'] });
                setTimeout(() => {
                    messageCallback({ tags: ['system', 'endconversationalsurvey'] });
                }, 10);
            }, 10);

            await endChatPromise;

            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
        });

        it('should ignore non-survey messages while waiting', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            chatSDK.onNewMessage = jest.fn(callback => {
                messageCallback = callback;
                return Promise.resolve();
            });

            const endChatPromise = chatSDK.endChat();

            setTimeout(() => {
                // Send non-survey messages
                messageCallback({ tags: ['customer'] });
                messageCallback({ tags: ['agent'] });

                // Send survey messages
                messageCallback({ tags: ['system', 'startconversationalsurvey'] });
                messageCallback({ tags: ['system', 'endconversationalsurvey'] });
            }, 10);

            await endChatPromise;

            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
        });
    });

    describe('Web Platform', () => {
        beforeEach(() => {
            // Mock Web environment
            global.window = { document: {} };
            delete global.navigator;
        });

        afterEach(() => {
            delete global.window;
        });

        it('should not wait for survey even when enabled', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';
            chatSDK.onNewMessage = jest.fn();

            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
            expect(chatSDK.onNewMessage).not.toHaveBeenCalled();
        });

        it('should disconnect immediately', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            const startTime = Date.now();
            await chatSDK.endChat();
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(100); // Should complete quickly
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
        });
    });

    describe('Telemetry', () => {
        beforeEach(() => {
            global.navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete global.navigator;
        });

        it('should log telemetry with correct metadata', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            chatSDK.onNewMessage = jest.fn(callback => {
                messageCallback = callback;
                return Promise.resolve();
            });

            const endChatPromise = chatSDK.endChat({ isSessionEnded: false });

            setTimeout(() => {
                messageCallback({ tags: ['system', 'startconversationalsurvey'] });
                messageCallback({ tags: ['system', 'endconversationalsurvey'] });
            }, 10);

            await endChatPromise;

            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(
                'WaitForConversationalSurvey',
                expect.objectContaining({
                    RequestId: chatSDK.requestId,
                    ChatId: 'test-chat-id',
                    IsReactNative: true,
                    SurveyEnabled: true,
                    IsSessionEnded: false,
                    WaitingForSurvey: true
                })
            );

            expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(
                'WaitForConversationalSurvey',
                expect.objectContaining({
                    IsReactNative: true,
                    SurveyEnabled: true
                })
            );
        });

        it('should log when survey is not waited for', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'false';

            await chatSDK.endChat();

            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(
                'EndChat',
                expect.objectContaining({
                    RequestId: chatSDK.requestId,
                    ChatId: 'test-chat-id'
                })
            );

            // WaitForConversationalSurvey should not be logged
            expect(chatSDK.scenarioMarker.startScenario).not.toHaveBeenCalledWith(
                'WaitForConversationalSurvey',
                expect.anything()
            );
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            global.navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete global.navigator;
        });

        it('should handle onNewMessage listener registration errors', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';
            chatSDK.onNewMessage = jest.fn().mockRejectedValue(new Error('Listener registration failed'));

            await expect(chatSDK.endChat()).rejects.toThrow('Listener registration failed');
        });

        it('should handle message processing errors gracefully', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            chatSDK.onNewMessage = jest.fn(callback => {
                messageCallback = callback;
                return Promise.resolve();
            });

            const endChatPromise = chatSDK.endChat();

            setTimeout(() => {
                // Simulate error in message processing - should not crash
                try {
                    messageCallback({ tags: null }); // Invalid message
                } catch (e) {
                    // Expected
                }

                // Send valid messages
                messageCallback({ tags: ['system', 'startconversationalsurvey'] });
                messageCallback({ tags: ['system', 'endconversationalsurvey'] });
            }, 10);

            await endChatPromise;

            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
        });
    });

    describe('Backward Compatibility', () => {
        beforeEach(() => {
            global.navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete global.navigator;
        });

        it('should handle widget calling endChat after survey completed', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';
            chatSDK.onNewMessage = jest.fn();

            await chatSDK.endChat({ isSessionEnded: true });

            expect(chatSDK.closeChat).toHaveBeenCalledWith({ isSessionEnded: true });
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
            expect(chatSDK.onNewMessage).not.toHaveBeenCalled();
        });

        it('should handle endChat without parameters', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'false';

            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(chatSDK.conversation.disconnect).toHaveBeenCalled();
        });
    });
});
