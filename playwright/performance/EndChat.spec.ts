import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
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
    test('ChatSDK.endChat()', async ({ page }) => {
        await page.goto(testPage);
        
        let [response, runtimeContext ] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();
                
                let startTime = new Date();
                await chatSDK.endChat();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    timeTaken: timeTaken
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        console.log("chatSDK.endChat(): " + runtimeContext.timeTaken);
        expect(response.status()).toBe(200);

        const executionTime = runtimeContext.timeTaken;
        const data: performanceData = createPerformanceData("chatSDK.endChat()", executionTime, ThresholdByScenario.ChatSDK_EndChat);
        performanceDataTest = data; 
    });
});