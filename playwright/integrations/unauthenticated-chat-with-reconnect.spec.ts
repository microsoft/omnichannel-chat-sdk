import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithReconnect');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithReconnect', () => {
    test('ChatSDK.getChatReconnectContext() with invalid reconnect id & redirect URL should only return a redirect URL', async ({ page }) => {
        await page.goto(testPage);

        const [chatReconnectContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    chatReconnect: {
                        disable: false,
                    },
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const params = {
                    reconnectId: 'dc47a047-ae7d-4d0f-a00a-51465c7dfc00'
                };

                const chatReconnectContext = await chatSDK.getChatReconnectContext(params);

                if (chatReconnectContext.reconnectId) {
                    await chatSDK.startChat({
                        reconnectId: chatReconnectContext.reconnectId
                    });
                }

                await chatSDK.endChat();

                return chatReconnectContext;
            }, { omnichannelConfig })
        ]);

        const context = chatReconnectContext;
        expect(context.reconnectId).toBe(null);
        expect(context.redirectURL).toBe('https://www.microsoft.com/');
    });
});