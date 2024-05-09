import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import { createPerformanceData, performanceTestResult, performanceData, ThresholdByScenario } from '../utils/PerformanceHandler';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChat');
const authUrl = fetchAuthUrl('AuthenticatedChat');

let performanceDataTest: performanceData;
let performanceTestData: performanceData[] = [];

test.afterEach(() => {
    performanceTestData.push(performanceDataTest);
});

test.afterAll(async () => {
    await performanceTestResult(performanceTestData);
});

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getAgentAvailability()', async ({ page }) => {
        await page.goto(testPage);

        const [response, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();
                const startTime = new Date();
                chatSDK.getAgentAvailability();
                const endTime = new Date();
                const timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    timeTaken: timeTaken
                };

                return runtimeContext;
            }, { omnichannelConfig, authUrl }),
        ]);

        const { timeTaken } = runtimeContext;
        console.log("chatSDK.getAgentAvailability(): " + timeTaken);

        expect(response.status()).toBe(200);

        const executionTime = runtimeContext.timeTaken;
        const data: performanceData = createPerformanceData("chatSDK.getAgentAvailability()", executionTime, ThresholdByScenario.ChatSDK_GetAgentAvailability);
        performanceDataTest = data;
    });
});