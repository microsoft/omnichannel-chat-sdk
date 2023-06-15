import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithAttachments');

test.describe('Performance @Performance ', () => {
    test('ChatSDK.downloadFileAttachment()', async ({ page }) => {
        await page.goto(testPage);

        const file = {
            name: 'test',
            type: 'txt',
            size: '10Mb',
            data: 'Hello'
        };
        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, file }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                await chatSDK.uploadFileAttachment(file);

                const messages = await chatSDK.getMessages();

                const attachmentMessageResult = messages.filter(message => message.fileMetadata !== undefined);
                const attachmentMessage = attachmentMessageResult[0];

                let startTime = new Date();
                const blob = await chatSDK.downloadFileAttachment(attachmentMessage.fileMetadata);
                let endTime = new Date();
                let timeTaken = endTime.getTime() - startTime.getTime();
                const downloadedBlobContent = await blob.text();

                const runtimeContext = {
                    timeTaken: timeTaken,
                    downloadedBlobContent: downloadedBlobContent
                };

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, file }),
        ]);

        const { downloadedBlobContent, timeTaken } = runtimeContext;
        console.log("chatSDK.downloadFileAttachment(): " + timeTaken);

        expect(file.data).toBe(downloadedBlobContent);
    });
});