import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import { createPerformanceData, PerformanceTestResult, performanceData } from '../utils/PerformanceTests';


const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');
let performanceDataTest: performanceData;
let performanceDataTestCol: performanceData[] = [];
test.afterEach(() => {
    performanceDataTestCol.push(performanceDataTest);
});

test.afterAll(async () => {
    await PerformanceTestResult(performanceDataTestCol);
});

test.describe('Performance @Performance', () => {
    test('ChatSDK.startChat()', async ({ page }) => {
        const threshold = 2000;
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

        console.log("chatSDK.startChat(): " + runtimeContext.timeTaken);
        expect(chatTokenResponse.status()).toBe(200);

        const executionTime = runtimeContext.timeTaken;
        const data: PerformanceData = createPerformanceData("chatSDK.startChat()", executionTime, threshold);
        performanceDataTest = data; 
    });
});