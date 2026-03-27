import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import fetchAuthToken from '../utils/fetchAuthToken';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithNoEscalationToVoiceAndVideo');
const authToken = fetchAuthToken('AuthenticatedChatWithNoEscalationToVoiceAndVideo');

test.describe('AuthenticatedChat @AuthenticatedChatWithNoEscalationToVoiceAndVideo', () => {
    test('ChatSDK.getVoiceVideoCalling() should throw a FeatureDisabled exception', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authToken }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const chatSDKConfig = {
                    getAuthToken: () => Promise.resolve(authToken),
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

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
            }, { omnichannelConfig, authToken })
        ]);

        const { errorMessage } = runtimeContext;
        const expectedErrorMessage = "FeatureDisabled";
        expect(errorMessage).toBe(expectedErrorMessage);
    });
});