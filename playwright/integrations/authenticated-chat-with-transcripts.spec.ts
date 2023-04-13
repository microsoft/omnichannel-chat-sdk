import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithTranscripts');
const authUrl = fetchAuthUrl('AuthenticatedChatWithTranscripts');

test.describe('@AuthenticatedChat @AuthenticatedChatWithTranscripts', () => {
    test('ChatSDK.getLiveChatTranscript() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTranscriptPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTranscriptPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
                const runtimeContext = {};

                chatSDK.setDebug(true);
                await chatSDK.initialize();
                runtimeContext.authToken = authToken;

                await chatSDK.startChat();
                runtimeContext.requestId = chatSDK.requestId;

                runtimeContext.token = chatSDK.chatToken.token;
                runtimeContext.chatId = chatSDK.chatToken.chatId;

                const transcript = await chatSDK.getLiveChatTranscript();
                runtimeContext.transcript = transcript;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const {authToken, requestId, token, chatId, transcript} = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTranscriptPath}/${chatId}/${requestId}?channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['authorization']).toBe(token);
        expect(requestHeaders['organizationid']).toBe(omnichannelConfig.orgId);
        expect(requestHeaders['widgetappid']).toBe(omnichannelConfig.widgetId);
        expect(requestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(response.status()).toBe(200);
        expect(Object.keys(transcript).includes('chatMessagesJson'));
        expect(typeof transcript['chatMessagesJson']).toBe('string');
    });
});