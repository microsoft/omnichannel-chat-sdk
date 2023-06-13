import ACSEndpoints from '../utils/ACSEndpoints';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('Performance @Performance', () => {
    test('ChatSDK.getMessages()', async ({ page }) => {
        await page.goto(testPage);

        const content = "Hi";
        const [getMessagesResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && response.request().method() === 'GET'
            }),
            await page.evaluate(async ({ omnichannelConfig, content }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                await chatSDK.sendMessage({
                    content
                });

                let startTime = new Date();
                await chatSDK.getMessages();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    timeTaken: timeTaken
                };

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const { timeTaken } = runtimeContext;
        console.log("chatSDK.getMessages(): " + timeTaken);

        expect(getMessagesResponse.status()).toBe(200);
    });
});