import { test, expect } from '@playwright/test';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('Performance @Performance', () => {
    test('ChatSDK.getLiveChatConfig()', async ({ page }) => {
        await page.goto(testPage);

        const [response, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                const optionalParams = {
                    getLiveChatConfigOptionalParams: {
                        sendCacheHeaders: true
                    }
                };

                await chatSDK.initialize(optionalParams);

                await chatSDK.startChat();

                let startTime = new Date();
                const chatConfig = await chatSDK.getLiveChatConfig();
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
        console.log("chatSDK.getLiveChatConfig(): " + timeTaken);

        expect(response.status()).toBe(200);
    });
});