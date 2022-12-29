import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import ACSEndpoints from '../utils/ACSEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithMasking', () => {
    test('ChatSDK.sendMessage() should send the message masked', async ({ page }) => {
        await page.goto(testPage);

        const content = "4111111111111111";

        const [getMessagesRequest, getMessagesResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && response.request().method() === 'GET'
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

                await chatSDK.getMessages();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const getMessagesResponseDataJson = await getMessagesResponse.json();
        const sentMessages = getMessagesResponseDataJson.value.filter((message) => message.type === 'text');
        const sentMessageContent = sentMessages[0].content.message;

        expect(sentMessageContent).toBe("################");
    });
});
