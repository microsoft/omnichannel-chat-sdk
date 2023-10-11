import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import { createPerformanceData, performanceTestResult, performanceData, ThresholdByScenario } from '../utils/PerformanceHandler';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

let performanceDataTest: performanceData;
let performanceTestData: performanceData[] = [];
test.afterEach(() => {
    performanceTestData.push(performanceDataTest);
});

test.afterAll(async () => {
    await performanceTestResult(performanceTestData);
});

test.describe('Performance @Performance', () => {
    test('ChatSDK.startChat()', async ({ page }) => {
        await page.goto(testPage);

        const [chatTokenResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                let startTime = new Date();
                await chatSDK.startChat();
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
        console.log("chatSDK.startChat(): " + timeTaken);

        expect(chatTokenResponse.status()).toBe(200);

        const executionTime = runtimeContext.timeTaken;
        const data: performanceData = createPerformanceData("chatSDK.startChat()", executionTime, ThresholdByScenario.ChatSDK_StartChat);
        performanceDataTest = data;
    });
});