import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithPostChatSurvey');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.getPostChatSurveyContext()', async ({ page }) => {
        await page.goto(testPage);

        let [ runtimeContext ] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                let chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                let startTime = new Date();
                const postChatSurveyContext = await chatSDK.getPostChatSurveyContext();
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    timeTaken: timeTaken,
                    postChatSurveyContext: postChatSurveyContext
                };

                await chatSDK.endChat();
                
                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        console.log("chatSDK.getPostChatSurveyContext(): " + runtimeContext.timeTaken);
        expect(runtimeContext.postChatSurveyContext).not.toBeNull();
        expect(runtimeContext.postChatSurveyContext.participantType).toBe("Bot");
    });
});