import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithChatReconnect');
const authUrl = fetchAuthUrl('AuthenticatedChatWithChatReconnect');

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
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, uuidv4 } = window;

                const data = {
                    contactid: uuidv4() // Ensures it's a new user
                };

                const payload = {
                    method: "POST",
                    body: JSON.stringify(data)
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();

                runtimeContext.reconnectId = chatReconnectContext.reconnectId;

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { authToken } = runtimeContext;
        const reconnectableChatsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${omnichannelConfig.orgId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsResponse.status()).toBe(204);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(authToken);
    });

    test("ChatSDK.getChatReconnectContext() should return a reconnect id if there's an existing chat session", async ({ page }) => {
        await page.goto(testPage);

        const [_, reconnectableChatsRequest, reconnectableChatsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authUrl }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats) && response.request().method() === 'GET';
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext();
                const {reconnectId} = chatReconnectContext;

                runtimeContext.reconnectId = reconnectId;

                await chatSDK.startChat({reconnectId});

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { authToken } = runtimeContext;
        const reconnectableChatsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${omnichannelConfig.orgId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsResponse.status()).toBe(200);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(authToken);
    });

    test('ChatSDK.getConversationDetails() should not fail after a reconnect session', async ({page}) => {
        await page.goto(testPage);

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authUrl }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
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
                    requestId: chatSDK.requestId,
                    reconnectId,
                    conversationDetails
                };

                return runtimeContext;
            }, { omnichannelConfig, authUrl }),
        ]);

        const { requestId, reconnectId, conversationDetails } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;
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
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    chatReconnect: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authUrl }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
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

                await chatSDK.endChat();
                runtimeContext.invalidRequestId = chatSDK.requestId;

                const invalidRequestIdConversationDetails = await chatSDK.getConversationDetails();
                runtimeContext.invalidRequestIdConversationDetails = invalidRequestIdConversationDetails;

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authUrl }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
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
            }, { omnichannelConfig, authUrl }),
        ]);

        const { invalidRequestId, liveChatContext, invalidRequestIdConversationDetails, liveChatContextConversationDetails } = runtimeContext;
        const invalidLiveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${invalidRequestId}?channelId=lcw`;
        const liveChatContextLiveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${liveChatContext.requestId}/${liveChatContext.reconnectId}?channelId=lcw`;

        expect(liveChatContext.reconnectId).toBeDefined();
        expect(invalidLiveWorkItemDetailsRequest.url() === invalidLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(invalidLiveWorkItemDetailsResponse.status()).toBe(400);
        expect(liveChatContextLiveWorkItemDetailsRequest.url() === liveChatContextLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsResponse.status()).toBe(200);
        expect(invalidRequestIdConversationDetails).toEqual({});
        expect(liveChatContextConversationDetails.state).not.toBeDefined();
        expect(liveChatContextConversationDetails.conversationId).not.toBeDefined();
        expect(liveChatContextConversationDetails.canRenderPostChat).not.toBeDefined();
    });
});