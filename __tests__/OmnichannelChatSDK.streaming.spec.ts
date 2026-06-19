/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import LiveChatVersion from "../src/core/LiveChatVersion";
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";

describe('OmnichannelChatSDK - Streaming', () => {
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('onStreamingMessage()', () => {
        it('should call conversation.registerOnStreamingMessage()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn(),
                createConversation: jest.fn()
            };

            chatSDK.AMSClient = {
                initialize: jest.fn()
            };

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                registerOnNewMessage: jest.fn(),
                registerOnStreamingMessage: jest.fn()
            }));

            await chatSDK.startChat();

            const callback = jest.fn();
            await chatSDK.onStreamingMessage(callback);

            expect(chatSDK.conversation.registerOnStreamingMessage).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.registerOnStreamingMessage.mock.calls[0][0]).toBe(callback);
        });

        it('should throw if chat is not started (no conversation)', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            // Force V2 but don't start chat
            chatSDK.liveChatVersion = LiveChatVersion.V2;

            try {
                await chatSDK.onStreamingMessage(() => {});
                throw new Error('Expected to throw');
            } catch (error: any) {
                expect(error.message).toContain('UninitializedConversation');
            }
        });

        it('should throw if liveChatVersion is not V2', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            // Force V1
            chatSDK.liveChatVersion = LiveChatVersion.V1;
            chatSDK.conversation = { registerOnStreamingMessage: jest.fn() };

            try {
                await chatSDK.onStreamingMessage(() => {});
                throw new Error('Expected to throw');
            } catch (error: any) {
                expect(error.message).toContain('UnsupportedLiveChatVersion');
            }
        });
    });

    describe('supportsLcwStreaming flag in startChat', () => {
        const setupForStartChat = async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const chatToken = {
                ChatId: 'ChatId',
                Token: 'Token',
                RegionGtms: '{}'
            };
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve(chatToken));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'createConversation').mockResolvedValue(Promise.resolve(chatToken));

            return chatSDK;
        };

        it('should inject supportsLcwStreaming into customContextData when flag is true', async () => {
            const chatSDK = await setupForStartChat();

            await chatSDK.startChat({ supportsLcwStreaming: true });

            // createConversation is the default path (sessionInit only when useCreateConversation.disable)
            expect(chatSDK.OCClient.createConversation).toHaveBeenCalledTimes(1);
            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];
            const customContextData = requestOptionalParams.initContext.customContextData;

            expect(customContextData).toBeDefined();
            expect(customContextData.supportsLcwStreaming).toEqual({
                value: "true",
                isDisplayable: false
            });
        });

        it('should inject supportsLcwStreaming as "false" when flag is explicitly false', async () => {
            const chatSDK = await setupForStartChat();

            await chatSDK.startChat({ supportsLcwStreaming: false });

            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];
            const customContextData = requestOptionalParams.initContext.customContextData;

            expect(customContextData).toBeDefined();
            expect(customContextData.supportsLcwStreaming).toEqual({
                value: "false",
                isDisplayable: false
            });
        });

        it('should NOT inject supportsLcwStreaming when flag is omitted', async () => {
            const chatSDK = await setupForStartChat();

            await chatSDK.startChat();

            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];
            const customContextData = requestOptionalParams?.initContext?.customContextData;

            // Should not have supportsLcwStreaming at all
            if (customContextData) {
                expect(customContextData.supportsLcwStreaming).toBeUndefined();
            }
        });

        it('should preserve existing customContext when adding supportsLcwStreaming', async () => {
            const chatSDK = await setupForStartChat();

            await chatSDK.startChat({
                customContext: {
                    myKey: { value: "myValue", isDisplayable: true }
                },
                supportsLcwStreaming: true
            });

            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];
            const customContextData = requestOptionalParams.initContext.customContextData;

            // Custom context should still be present
            expect(customContextData.myKey).toEqual({ value: "myValue", isDisplayable: true });
            // And supportsLcwStreaming should also be there
            expect(customContextData.supportsLcwStreaming).toEqual({
                value: "true",
                isDisplayable: false
            });
        });

        it('should survive initContext override — supportsLcwStreaming injected after initContext', async () => {
            const chatSDK = await setupForStartChat();

            await chatSDK.startChat({
                initContext: {
                    locale: "en-US",
                    os: "Windows",
                },
                supportsLcwStreaming: true
            });

            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];
            const customContextData = requestOptionalParams.initContext.customContextData;

            // initContext override should be preserved
            expect(requestOptionalParams.initContext.locale).toBe("en-US");
            expect(requestOptionalParams.initContext.os).toBe("Windows");
            // supportsLcwStreaming should still be injected despite initContext override
            expect(customContextData).toBeDefined();
            expect(customContextData.supportsLcwStreaming).toEqual({
                value: "true",
                isDisplayable: false
            });
        });
    });

    describe('backward compatibility', () => {
        it('onNewMessage still works without onStreamingMessage registered', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn(),
                createConversation: jest.fn()
            };

            chatSDK.AMSClient = {
                initialize: jest.fn()
            };

            const registerOnNewMessageMock = jest.fn();
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                registerOnNewMessage: registerOnNewMessageMock,
                registerOnStreamingMessage: jest.fn()
            }));

            await chatSDK.startChat();
            await chatSDK.onNewMessage(() => {});

            expect(registerOnNewMessageMock).toHaveBeenCalledTimes(1);
        });

        it('startChat without supportsLcwStreaming does not affect session init', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK["isAMSClientAllowed"] = true;

            await chatSDK.initialize();

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const chatToken = {
                ChatId: 'ChatId',
                Token: 'Token',
                RegionGtms: '{}'
            };
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve(chatToken));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'createConversation').mockResolvedValue(Promise.resolve(chatToken));

            await chatSDK.startChat();

            // createConversation should be called normally
            expect(chatSDK.OCClient.createConversation).toHaveBeenCalledTimes(1);
            const requestOptionalParams = chatSDK.OCClient.createConversation.mock.calls[0][1];

            // No streaming-related data in the request
            const customContextData = requestOptionalParams?.initContext?.customContextData;
            if (customContextData) {
                expect(customContextData.supportsLcwStreaming).toBeUndefined();
            }
        });
    });
});
