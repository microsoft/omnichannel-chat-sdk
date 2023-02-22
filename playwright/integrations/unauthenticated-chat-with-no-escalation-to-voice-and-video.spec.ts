import { test, expect } from '@playwright/test';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithNoEscalationToVoiceAndVideo');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithNoEscalationToVoiceAndVideo', () => {
    test('ChatSDK.getVoiceVideoCalling() should throw a FeatureDisabled exception', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                };

                try {
                    await chatSDK.getVoiceVideoCalling();
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { errorMessage } = runtimeContext;
        const expectedErrorMessage = "FeatureDisabled";
        expect(errorMessage).toBe(expectedErrorMessage);
    });
});