import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTyping');

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTyping', () => {
    test('ChatSDK.sendTyping() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();

                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                await chatSDK.sendTypingEvent();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.SendTypingIndicatorPath}/${requestId}`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.onTypingEvent() should not fail', async ({page}) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig}) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

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
            }, { omnichannelConfig})
        ]);

        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });
});