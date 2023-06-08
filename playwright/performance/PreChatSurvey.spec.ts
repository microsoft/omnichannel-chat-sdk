import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithPrechat');

test.describe('Performance @Performance', () => {
    test('chatSDK.getPreChatSurvey()', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();
                let startTime = new Date();
                const preChatSurveyRes = await chatSDK.getPreChatSurvey();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                runtimeContext.preChatSurvey = preChatSurveyRes;
                runtimeContext.timeTaken = timeTaken;

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { preChatSurvey, timeTaken } = runtimeContext;
        console.log("chatSDK.getPreChatSurvey(): " + timeTaken);

        expect(typeof (preChatSurvey) === 'object').toBe(true);
    });
});