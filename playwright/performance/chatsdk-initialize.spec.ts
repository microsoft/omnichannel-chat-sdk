import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('ChatSDK Performance: ', () => {
    test.only('ChatSDK.initialize()', async ({ page }) => {
        await page.goto(testPage);
        
        let [request, response, [runtimeContext,timeTaken] ] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                let starttime = new Date();
                await chatSDK.initialize();
                let endtime = new Date();
                let timeTaken = endtime.getTime() - starttime.getTime();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };
                
                return [runtimeContext, timeTaken];
            }, { omnichannelConfig }),
        ]);

        console.log("chatSDK.initialize(): " + timeTaken);
        
        const { requestId } = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;

        expect(request.url() === requestUrl).toBe(true);
        expect(response.status()).toBe(200);
    });
});