import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChat');
const authUrl = fetchAuthUrl('AuthenticatedChat');

test.describe('AuthenticatedChat @AuthenticatedChat', () => {
    test('ChatSDK.startChat() should fetch the chat token & perform session init', async ({page}) => {
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
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;

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
                    requestId: chatSDK.requestId,
                    authToken
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const {requestId, authToken} = runtimeContext;
        const chatTokenRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

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

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, liveChatMapRecordRequest, liveChatMapRecordResponse, liveChatSessionCloseRequest, liveChatSessionCloseResponse, runtimeContext] = await Promise.all([
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
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatAuthSessionClosePath);
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
                runtimeContext.authToken= authToken;

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
        const liveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const authChatMapRecordRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthChatMapRecord}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}`;
        const liveChatSessionCloseRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        const sessionInitCalls = requestUrls.filter((url) => url.includes(OmnichannelEndpoints.LiveChatAuthSessionInitPath));

        const chatTokenRequestHeaders = liveWorkItemDetailsRequest.headers();
        const sessionInitRequestHeaders = liveChatMapRecordRequest.headers();
        const sessionCloseRequestHeaders = liveChatSessionCloseRequest.headers();

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveChatMapRecordRequest.url()).toContain(authChatMapRecordRequestUrl);
        expect(liveChatMapRecordResponse.status()).toBe(200);
        expect(liveChatSessionCloseRequest.url()).toContain(liveChatSessionCloseRequestUrl);
        expect(liveChatSessionCloseResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).not.toBe('Closed');
        expect(sessionInitCalls.length).toBe(1);
        expect(chatTokenRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(sessionInitRequestHeaders['authenticatedusertoken']).toBe(authToken);
        expect(sessionCloseRequestHeaders['authenticatedusertoken']).toBe(authToken);
    });

});