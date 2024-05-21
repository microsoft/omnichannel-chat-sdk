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
            preChatResponse: {
                'Type': "InputSubmit",
                'Survey': '{"Name":"OmnichannelSurvey","IsOption":false,"Order":1,"IsRequired":false,"QuestionText":"OmnichannelSurvey"}'
            }
        };

        const [sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, optionalParams }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                await chatSDK.startChat(optionalParams);

                runtimeContext.orgUrl = chatSDK.omnichannelConfig.orgUrl;
                runtimeContext.requestId = chatSDK.requestId;

                const preChatSurveyRes = await chatSDK.getPreChatSurvey();

                runtimeContext.preChatSurvey = preChatSurveyRes;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, optionalParams })
        ]);

        const { requestId, preChatSurvey } = runtimeContext;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const prechatSurveyBody = JSON.parse(optionalParams.preChatResponse.Survey);
        expect(prechatSurveyBody.Name).toEqual('OmnichannelSurvey');
        const requestPostData = sessionInitRequest.postDataJSON();

        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        const { preChatResponse: preChatResponseData } = requestPostData;
        expect(optionalParams.preChatResponse).toEqual(preChatResponseData);
    });

    test('ChatSDK.getPreChatSurvey() should return the survey in JSON format', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                const preChatSurveyRes = await chatSDK.getPreChatSurvey();

                runtimeContext.preChatSurvey = preChatSurveyRes;

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { preChatSurvey } = runtimeContext;
        expect(typeof (preChatSurvey) === 'object').toBe(true);
    });

    test('ChatSDK.getPreChatSurvey() with parseToJSON set to true should return the survey as JSON format', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                const parseToJSON = true;

                const preChatSurveyRes = await chatSDK.getPreChatSurvey(parseToJSON);

                runtimeContext.preChatSurvey = preChatSurveyRes;

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { preChatSurvey } = runtimeContext;
        expect(typeof (preChatSurvey) === 'object').toBe(true);
    });

    test('ChatSDK.getPreChatSurvey() with parseToJSON set to false should return the survey as string format', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
                const runtimeContext = {};

                await chatSDK.initialize();

                const parseToJSON = false;

                const preChatSurveyRes = await chatSDK.getPreChatSurvey(parseToJSON);

                runtimeContext.preChatSurvey = preChatSurveyRes;

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { preChatSurvey } = runtimeContext;
        expect(typeof (preChatSurvey) === 'string').toBe(true);
    });
});