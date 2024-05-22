import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithTyping');
const authUrl = fetchAuthUrl('AuthenticatedChatWithTyping');

test.describe('AuthenticatedChat @AuthenticatedChatWithTyping', () => {
    test('ChatSDK.sendTyping() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();

                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                await chatSDK.sendTypingEvent();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId } = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.SendTypingIndicatorPath}/${requestId}`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.onTypingEvent() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                try {
                    chatSDK.onTypingEvent(() => {
                        console.log("Agent is typing...");
                    })
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });
});