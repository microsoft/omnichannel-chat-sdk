import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('Performance @Performance', () => {
    test('ChatSDK.createChatAdapter()', async ({ page }) => {
        await page.goto(testPage);

        const [createChatAdapterResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes("https://unpkg.com/acs_webchat-chat-adapter");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { preloadChatAdapter } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                await preloadChatAdapter();
                let startTime = new Date();
                const chatAdapter = await chatSDK.createChatAdapter();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    timeTaken: timeTaken
                };

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { timeTaken } = runtimeContext;
        console.log("chatSDK.createChatAdapter(): " + timeTaken);

        expect(createChatAdapterResponse.status()).toBe(200);
    });
});