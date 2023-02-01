import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import ACSEndpoints from '../utils/ACSEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithMasking');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithMasking', () => {
    test('ChatSDK.sendMessage() should send the message masked', async ({ page }) => {
        await page.goto(testPage);

        const content = "4111111111111111";
        const [sendMessageRequest, sendMessageResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig, content }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                await chatSDK.sendMessage({
                    content
                });

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const sendMessageRequestPostDataDataJson = sendMessageRequest.postDataJSON();
        const {content: sendMessageRequestContent} = sendMessageRequestPostDataDataJson;

        expect(sendMessageRequestContent).toBe(content.replace(/[0-9]/g,'#'));
    });
});
