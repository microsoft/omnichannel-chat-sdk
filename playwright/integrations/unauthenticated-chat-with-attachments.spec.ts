import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import ACSEndpoints from '../utils/ACSEndpoints';
import AMSEndpoints from '../utils/AMSEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithAttachments');

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithAttachments', () => {
    test('ChatSDK.uploadFileAttachment() should upload attachment to the attachment service & send a message with the metadata', async ({ page }) => {
        await page.goto(testPage);

        const [uploadImageRequest, uploadImageResponse, sendMessageRequest, sendMessageResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(AMSEndpoints.rootDomain) && request.url().match(AMSEndpoints.uploadImagePattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().includes(AMSEndpoints.rootDomain) && response.url().match(AMSEndpoints.uploadImagePattern)?.length >= 0;
            }),
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint
                };

                try {
                    const response = await fetch('./images/600x400.png');
                    const blob = await response.blob();
                    const file = new File([blob], '600x400.png', {
                        type: "image/png"
                    });

                    runtimeContext.chatToken = chatSDK.chatToken;
                    await chatSDK.uploadFileAttachment(file);
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                const messages = await chatSDK.getMessages();
                runtimeContext.messages = messages;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const sendMessageRequestPostDataDataJson = sendMessageRequest.postDataJSON();
        const {content: sendMessageRequestContent, metadata} = sendMessageRequestPostDataDataJson;

        expect(uploadImageRequest.method()).toBe('PUT');
        expect(uploadImageResponse.status()).toBe(201);
        expect(sendMessageRequestContent).toBe("");
        expect(metadata).toBeDefined();
        expect(metadata.amsReferences).toBeDefined();
        expect(metadata.amsreferences).toBeDefined();
        expect(metadata.amsMetadata).toBeDefined();
        expect(sendMessageResponse.status()).toBe(201);
        expect(runtimeContext.errorMessage).not.toBeDefined();
        expect(runtimeContext.errorObject).not.toBeDefined();
    });

    test('ChatSDK.downloadFileAttachment() should download an attachment',  async ({ page }) => {
        await page.goto(testPage);

        const [getImageViewStatusRequest, getImageViewStatusResponse, getImageViewRequest, getImageViewResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(AMSEndpoints.rootDomain) && request.url().match(AMSEndpoints.getImageViewStatusPattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().includes(AMSEndpoints.rootDomain) && response.url().match(AMSEndpoints.getImageViewStatusPattern)?.length >= 0;
            }),
            page.waitForRequest(request => {
                return request.url().includes(AMSEndpoints.rootDomain) && request.url().match(AMSEndpoints.getImageViewPattern)?.length >= 0 && !request.url().endsWith("status");
            }),
            page.waitForResponse(response => {
                return response.url().includes(AMSEndpoints.rootDomain) && response.url().match(AMSEndpoints.getImageViewPattern)?.length >= 0 && !response.url().endsWith("status");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                try {
                    const response = await fetch('./images/600x400.png');
                    const blob = await response.blob();
                    const uploadedBlobContent = await blob.text();
                    const file = new File([blob], '600x400.png', {
                        type: "image/png"
                    });

                    await chatSDK.uploadFileAttachment(file);

                    runtimeContext.uploadedBlobContent = uploadedBlobContent;
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                const messages = await chatSDK.getMessages();
                runtimeContext.messages = messages;

                const attachmentMessageResult = messages.filter(message => message.fileMetadata !== undefined);
                const attachmentMessage = attachmentMessageResult[0];

                try {
                    const blob = await chatSDK.downloadFileAttachment(attachmentMessage.fileMetadata);
                    const downloadedBlobContent = await blob.text();
                    runtimeContext.downloadedBlobContent = downloadedBlobContent;
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        expect(getImageViewStatusRequest.method()).toBe('GET');
        expect(getImageViewStatusResponse.status()).toBe(200);
        expect(getImageViewRequest.method()).toBe('GET');
        expect(getImageViewResponse.status()).toBe(200);
        expect(runtimeContext.downloadedBlobContent).toBe(runtimeContext.uploadedBlobContent);
    });
});
