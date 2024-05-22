import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChat');
const authUrl = fetchAuthUrl('AuthenticatedChat');

test.describe('AuthenticatedChat @AuthenticatedChat', () => {
    test('ChatSDK.startChat() should fetch the chat token & perform session init', async ({ page }) => {
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
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
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

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId, authToken } = runtimeContext;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        const chatTokenRequestHeaders = chatTokenRequest.headers();
        const sessionInitRequestHeaders = sessionInitRequest.headers();

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test('ChatSDK.startChat() with liveChatContext should not perform session init & validate the live work item details & validate auth map record', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, liveChatMapRecordRequest, liveChatMapRecordResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
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

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    runtimeIdFirstSession: chatSDK.runtimeId,
                    requestIdFirstSession: chatSDK.requestId,
                    liveChatContext,
                };

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authUrl }),
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
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                runtimeContext.runtimeIdSecondSession = chatSDK.runtimeId;
                runtimeContext.requestIdSecondSession = chatSDK.requestId;
                runtimeContext.authToken = authToken;

                try {
                    await chatSDK.startChat({ liveChatContext: runtimeContext.liveChatContext });
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestIdFirstSession: requestId, authToken } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const authChatMapRecordRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthChatMapRecord}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        const sessionInitCalls = requestUrls.filter((url) => url.includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath));

        const liveWorkItemDetailsRequestHeaders = liveWorkItemDetailsRequest.headers();
        const liveChatMapRecordRequestHeaders = liveChatMapRecordRequest.headers();

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveChatMapRecordRequest.url()).toContain(authChatMapRecordRequestUrl);
        expect(liveChatMapRecordResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).not.toBe('Closed');
        expect(sessionInitCalls.length).toBe(1);
        expect(liveWorkItemDetailsRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(liveChatMapRecordRequestHeaders['authenticatedusertoken']).toBe(authToken);
    });

    test('ChatSDK.endChat() should perform session close', async ({ page }) => {
        await page.goto(testPage);

        const [sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
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

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { requestId, authToken } = runtimeContext;
        const sessionCloseRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionCloseRequestHeaders = sessionCloseRequest.headers();

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
        expect(sessionCloseRequestHeaders['authenticatedusertoken']).toBe(authToken);
    });

    test('ChatSDK.getConversationDetails() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
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
                await chatSDK.initialize();

                await chatSDK.startChat();

                const conversationDetails = await chatSDK.getConversationDetails();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    conversationDetails
                };

                await chatSDK.endChat();
                return runtimeContext;
            }, { omnichannelConfig, authUrl }),
        ]);

        const { requestId, conversationDetails } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).toBe(conversationDetails.state);
        expect(liveWorkItemDetailsResponseDataJson.ConversationId).toBe(conversationDetails.conversationId);
        expect(liveWorkItemDetailsResponseDataJson.CanRenderPostChat).toBe(conversationDetails.canRenderPostChat);
    });

    test('ChatSDK.getConversationDetails() with liveChatContext should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [invalidLiveWorkItemDetailsRequest, invalidLiveWorkItemDetailsResponse, _, liveChatContextLiveWorkItemDetailsRequest, liveChatContextLiveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
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

                await chatSDK.initialize();

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    liveChatContext
                };

                await chatSDK.endChat();
                runtimeContext.invalidRequestId = chatSDK.requestId;

                const invalidRequestIdConversationDetails = await chatSDK.getConversationDetails();
                runtimeContext.invalidRequestIdConversationDetails = invalidRequestIdConversationDetails;

                (window as any).runtimeContext = runtimeContext;
            }, { omnichannelConfig, authUrl }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                runtimeContext.authToken= authToken;

                const liveChatContextConversationDetails = await chatSDK.getConversationDetails({ liveChatContext: runtimeContext.liveChatContext });
                runtimeContext.liveChatContextConversationDetails = liveChatContextConversationDetails;

                return runtimeContext;
            }, { omnichannelConfig, authUrl }),
        ]);

        const { invalidRequestId, liveChatContext, invalidRequestIdConversationDetails, liveChatContextConversationDetails, authToken } = runtimeContext;
        const invalidLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${invalidRequestId}?channelId=lcw`;
        const liveChatContextLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${liveChatContext.requestId}?channelId=lcw`;

        const liveChatContextLiveWorkItemDetailsRequestHeaders = liveChatContextLiveWorkItemDetailsRequest.headers();

        expect(invalidLiveWorkItemDetailsRequest.url() === invalidLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(invalidLiveWorkItemDetailsResponse.status()).toBe(400);
        expect(liveChatContextLiveWorkItemDetailsRequest.url() === liveChatContextLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveChatContextLiveWorkItemDetailsRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(invalidRequestIdConversationDetails).toEqual({});
        expect(liveChatContextConversationDetails.state).toBeDefined();
        expect(liveChatContextConversationDetails.conversationId).toBeDefined();
        expect(liveChatContextConversationDetails.canRenderPostChat).toBeDefined();
    });
});