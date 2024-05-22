import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithPrechat');
const authUrl = fetchAuthUrl('AuthenticatedChatWithPrechat');

test.describe('AuthenticatedChat @AuthenticatedChatWithPrechat', () => {
    test('ChatSDK.startChat() with preChatResponse should be part of session init payload', async ({ page }) => {
        await page.goto(testPage);

        const optionalParams = {
            preChatResponse: {
                'Type': "InputSubmit",
                'Survey': '{"Name":"OmnichannelSurvey","IsOption":false,"Order":1,"IsRequired":false,"QuestionText":"OmnichannelSurvey"}'
            }
        };

        const [sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, optionalParams, authUrl }) => {
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

                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat(optionalParams);

                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                const preChatSurveyRes = await chatSDK.getPreChatSurvey();

                runtimeContext.preChatSurvey = preChatSurveyRes;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, optionalParams, authUrl })
        ]);

        const { requestId } = runtimeContext;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const prechatSurveyBody = JSON.parse(optionalParams.preChatResponse.Survey);
        expect(prechatSurveyBody.Name).toEqual('OmnichannelSurvey');
        const requestPostData = sessionInitRequest.postDataJSON();

        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        const { preChatResponse: preChatResponseData } = requestPostData;
        expect(optionalParams.preChatResponse).toEqual(preChatResponseData);
    });
});