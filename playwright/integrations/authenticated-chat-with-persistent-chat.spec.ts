import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithPersistentChat');
const authUrl = fetchAuthUrl('AuthenticatedChatWithPersistentChat');

test.describe('AuthenticatedChat @AuthenticatedChatWithPersistentChat', () => {
    test('ChatSDK.getChatReconnectContext() should return a reconnect id if theres is an existing chat session', async ({ page }) => {
        await page.goto(testPage);

        const [reconnectableChatsRequest, reconnectableChatsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthReconnectableChats);
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
                        disable: false,
                        tokenUpdateTime: 21600000
                    },
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    authToken
                };

                const chatReconnectContext = chatSDK.getChatReconnectContext();

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
        expect(reconnectableChatsRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(reconnectableChatsResponse.status()).toBe(200);
    });
});