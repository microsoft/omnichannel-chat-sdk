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
        chatSDK.conversation = {
            disconnect: jest.fn(),
            removeListener: jest.fn(),
            addListener: jest.fn()
        };
        chatSDK.liveChatVersion = 2; // V2/ACS for addListener/removeListener support
        chatSDK.IC3Client = null;
        chatSDK.OCClient = { sessionId: null };
        chatSDK.refreshTokenTimer = null;
        chatSDK.closeChat = jest.fn().mockResolvedValue(undefined);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            completeScenario: jest.fn(),
            failScenario: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('React Native Platform', () => {
        beforeEach(() => {
            // Mock React Native environment
            (global as any).navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete (global as any).navigator;
        });

        it('should wait for conversational survey when enabled', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const endChatPromise = chatSDK.endChat();

            // Simulate survey start message (raw ACS event format)
            setTimeout(() => {
                messageCallback({
                    metadata: { tags: 'system,startconversationalsurvey' }
                });
            }, 10);

            // Simulate survey end message (raw ACS event format)
            setTimeout(() => {
                messageCallback({
                    metadata: { tags: 'system,endconversationalsurvey' }
                });
            }, 20);

            await endChatPromise;

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(conversationSpy.disconnect).toHaveBeenCalled();
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

            const conversationSpy = chatSDK.conversation;
            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(conversationSpy.disconnect).toHaveBeenCalled();
            expect(conversationSpy.addListener).not.toHaveBeenCalled();
        });

        it('should not wait for survey when isSessionEnded is true', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            const conversationSpy = chatSDK.conversation;
            await chatSDK.endChat({ isSessionEnded: true });

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(conversationSpy.disconnect).toHaveBeenCalled();
            expect(conversationSpy.addListener).not.toHaveBeenCalled();
        });

        it('should handle survey start message before survey end', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const endChatPromise = chatSDK.endChat();

            // Send survey messages in sequence
            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,startconversationalsurvey' } });
                setTimeout(() => {
                    messageCallback({ metadata: { tags: 'system,endconversationalsurvey' } });
                }, 10);
            }, 10);

            await endChatPromise;

            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });

        it('should ignore non-survey messages while waiting', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const endChatPromise = chatSDK.endChat();

            setTimeout(() => {
                // Send non-survey messages
                messageCallback({ metadata: { tags: 'customer' } });
                messageCallback({ metadata: { tags: 'agent' } });

                // Send survey start message
                messageCallback({ metadata: { tags: 'system,startconversationalsurvey' } });
            }, 10);

            // Send survey end message after start message
            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,endconversationalsurvey' } });
            }, 20);

            await endChatPromise;

            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });

        it('should cleanup listeners after survey completes', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const endChatPromise = chatSDK.endChat();

            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,startconversationalsurvey' } });
            }, 10);

            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,endconversationalsurvey' } });
            }, 20);

            await endChatPromise;

            // Verify removeListener was called with the exact same function reference
            // addListener is called 2x per waitForMessageTags (chatMessageReceived + chatMessageEdited),
            // and waitForMessageTags is called twice (start + end), so 4 total addListener calls.
            // The first call's callback is for the start-survey listener.
            const startCallback = conversationSpy.addListener.mock.calls[0][1];
            expect(conversationSpy.removeListener).toHaveBeenCalledWith("chatMessageReceived", startCallback);
            expect(conversationSpy.removeListener).toHaveBeenCalledWith("chatMessageEdited", startCallback);

            // The third call's callback is for the end-survey listener (calls 2 and 3 are indices 2,3)
            const endCallback = conversationSpy.addListener.mock.calls[2][1];
            expect(conversationSpy.removeListener).toHaveBeenCalledWith("chatMessageReceived", endCallback);
            expect(conversationSpy.removeListener).toHaveBeenCalledWith("chatMessageEdited", endCallback);
        });
    });

    describe('Web Platform', () => {
        beforeEach(() => {
            // Mock Web environment
            (global as any).window = { document: {} };
            delete (global as any).navigator;
        });

        afterEach(() => {
            delete (global as any).window;
        });

        it('should not wait for survey even when enabled', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            const conversationSpy = chatSDK.conversation;
            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(conversationSpy.disconnect).toHaveBeenCalled();
            expect(conversationSpy.addListener).not.toHaveBeenCalled();
        });

        it('should disconnect immediately', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            const conversationSpy = chatSDK.conversation;
            const startTime = Date.now();
            await chatSDK.endChat();
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(100); // Should complete quickly
            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });
    });

    describe('Telemetry', () => {
        beforeEach(() => {
            (global as any).navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete (global as any).navigator;
        });

        it('should log telemetry with correct metadata', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const requestId = chatSDK.requestId;
            const endChatPromise = chatSDK.endChat({ isSessionEnded: false });

            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,startconversationalsurvey' } });
            }, 10);

            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,endconversationalsurvey' } });
            }, 20);

            await endChatPromise;

            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(
                'WaitForConversationalSurvey',
                expect.objectContaining({
                    RequestId: requestId,
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

            const requestId = chatSDK.requestId;
            await chatSDK.endChat();

            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(
                'EndChat',
                expect.objectContaining({
                    RequestId: requestId,
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
            (global as any).navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete (global as any).navigator;
        });

        it('should handle listener registration errors', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn(() => { throw new Error('Registration failed'); });

            // Survey errors are caught and logged, but endChat still completes successfully
            await chatSDK.endChat();

            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });

        it('should handle message processing errors gracefully', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            let messageCallback: any;
            const conversationSpy = chatSDK.conversation;
            conversationSpy.addListener = jest.fn((event: string, callback: any) => {
                messageCallback = callback;
            });

            const endChatPromise = chatSDK.endChat();

            setTimeout(() => {
                // Simulate error in message processing - should not crash
                try {
                    messageCallback({ metadata: null }); // Invalid event - no metadata
                } catch (e) {
                    // Expected - error should be caught gracefully
                }

                // Send valid survey start message
                messageCallback({ metadata: { tags: 'system,startconversationalsurvey' } });
            }, 10);

            setTimeout(() => {
                messageCallback({ metadata: { tags: 'system,endconversationalsurvey' } });
            }, 20);

            await endChatPromise;

            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });
    });

    describe('Backward Compatibility', () => {
        beforeEach(() => {
            (global as any).navigator = { product: 'ReactNative' };
        });

        afterEach(() => {
            delete (global as any).navigator;
        });

        it('should handle widget calling endChat after survey completed', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'true';

            const conversationSpy = chatSDK.conversation;
            await chatSDK.endChat({ isSessionEnded: true });

            expect(chatSDK.closeChat).toHaveBeenCalledWith({ isSessionEnded: true });
            expect(conversationSpy.disconnect).toHaveBeenCalled();
            expect(conversationSpy.addListener).not.toHaveBeenCalled();
        });

        it('should handle endChat without parameters', async () => {
            chatSDK.liveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_isConversationalPostChatSurveyEnabled = 'false';

            const conversationSpy = chatSDK.conversation;
            await chatSDK.endChat();

            expect(chatSDK.closeChat).toHaveBeenCalled();
            expect(conversationSpy.disconnect).toHaveBeenCalled();
        });
    });
});
