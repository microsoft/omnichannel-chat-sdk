import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
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

test.describe('Performance @Performance ', () => {
    const threshold = 2000;
    test('ChatSDK.initialize()', async ({ page }) => {
        await page.goto(testPage);

        let [response, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                let startTime = new Date();
                await chatSDK.initialize();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    timeTaken: timeTaken
                };

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        console.log("chatSDK.initialize(): " + runtimeContext.timeTaken);
        expect(response.status()).toBe(200);

        const executionTime = runtimeContext.timeTaken;
        const data: PerformanceData = createPerformanceData("chatSDK.initialize()", executionTime, threshold);
        performanceDataTest = data; 
    });
});