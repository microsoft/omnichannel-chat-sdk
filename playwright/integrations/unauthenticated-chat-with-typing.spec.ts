import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import { test, expect } from '@playwright/test';
import {join} from 'path';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = join('file:', __dirname, '..', 'public', 'index.html');
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTyping');

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTyping', () => {
    test('ChatSDK.sendTyping() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.SendTypingIndicatorPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                chatSDK.setDebug(true);
                await chatSDK.initialize();

                await chatSDK.startChat();

                runtimeContext.requestId = chatSDK.requestId;

                await chatSDK.sendTypingEvent();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.SendTypingIndicatorPath}/${requestId}`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });
});