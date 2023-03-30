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

                location.reload();

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

                runtimeContext.reconnectId = chatReconnectContext.reconnectId;

                await chatSDK.startChat(runtimeContext.reconnectId);

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
});