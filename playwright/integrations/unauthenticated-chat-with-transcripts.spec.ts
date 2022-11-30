import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import { test, expect } from '@playwright/test';
import {join} from 'path';

const testPage = join('file:', __dirname, '..', 'public', 'index.html');
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTranscripts');

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTranscripts', () => {
    test('ChatSDK.emailLiveChatTranscript() should not fail', async ({ page }) => {
        // test.setTimeout(120000)

        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes("livechatconnector/createemailrequest");
            }),
            page.waitForResponse(response => {
                return response.url().includes("livechatconnector/createemailrequest");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                chatSDK.setDebug(true);
                await chatSDK.initialize();

                await chatSDK.startChat();

                runtimeContext.requestId = chatSDK.requestId;

                const body = {
                    emailAddress: 'contoso@microsoft.com',
                    attachmentMessage: 'Attachment Message'
                };

                await chatSDK.emailLiveChatTranscript(body);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const emailTranscriptPath = "livechatconnector/createemailrequest";
        const requestUrl = `${omnichannelConfig.orgUrl}/${emailTranscriptPath}/${requestId}?channelId=lcw`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });
});
