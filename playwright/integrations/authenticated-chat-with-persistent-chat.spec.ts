import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithPersistentChat');
const authUrl = fetchAuthUrl('AuthenticatedChatWithPersistentChat');

test.describe('AuthenticatedChat @AuthenticatedChatWithPersistentChat', () => {
    test('ChatSDK.endChat() without any reconnect id should call session close with isPersistentChat=true as query params', async ({ page }) => {
        await page.goto(testPage);

        const [reconnectableChatsResponse, sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
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
                    persistentChat: {
                        disable: false
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId } = runtimeContext;
        const sessionCloseRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw&isPersistentChat=true`;

        expect(reconnectableChatsResponse.status()).toBe(204);
        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });

    test("ChatSDK.startChat() should have a reconnect id if there's an existing chat session", async ({ page }) => {
        await page.goto(testPage);

        const [_, reconnectableChatsRequest, reconnectableChatsResponse, chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    persistentChat: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authUrl }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
            }),
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
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    persistentChat: {
                        disable: false
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId, authToken } = runtimeContext;
        const reconnectableChatsResponseData = JSON.parse(await reconnectableChatsResponse.text());
        const reconnectId = reconnectableChatsResponseData.reconnectid;
        const reconnectableChatsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${omnichannelConfig.orgId}?channelId=lcw`;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}/${reconnectId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();
        const chatTokenRequestHeaders = chatTokenRequest.headers();
        const sessionInitRequestHeaders = sessionInitRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(reconnectableChatsResponse.status()).toBe(200);
        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test("ChatSDK.startChat() should not have any reconnect id if there's no existing chat session", async ({ page }) => {
        await page.goto(testPage);

        const [reconnectableChatsRequest, reconnectableChatsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
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
                    persistentChat: {
                        disable: false
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { authToken } = runtimeContext;
        const reconnectableChatsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthReconnectableChats}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${omnichannelConfig.orgId}?channelId=lcw`;

        const reconnectableChatsRequestHeaders = reconnectableChatsRequest.headers();

        expect(reconnectableChatsRequest.url() === reconnectableChatsRequestUrl).toBe(true);
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(reconnectableChatsResponse.status()).toBe(204);
    });
  
    test('ChatSDK.endChat() on an existing session should call session close with isPersistentChat=true & isReconnectChat=true as query params', async ({ page }) => {
        await page.goto(testPage);

        const [_, sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    persistentChat: {
                        disable: false,
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
            }, { omnichannelConfig, authUrl }),

            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
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
                    persistentChat: {
                        disable: false
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId } = runtimeContext;
        const sessionCloseRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw&isReconnectChat=true&isPersistentChat=true`;

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });
});