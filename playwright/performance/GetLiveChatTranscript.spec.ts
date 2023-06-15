import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTranscripts');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getLiveChatTranscript()', async ({ page }) => {
        await page.goto(testPage);

        const [response, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                let startTime = new Date();
                const transcript = await chatSDK.getLiveChatTranscript();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    transcript: transcript,
                    timeTaken: timeTaken
                };

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        console.log("chatSDK.getLiveChatTranscript(): " + runtimeContext.timeTaken);
        expect(response.status()).toBe(200);
        expect(Object.keys(runtimeContext.transcript).includes('chatMessagesJson'));
    });
});