import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithReconnect');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithReconnect', () => {
    test('ChatSDK.getChatReconnectContext() with invalid reconnect id & redirect URL should only return a redirect URL', async ({ page }) => {
        await page.goto(testPage);

        const [chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    chatReconnect: {
                        disable: false,
                    },
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                const runtimeContext = {};

                await chatSDK.initialize();

                const params = {
                    reconnectId: omnichannelConfig.reconnectId
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext(params);

                runtimeContext.reconnectId = chatReconnectContext.reconnectId;
                runtimeContext.redirectURL = chatReconnectContext.redirectURL;
                runtimeContext.requestId = chatSDK.requestId;

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { reconnectId, redirectURL, requestId } = runtimeContext;
        const chatTokenRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);

        expect(reconnectId).toBe(null);
        expect(redirectURL).toBe('https://www.microsoft.com/');
    });
});