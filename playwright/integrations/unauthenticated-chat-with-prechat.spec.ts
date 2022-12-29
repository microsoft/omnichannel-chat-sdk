import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithPrechat');

test.describe('UnauthenticatedChat @UnauthenticatedChatWithPrechat', () => {
    test('ChatSDK.startChat() with preChatResponse should be part of session init payload', async ({ page }) => {

        await page.goto(testPage);

        const optionalParams = {
            preChatResponse: { 'Type': "InputSubmit" }, // PreChatSurvey response
        };

        const preChatSurvey = "";
        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, preChatSurvey, optionalParams }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat(optionalParams);

                runtimeContext.requestId = chatSDK.requestId;

                preChatSurvey = await chatSDK.getPreChatSurvey();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, optionalParams })
        ]);

        const RequestPostData = request.postDataJSON();
        const { preChatResponse: preChatResponseData } = RequestPostData;
        expect(optionalParams.preChatResponse).toEqual(preChatResponseData);
    });
});