import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import { PerformanceTestResult } from '../utils/PerformanceTests';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');
let performanceDataTest: PerformanceData;
let performanceDataTestCol: PerformanceData[] = [];
test.afterEach(() => {
    performanceDataTestCol.push(performanceDataTest);
});

test.afterAll(async () => {
    await PerformanceTestResult(performanceDataTestCol);
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

        // Explicitly define the type of the 'data' variable
        const data: PerformanceData = {
            "Scenario": "chatSDK.startChat()",
            "DateofRun": `${new Date()}`,
            "Threshold": 300,
            "ExecutionTime": runtimeContext.timeTaken
        };
        performanceDataTest = data;     
    });
});