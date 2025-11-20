import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchTestSettings from '../utils/fetchTestSettings';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import ResponseStatusCodes from '../utils/ResponseStatusCodes';
import fetchAuthToken from '../utils/fetchAuthToken';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithChatReconnect');
const authToken = fetchAuthToken('AuthenticatedChatWithChatReconnect');
const testSettings = fetchTestSettings('AuthenticatedChatWithChatReconnect');

test.describe('AuthenticatedChat @AuthenticatedChatWithChatReconnect', () => {
    test("ChatSDK.getChatReconnectContext() should not return a reconnect id if there's no existing chat session", async ({ page }) => {
        await page.goto(testPage);

        const [reconnectableChatsRequest, reconnectableChatsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && response.request().method() === 'GET';
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, uuidv4 } = window;

                const data = {
                    contactid: uuidv4() // Ensures it's a new user
                };

                const payload = {
                    method: "POST",
                    body: JSON.stringify(data)
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();

                runtimeContext.reconnectId = chatReconnectContext.reconnectId;

                await chatSDK.startChat();

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authToken, chatDuration: testSettings.chatDuration })
        ]);

        const { authToken:token, reconnectId, requestId } = runtimeContext;
        const reconnectableChatsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsResponse.status()).toBe(204);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(token);
        expect(reconnectId).toBe(null);
    });

    test("ChatSDK.getChatReconnectContext() should return a reconnect id if there's an existing chat session", async ({ page }) => {
        await page.goto(testPage);

        const [_, reconnectableChatsRequest, reconnectableChatsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };


                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authToken }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && response.request().method() === 'GET';
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };


                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();
                const {reconnectId} = chatReconnectContext;

                runtimeContext.reconnectId = reconnectId;

                await chatSDK.startChat({reconnectId});

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authToken, chatDuration: testSettings.chatDuration })
        ]);

        const { authToken:token, reconnectId, requestId } = runtimeContext;
        const reconnectableChatsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsResponse.status()).toBe(200);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(token);
        expect(reconnectId).not.toBe(null);
    });

    test("ChatSDK.startChat() with a valid reconnect id should reconnect to previous chat", async ({ page }) => {
        await page.goto(testPage);

        const [_, chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                    useCreateConversation: {
                        disable: true,
                    }
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authToken }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                    useCreateConversation: {
                        disable: true,
                    }
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();

                const { reconnectId } = chatReconnectContext;

                runtimeContext.reconnectId = reconnectId;

                await chatSDK.startChat({ reconnectId });

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authToken, chatDuration: testSettings.chatDuration })
        ]);

        const { requestId, reconnectId, authToken:token } = runtimeContext;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;

        const chatTokenRequestHeaders = chatTokenRequest.headers();
        const sessionInitRequestHeaders = sessionInitRequest.headers();

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenRequestHeaders['authenticatedusertoken']).toBe(token);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitRequestHeaders['authenticatedusertoken']).toBe(token);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test("ChatSDK.endChat() should close the chat reconnect session", async ({ page }) => {
        await page.goto(testPage);

        const [_, sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authToken }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();

                const { reconnectId } = chatReconnectContext;

                runtimeContext.reconnectId = reconnectId;

                await chatSDK.startChat({ reconnectId });

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authToken, chatDuration: testSettings.chatDuration })
        ]);

        const { reconnectId } = runtimeContext;
        const sessionCloseRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${reconnectId}?channelId=lcw&isReconnectChat=true`;

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });

    test('ChatSDK.getConversationDetails() should not fail after a reconnect session', async ({page}) => {
        await page.goto(testPage);

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                await chatSDK.initialize();

                await chatSDK.startChat();
                await sleep(3000); // wait to get conversation details
            }, { omnichannelConfig, authToken }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                await chatSDK.initialize();

                const chatReconnectContext = await chatSDK.getChatReconnectContext();
                const {reconnectId} = chatReconnectContext;

                await chatSDK.startChat({reconnectId});

                const conversationDetails = await chatSDK.getConversationDetails();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    reconnectId,
                    conversationDetails
                };

                return runtimeContext;
            }, { omnichannelConfig, authToken }),
        ]);

        const { requestId, reconnectId, conversationDetails } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).toBe(conversationDetails.state);
        expect(liveWorkItemDetailsResponseDataJson.ConversationId).toBe(conversationDetails.conversationId);
        expect(liveWorkItemDetailsResponseDataJson.CanRenderPostChat).toBe(conversationDetails.canRenderPostChat);
    });

    test('ChatSDK.getConversationDetails() with liveChatContext containing reconnectId after ChatSDK.endChat() was called should not fail', async ({page}) => {
        await page.goto(testPage);

        const [_, invalidLiveWorkItemDetailsRequest, invalidLiveWorkItemDetailsResponse, __, liveChatContextLiveWorkItemDetailsRequest, liveChatContextLiveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                await chatSDK.initialize();
                await sleep(3000);

                await chatSDK.startChat();
                await sleep(3000);

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authToken }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const chatReconnectContext = await chatSDK.getChatReconnectContext();
                const {reconnectId} = chatReconnectContext;

                await chatSDK.startChat({reconnectId});

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();
                runtimeContext.liveChatContext = liveChatContext;

                await sleep(chatDuration);

                await chatSDK.endChat();
                runtimeContext.invalidRequestId = chatSDK.requestId;

                const invalidRequestIdConversationDetails = await chatSDK.getConversationDetails();
                runtimeContext.invalidRequestIdConversationDetails = invalidRequestIdConversationDetails;

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authToken, chatDuration: testSettings.chatDuration }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const {liveChatContext} = runtimeContext;
                const liveChatContextConversationDetails = await chatSDK.getConversationDetails({liveChatContext});
                runtimeContext.liveChatContextConversationDetails = liveChatContextConversationDetails;

                return runtimeContext;
            }, { omnichannelConfig, authToken }),
        ]);

        const { invalidRequestId, liveChatContext, invalidRequestIdConversationDetails, liveChatContextConversationDetails } = runtimeContext;
        const invalidLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${invalidRequestId}?channelId=lcw`;
        const liveChatContextLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${liveChatContext.requestId}/${liveChatContext.reconnectId}?channelId=lcw`;

        expect(liveChatContext.reconnectId).toBeDefined();
        expect(invalidLiveWorkItemDetailsRequest.url() === invalidLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(ResponseStatusCodes.OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetails.includes(invalidLiveWorkItemDetailsResponse.status())).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsRequest.url() === liveChatContextLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsResponse.status()).toBe(200);
        expect(invalidRequestIdConversationDetails).toEqual({});
        expect(liveChatContextConversationDetails.state).not.toBeDefined();
        expect(liveChatContextConversationDetails.conversationId).not.toBeDefined();
        expect(liveChatContextConversationDetails.canRenderPostChat).not.toBeDefined();
    });
});