import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithMasking');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getDataMaskingRules()', async ({ page }) => {
        await page.goto(testPage);

        const dataMaskingRuleJson = JSON.stringify("\\b(?!000|666|9)\\d{3}[- ]?(?!00)\\d{2}[- ]?(?!0000)\\d{4}\\b");

        let [runtimeContext ] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                let chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                let startTime = new Date();
                const maskingRules = await chatSDK.getDataMaskingRules();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    timeTaken: timeTaken,
                    maskingRules: maskingRules
                };
                
                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        console.log("chatSDK.getDataMaskingRules(): " + runtimeContext.timeTaken);
        expect(runtimeContext.maskingRules).not.toBeNull();
        const maskingRulesJson = JSON.stringify(runtimeContext.maskingRules)
        expect(maskingRulesJson.includes(dataMaskingRuleJson)).toBeTruthy();
    });
});