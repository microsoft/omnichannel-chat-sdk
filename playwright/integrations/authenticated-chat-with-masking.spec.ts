import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import fetchTestSettings from '../utils/fetchTestSettings';
import { test, expect } from '@playwright/test';
import ACSEndpoints from '../utils/ACSEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithMasking');
const authUrl = fetchAuthUrl('AuthenticatedChatWithMasking');
const testSettings = fetchTestSettings('AuthenticatedChatWithMasking');

test.describe('AuthenticatedChat @AuthenticatedChatWithMasking', () => {
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
            await page.evaluate(async ({ omnichannelConfig, content, authUrl, chatDuration }) => {
                const { sleep } = window;
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

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                    authToken
                };

                await chatSDK.sendMessage({
                    content
                });

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content, authUrl, chatDuration: testSettings.chatDuration })
        ]);
        
        const sendMessageRequestPostDataDataJson = sendMessageRequest.postDataJSON();
        const { content: sendMessageRequestContent } = sendMessageRequestPostDataDataJson;

        expect(sendMessageRequestContent).toBe(content.replace(/[0-9]/g, '#'));
    });
});