import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('UnauthenticatedChat @UnauthenticatedChat', () => {
    test('ChatSDK.initialize() should fetch the live chat configuration', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
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
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(undefined);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.initialize() with sendCacheHeaders should pass the `Cache-Control` HTTP headers to the HTTP call', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

            const optionalParams = {
                    getLiveChatConfigOptionalParams: {
                        sendCacheHeaders: true
                    }
                };

                await chatSDK.initialize(optionalParams);

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();
        const cacheHeaders = 'no-store, must-revalidate, no-cache';

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(cacheHeaders);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.startChat() should fetch the chat token & perform session init', async ({page}) => {
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
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const chatTokenRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test('ChatSDK.endChat() should perform session close', async ({page}) => {
        await page.goto(testPage);

        const [sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const sessionCloseRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });

    test('ChatSDK.startChat() with a liveChatContext of a closed conversation should throw an \'ClosedConversation\' error', async ({page}) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    runtimeId: chatSDK.runtimeId,
                    requestId: chatSDK.requestId,
                };

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                await chatSDK.endChat();

                await sleep(3000); // Sleep to avoid race condition

                try {
                    await chatSDK.startChat({liveChatContext: liveChatContext});
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const expectedErrorMessage = "ClosedConversation";
        const {errorMessage} = runtimeContext;
        expect(errorMessage).toBe(expectedErrorMessage);
    });
});