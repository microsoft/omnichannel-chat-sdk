import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithNoEscalationToVoiceandVideo');
const authUrl = fetchAuthUrl('AuthenticatedChatWithNoEscalationToVoiceandVideo');

test.describe('AuthenticatedChat @AuthenticatedChatWithNoEscalationToVoiceandVideo', () => {
    test('ChatSDK.getVoiceVideoCalling() should throw a FeatureDisabled exception', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
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

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                };

                try {
                    await chatSDK.getVoiceVideoCalling();
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { errorMessage } = runtimeContext;
        const expectedErrorMessage = "FeatureDisabled";
        expect(errorMessage).toBe(expectedErrorMessage);
    });
});