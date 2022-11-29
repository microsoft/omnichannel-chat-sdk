import { test, expect } from '@playwright/test';
import {join} from 'path';

const testPage = join('file:', __dirname, '..', 'public', 'index.html');
const omnichannelConfig = {
    orgId: "",
    orgUrl: "",
    widgetId: ""
};

test.describe('UnauthenticatedChat @UnauthenticatedChat', () => {
    test('ChatSDK.initialize() should fetch the live chat configuration', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes("livechatconnector/config");
            }),
            page.waitForResponse(response => {
                return response.url().includes("livechatconnector/config");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                chatSDK.setDebug(true);
                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const liveChatConfigPath = "livechatconnector/config";
        const requestUrl = `${omnichannelConfig.orgUrl}/${liveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(undefined);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.initialize() with sendCacheHeaders should pass the `Cache-Control` HTTP headers to the HTTP call', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes("livechatconnector/config");
            }),
            page.waitForResponse(response => {
                return response.url().includes("livechatconnector/config");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                const optionalParams = {
                    getLiveChatConfigOptionalParams: {
                        sendCacheHeaders: true
                    }
                };

                chatSDK.setDebug(true);
                await chatSDK.initialize(optionalParams);

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const liveChatConfigPath = "livechatconnector/config";
        const requestUrl = `${omnichannelConfig.orgUrl}/${liveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();
        const cacheHeaders = 'no-store, must-revalidate, no-cache';

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(cacheHeaders);
        expect(response.status()).toBe(200);
    });
});