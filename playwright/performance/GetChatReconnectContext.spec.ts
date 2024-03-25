import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithChatReconnect');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getChatReconnectContext()', async ({ page }) => {
        await page.goto(testPage);
        const params = {
            reconnectId: "reconnectId"
        };

        let [response, runtimeContext ] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatReConnect);
            }),

            await page.evaluate(async ({ omnichannelConfig, params }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    chatReconnect: {
                        disable: false,
                    },
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                let startTime = new Date();
                await chatSDK.getChatReconnectContext(params);
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    timeTaken: timeTaken
                };

                return runtimeContext;
            }, { omnichannelConfig, params })
        ]);

        console.log("chatSDK.getChatReconnectContext(): " + runtimeContext.timeTaken);
        expect(response.status()).toBe(200);
    });
});