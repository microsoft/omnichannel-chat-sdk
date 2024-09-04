import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchTestSettings from '../utils/fetchTestSettings';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTranscripts');
const testSettings = fetchTestSettings('UnauthenticatedChatWithTranscripts');

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTranscripts', () => {
    test('ChatSDK.emailLiveChatTranscript() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, chatDuration }) => {
                const {sleep} = window;
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();

                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                const body = {
                    emailAddress: 'contoso@microsoft.com',
                    attachmentMessage: 'Attachment Message'
                };

                await chatSDK.emailLiveChatTranscript(body);

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, chatDuration: testSettings.chatDuration })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath}/${requestId}?channelId=lcw`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.emailLiveChatTranscript() with live chat context should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, chatDuration }) => {
                const {sleep} = window;
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();
                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.liveChatContext = liveChatContext;
                runtimeContext.requestId = chatSDK.requestId;

                const body = {
                    emailAddress: 'contoso@microsoft.com',
                    attachmentMessage: 'Attachment Message'
                };

                await sleep(chatDuration);

                await chatSDK.endChat();

                await chatSDK.emailLiveChatTranscript(body, {liveChatContext});

                return runtimeContext;
            }, { omnichannelConfig, chatDuration: testSettings.chatDuration })
        ]);

        const {requestId, liveChatContext} = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath}/${requestId}?channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['authorization']).toBe(liveChatContext.chatToken.token);
        expect(requestHeaders['widgetappid']).toBe(omnichannelConfig.widgetId);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.getLiveChatTranscript() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, chatDuration }) => {
                const {sleep} = window;
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();
                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                runtimeContext.token = chatSDK.chatToken.token;
                runtimeContext.chatId = chatSDK.chatToken.chatId;

                const transcript = await chatSDK.getLiveChatTranscript();
                runtimeContext.transcript = transcript;

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, chatDuration: testSettings.chatDuration })
        ]);

        const {requestId, token, chatId, transcript} = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath}/${chatId}/${requestId}?channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['authorization']).toBe(token);
        expect(requestHeaders['organizationid']).toBe(omnichannelConfig.orgId);
        expect(requestHeaders['widgetappid']).toBe(omnichannelConfig.widgetId);
        expect(response.status()).toBe(200);
        expect(Object.keys(transcript).includes('chatMessagesJson'));
        expect(typeof transcript['chatMessagesJson']).toBe('string');
    });

    test('ChatSDK.getLiveChatTranscript() with liveChatContext should not fail', async ({ page }) => {
        await page.goto(testPage);

        page.on("console", (message) => {
            if (message.type() === "error") {
              console.log(message.text());
            }
        })

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, chatDuration }) => {
                const {sleep} = window;
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();
                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.liveChatContext = liveChatContext;
                runtimeContext.requestId = chatSDK.requestId;
                runtimeContext.token = chatSDK.chatToken.token;
                runtimeContext.chatId = chatSDK.chatToken.chatId;

                await sleep(chatDuration);

                await chatSDK.endChat();

                const transcript = await chatSDK.getLiveChatTranscript({liveChatContext});
                runtimeContext.transcript = transcript;

                return runtimeContext;
            }, { omnichannelConfig, chatDuration: testSettings.chatDuration })
        ]);

        const {requestId, token, chatId, transcript} = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath}/${chatId}/${requestId}?channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['authorization']).toBe(token);
        expect(requestHeaders['organizationid']).toBe(omnichannelConfig.orgId);
        expect(requestHeaders['widgetappid']).toBe(omnichannelConfig.widgetId);
        expect(response.status()).toBe(200);
        expect(Object.keys(transcript).includes('chatMessagesJson'));
        expect(typeof transcript['chatMessagesJson']).toBe('string');
    });
});
