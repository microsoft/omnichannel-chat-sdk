import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import RegexExpression from '../utils/RegexExpression';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithEscalationToVoiceAndVideo');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getCallingToken()', async ({ page }) => {
        await page.goto(testPage);

        const [CallingBundleResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(RegexExpression.callingBundle) && response.url().match(RegexExpression.callingWidgetSnippetSourceRegex)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const modules = exports;

                exports = undefined;

                await chatSDK.getVoiceVideoCalling();

                exports = modules;

                await chatSDK.startChat();

                let startTime = new Date();
                await chatSDK.getCallingToken();
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
        console.log("chatSDK.getCallingToken(): " + timeTaken);

        expect(CallingBundleResponse.status()).toBe(200);
    });
});