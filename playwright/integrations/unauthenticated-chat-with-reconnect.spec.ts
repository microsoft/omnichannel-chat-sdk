import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithChatReconnect');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithChatReconnect', () => {
    test('ChatSDK.getChatReconnectContext() with invalid reconnect id & redirect URL should only return a redirect URL', async ({ page }) => {
        await page.goto(testPage);

        const params = {
            reconnectId: "d7bceb8f-6199-431d-9a1c-59758f74515d" // Randomly generated GUUID
        };

        const [chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, reconnectRequest, reconnectResponse, runtimeContext] = await Promise.all([
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
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatReConnect);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatReConnect);
            }),
            await page.evaluate(async ({ omnichannelConfig, params }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    chatReconnect: {
                        disable: false,
                    }
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                const runtimeContext = {};

                await chatSDK.initialize();

                const chatReconnectContext = await chatSDK.getChatReconnectContext(params);
                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.reconnectId = chatReconnectContext.reconnectId;
                runtimeContext.redirectURL = chatReconnectContext.redirectURL;
                runtimeContext.requestId = chatSDK.requestId;

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, params })
        ]);

        const { reconnectId, redirectURL, requestId } = runtimeContext;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const reconnectRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatReConnect}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${params.reconnectId}`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        expect(reconnectRequest.url() === reconnectRequestUrl).toBe(true);
        expect(reconnectResponse.status()).toBe(200);
        expect(reconnectId).toBe(null);
        expect(redirectURL).not.toBe(null);
    });

    test('ChatSDK.getChatReconnectContext() with invalid reconnect id should not return any reconnect id', async ({ page }) => {
        await page.goto(testPage);

        const params = {
            reconnectId: "id"
        };

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, params }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    chatReconnect: {
                        disable: false,
                    },
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                const runtimeContext = {};

                await chatSDK.initialize();

                const chatReconnectContext = await chatSDK.getChatReconnectContext(params);

                runtimeContext.reconnectId = chatReconnectContext.reconnectId;

                return runtimeContext;
            }, { omnichannelConfig, params })
        ]);

        const { reconnectId } = runtimeContext;

        expect(reconnectId).toBe(null);
    });
});