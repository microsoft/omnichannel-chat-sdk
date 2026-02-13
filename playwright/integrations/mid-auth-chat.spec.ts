import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import fetchTestSettings from '../utils/fetchTestSettings';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('MidAuthChat');
const authUrl = fetchAuthUrl('MidAuthChat');
const testSettings = fetchTestSettings('MidAuthChat');

test.describe('MidAuthChat @MidAuthChat', () => {
    
    test('ChatSDK.startChat() with deferInitialAuth=true should start unauthenticated session', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                // Should use unauthenticated session init (not auth/sessioninit)
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath) &&
                       !request.url().includes('/auth/');
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath) &&
                       !response.url().includes('/auth/');
            }),
            await page.evaluate(async ({ omnichannelConfig, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                // Mid-auth config: getAuthToken returns null initially (user not logged in)
                const chatSDKConfig = {
                    getAuthToken: () => null,
                    useCreateConversation: {
                        disable: true,
                    }
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                };

                // Start chat with deferInitialAuth=true (mid-auth unauthenticated flow)
                // deferInitialAuth is a private instance property, not a startChat option
                chatSDK.deferInitialAuth = true;
                await chatSDK.startChat();

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, chatDuration: testSettings.chatDuration })
        ]);

        // Verify unauthenticated session init was called (not authenticated)
        expect(sessionInitResponse.status()).toBe(200);
        
        // Verify no auth endpoints were called
        const authCalls = requestUrls.filter(url => url.includes('/auth/'));
        expect(authCalls.length).toBe(0);
    });

    test('ChatSDK.authenticateChat() should authenticate mid-conversation', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [midAuthRequest, midAuthResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatMidConversationAuth);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatMidConversationAuth);
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                // Start without auth
                const chatSDKConfig = {
                    getAuthToken: () => null,
                    useCreateConversation: {
                        disable: true,
                    }
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                // Start unauthenticated
                // deferInitialAuth is a private instance property, not a startChat option
                chatSDK.deferInitialAuth = true;
                await chatSDK.startChat();

                // Simulate user login - get auth token
                const payload = { method: "POST" };
                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken?.chatId,
                    authToken,
                    authenticateChatCalled: false,
                    authenticateChatError: null as string | null,
                };

                // Authenticate mid-conversation
                try {
                    await chatSDK.authenticateChat(authToken);
                    runtimeContext.authenticateChatCalled = true;
                } catch (err) {
                    runtimeContext.authenticateChatError = (err as Error).message;
                }

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl, chatDuration: testSettings.chatDuration })
        ]);

        // Verify mid-conversation auth API was called
        expect(midAuthResponse.status()).toBe(200);
        expect(runtimeContext.authenticateChatCalled).toBe(true);
        expect(runtimeContext.authenticateChatError).toBeNull();

        // Verify the auth token was sent in the request
        const midAuthRequestHeaders = midAuthRequest.headers();
        expect(midAuthRequestHeaders['authenticatedusertoken']).toBe(runtimeContext.authToken);
    });

    test('ChatSDK.startChat() with pre-chat authentication should use authenticated endpoints', async ({ page }) => {
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
            await page.evaluate(async ({ omnichannelConfig, authUrl, chatDuration }) => {
                const { sleep } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                // Get auth token first (pre-chat authentication)
                const payload = { method: "POST" };
                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken,
                    useCreateConversation: {
                        disable: true,
                    }
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    authToken,
                };

                // Start chat - should use authenticated flow since token is available
                // deferInitialAuth defaults to false, no need to set it
                await chatSDK.startChat();

                await sleep(chatDuration);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, authUrl, chatDuration: testSettings.chatDuration })
        ]);

        // Verify authenticated endpoints were used
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitResponse.status()).toBe(200);

        // Verify auth token was included in requests
        const chatTokenRequestHeaders = chatTokenRequest.headers();
        const sessionInitRequestHeaders = sessionInitRequest.headers();
        expect(chatTokenRequestHeaders['authenticatedusertoken']).toBe(runtimeContext.authToken);
        expect(sessionInitRequestHeaders['authenticatedusertoken']).toBe(runtimeContext.authToken);
    });

    test('Widget reconnect with hasUserAuthenticated should preserve authenticated state', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const runtimeContext = await page.evaluate(async ({ omnichannelConfig, authUrl, chatDuration }) => {
            const { sleep } = window;
            const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

            // First session: Start unauthenticated, then authenticate
            const chatSDKConfig1 = {
                getAuthToken: () => null,
                useCreateConversation: {
                    disable: true,
                }
            };

            const chatSDK1 = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig1);
            await chatSDK1.initialize();

            // Start unauthenticated
            // deferInitialAuth is a private instance property, not a startChat option
            chatSDK1.deferInitialAuth = true;
            await chatSDK1.startChat();

            // Get auth token and authenticate mid-conversation
            const payload = { method: "POST" };
            const response = await fetch(authUrl, payload);
            const authToken = await response.text();

            await chatSDK1.authenticateChat(authToken);

            // Get live chat context for reconnect
            const liveChatContext = await chatSDK1.getCurrentLiveChatContext();

            const runtimeContext = {
                orgUrl: chatSDK1.omnichannelConfig.orgUrl,
                requestIdFirstSession: chatSDK1.requestId,
                liveChatContext,
                authToken,
                secondSessionStarted: false,
                secondSessionError: null as string | null,
            };

            // Store context for second session
            (window as any).runtimeContext = runtimeContext;

            return runtimeContext;
        }, { omnichannelConfig, authUrl, chatDuration: testSettings.chatDuration });

        // Second session: Reconnect with auth token (simulating page refresh with persisted auth)
        const runtimeContext2 = await page.evaluate(async ({ omnichannelConfig, authUrl, chatDuration }) => {
            const { sleep } = window;
            const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;

            // Get fresh auth token for reconnect
            const payload = { method: "POST" };
            const response = await fetch(authUrl, payload);
            const authToken = await response.text();

            const chatSDKConfig2 = {
                getAuthToken: () => authToken,
                useCreateConversation: {
                    disable: true,
                }
            };

            const chatSDK2 = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig2);
            await chatSDK2.initialize();

            try {
                // Reconnect with liveChatContext - should use authenticated flow
                // deferInitialAuth defaults to false (user is already authenticated)
                await chatSDK2.startChat({
                    liveChatContext: runtimeContext.liveChatContext
                });
                runtimeContext.secondSessionStarted = true;
            } catch (err) {
                runtimeContext.secondSessionError = (err as Error).message;
            }

            await sleep(chatDuration);

            await chatSDK2.endChat();

            return runtimeContext;
        }, { omnichannelConfig, authUrl, chatDuration: testSettings.chatDuration });

        // Verify second session connected successfully
        expect(runtimeContext2.secondSessionStarted).toBe(true);
        expect(runtimeContext2.secondSessionError).toBeNull();

        // Verify authenticated endpoints were used for reconnect
        const authLiveWorkItemDetailsCalls = requestUrls.filter(url => 
            url.includes(OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath)
        );
        expect(authLiveWorkItemDetailsCalls.length).toBeGreaterThan(0);
    });
});
