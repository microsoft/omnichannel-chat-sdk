import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChat');

test.describe('AuthenticatedChat @AuthenticatedChat', () => {

    test('Calling ChatSDK.startChat() should not fail for authenticated Chat', async ({ page }) => {
        await page.goto(testPage);

        const [chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    getAuthToken: async () => {
                        return omnichannelConfig.token;
                    }
                }

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const chatTokenRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);

        const chatrequestHeaders = chatTokenRequest.headers();
        expect(chatrequestHeaders['authenticatedusertoken']).toBe(omnichannelConfig.token);
        const sessioninitrequestHeaders = sessionInitRequest.headers();
        expect(sessioninitrequestHeaders['authenticatedusertoken']).toBe(omnichannelConfig.token);
    });

    test('ChatSDK.startChat() with a liveChatContext should validate the live work item details and auth chat map record & should not perform session init call', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, liveChatMapRecordRequest, liveChatMapRecordResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDKConfig = {
                    getAuthToken: async () => {
                        return omnichannelConfig.token;
                    }
                }
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                const runtimeContext = {
                    runtimeIdFirstSession: chatSDK.runtimeId,
                    requestIdFirstSession: chatSDK.requestId,
                    liveChatContext,
                };

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthChatMapRecord);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthChatMapRecord);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;

                const chatSDKConfig = {
                    getAuthToken: async () => {
                        return omnichannelConfig.token;
                    }
                }

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                runtimeContext.runtimeIdSecondSession = chatSDK.runtimeId;
                runtimeContext.requestIdSecondSession = chatSDK.requestId;

                try {
                    await chatSDK.startChat({ liveChatContext: runtimeContext.liveChatContext });
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestIdFirstSession: requestId } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const authChatMapRecordRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthChatMapRecord}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        const sessionInitCalls = requestUrls.filter((url) => url.includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath));

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveChatMapRecordRequest.url()).toContain(authChatMapRecordRequestUrl);
        expect(liveChatMapRecordResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).not.toBe('Closed');
        expect(sessionInitCalls.length).toBe(1);
    });
});