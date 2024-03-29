import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatOutsideOfOperatingHours');

test.describe('UnauthenticatedChat @UnauthenticatedChatOutsideOfOperatingHours', () => {
    test('ChatSDK.startChat() on outside of operating hours should throw an exception', async ({ page }) => {
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
                    await chatSDK.startChat();
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const expectedErrorMessage = "WidgetUseOutsideOperatingHour";
        const { errorMessage } = runtimeContext;
        expect(errorMessage).toBe(expectedErrorMessage);
    });
});
