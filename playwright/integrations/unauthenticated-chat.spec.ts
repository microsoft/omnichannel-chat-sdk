import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import ACSEndpoints from '../utils/ACSEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChat');

test.describe('UnauthenticatedChat @UnauthenticatedChat', () => {
    test('ChatSDK.initialize() should fetch the live chat configuration', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(undefined);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.initialize() with sendCacheHeaders should pass the `Cache-Control` HTTP headers to the HTTP call', async ({ page }) => {
        await page.goto(testPage);

        const [request, response, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatConfigPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                const optionalParams = {
                    getLiveChatConfigOptionalParams: {
                        sendCacheHeaders: true
                    }
                };

                await chatSDK.initialize(optionalParams);

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const requestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();
        const cacheHeaders = 'no-store, must-revalidate, no-cache';

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(cacheHeaders);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.startChat() should fetch the chat token & perform session init', async ({ page }) => {
        await page.goto(testPage);

        const [chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test('ChatSDK.startChat() with customContext should be part of session init payload', async ({ page }) => {
        await page.goto(testPage);

        const customContext = {
            'contextKey1': { 'value': 'contextValue1', 'isDisplayable': true }, // Valid
            'contextKey2': { 'value': 12.34, 'isDisplayable': false }, // Invalid
            'contextKey3': { 'value': true } // Invalid
        };

        const [sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, customContext }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat({ customContext });

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, customContext })
        ]);

        const { requestId } = runtimeContext;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestPostData = sessionInitRequest.postDataJSON();
        const { customContextData: sessionInitCustomContextData } = sessionInitRequestPostData;

        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        expect(sessionInitCustomContextData).toStrictEqual(customContext);
    });

    test('ChatSDK.startChat() with a liveChatContext of a closed conversation should throw an \'ClosedConversation\' error', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { sleep } = window;

                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    runtimeId: chatSDK.runtimeId,
                    requestId: chatSDK.requestId,
                };

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                await chatSDK.endChat();

                await sleep(3000); // Sleep to avoid race condition

                try {
                    await chatSDK.startChat({ liveChatContext: liveChatContext });
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const expectedErrorMessage = "ClosedConversation";
        const { errorMessage } = runtimeContext;
        expect(errorMessage).toBe(expectedErrorMessage);
    });

    test('ChatSDK.startChat() with a liveChatContext should validate the live work item details & should not perform session init call', async ({ page }) => {
        await page.goto(testPage);

        const requestUrls = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

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
            }, { omnichannelConfig }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

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
        const liveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        const sessionInitCalls = requestUrls.filter((url) => url.includes(OmnichannelEndpoints.LiveChatSessionInitPath));

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).not.toBe('Closed');
        expect(sessionInitCalls.length).toBe(1);
    });

    test('ChatSDK.sendMessage() should send a message with default tags & proper metadata', async ({ page }) => {
        await page.goto(testPage);

        const content = "Hi";
        const [sendMessageRequest, sendMessageResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig, content }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                await chatSDK.sendMessage({
                    content
                });

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const { acsEndpoint, chatId } = runtimeContext;
        const sendMessageRequestPartialUrl = `${acsEndpoint}chat/threads/${encodeURIComponent(chatId)}/messages?api-version=`;
        const sendMessageRequestPostDataDataJson = sendMessageRequest.postDataJSON();
        const { content: sendMessageRequestContent, metadata: { deliveryMode, tags, widgetId } } = sendMessageRequestPostDataDataJson;

        expect(sendMessageRequestContent).toBe(content);
        expect(deliveryMode).toBe('bridged');
        expect(tags.split(',').includes('ChannelId-lcw')).toBe(true);
        expect(tags.split(',').includes('FromCustomer')).toBe(true);
        expect(widgetId).toBe(omnichannelConfig.widgetId);
        expect(sendMessageRequest.url().includes(sendMessageRequestPartialUrl)).toBe(true);
        expect(sendMessageResponse.status()).toBe(201);
    });

    test('ChatSDK.getMessages() should return a list of messages', async ({ page }) => {
        await page.goto(testPage);

        const content = "Hi";
        const [getMessagesRequest, getMessagesResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && response.request().method() === 'GET'
            }),
            await page.evaluate(async ({ omnichannelConfig, content }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                await chatSDK.sendMessage({
                    content
                });

                await chatSDK.getMessages();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const { acsEndpoint, chatId } = runtimeContext;
        const getMessagesRequestPartialUrl = `${acsEndpoint}chat/threads/${encodeURIComponent(chatId)}/messages?api-version=`;
        const getMessagesResponseDataJson = await getMessagesResponse.json();
        const sentMessage = getMessagesResponseDataJson.value.filter((message) => message.type === 'text' && message.content.message === content);
        const sentMessageContent = sentMessage[0].content.message;

        expect(getMessagesRequest.url().includes(getMessagesRequestPartialUrl)).toBe(true);
        expect(getMessagesResponse.status()).toBe(200);
        expect(getMessagesResponseDataJson).toBeDefined();
        expect(sentMessageContent).toBe(content);
    });

    test('ChatSDK.onNewMessage() should not fail', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { sleep } = window;

                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                const messages = [];

                try {
                    chatSDK.onNewMessage((message) => {
                        messages.push(message);
                    });
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await sleep(15000); // Wait to accumulate messages if any

                runtimeContext.messages = messages;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        expect(runtimeContext.messages).toBeDefined();
        expect(runtimeContext.messages.length >= 0).toBe(true);
        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });

    test('ChatSDK.onNewMessage() with rehydrate flag should return previously received and new incoming messages', async ({ page }) => {
        await page.goto(testPage);

        const content = "Hi";
        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, content }) => {
                const { sleep } = window;

                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                const runtimeContext = {
                    requestId: chatSDK.requestId,
                    chatId: chatSDK.chatToken.chatId,
                    acsEndpoint: chatSDK.chatToken.acsEndpoint,
                };

                await chatSDK.sendMessage({
                    content
                });

                const messages = [];

                try {
                    chatSDK.onNewMessage((message) => {
                        messages.push(message);
                    }, { rehydrate: true });
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await sleep(10000); // Wait to accumulate messages if any

                runtimeContext.messages = messages;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content })
        ]);

        const sentMessages = runtimeContext.messages.filter((message) => message.tags.includes('FromCustomer'));
        const sentMessageContent = sentMessages[0].content;

        expect(sentMessageContent).toBe(content);
        expect(runtimeContext.messages).toBeDefined();
        expect(runtimeContext.messages.length >= 0).toBe(true);
        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });

    test('ChatSDK.endChat() should perform session close', async ({ page }) => {
        await page.goto(testPage);

        const [sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const sessionCloseRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });

    test('ChatSDK.createChatAdapter() should load ACSAdapter', async ({ page }) => {
        await page.goto(testPage);

        const [createChatAdapterResponse, runtimeContext] = await Promise.all([
            page.waitForResponse(response => {
                return response.url().includes("https://unpkg.com/acs_webchat-chat-adapter");
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { preloadChatAdapter } = window;
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                try {
                    await preloadChatAdapter();
                    const chatAdapter = await chatSDK.createChatAdapter();
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        expect(createChatAdapterResponse.status()).toBe(200);
        expect(runtimeContext.errorMessage).not.toBeDefined();
        expect(runtimeContext.errorObject).not.toBeDefined();
    });

    test('ChatSDK.createChatAdapter() script load failures should retry for up to 3 times', async ({ page }) => {
        let retryCount = 0;

        // Mock 404
        const chatAdapterUrl = 'https://unpkg.com/acs_webchat-chat-adapter@**/dist/chat-adapter.js';
        await page.route(chatAdapterUrl, route => {
            retryCount++;
            route.fulfill({ status: 404 });
        });

        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                try {
                    const chatAdapter = await chatSDK.createChatAdapter();
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        await page.unroute(chatAdapterUrl);

        const expectedRetryCount = 3;
        const expectedErrorMessage = "ScriptLoadFailure";
        expect(runtimeContext.errorObject).toBeDefined();
        expect(runtimeContext.errorMessage).toBe(expectedErrorMessage);
        expect(retryCount).toBe(expectedRetryCount);
    });

    test('ChatSDK.startChat() with sendDefaultInitContext should send default init contexts', async ({ page }) => {
        await page.goto(testPage);

        const [chatTokenRequest, chatTokenResponse, sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatv2GetChatTokenPath);
            }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const optionalParams = {
                    sendDefaultInitContext: true
                }

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat(optionalParams);

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const { requestId } = runtimeContext;
        const chatTokenRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestPostData = sessionInitRequest.postDataJSON();

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        expect(sessionInitRequestPostData.browser).not.toBe(null);
        expect(sessionInitRequestPostData.device).not.toBe(null);
        expect(sessionInitRequestPostData.os).not.toBe(null);
        expect(sessionInitRequestPostData.originurl).toBe(testPage);
    });

    test('ChatSDK.getConversationDetails() should not fail', async ({page}) => {
        await page.goto(testPage);

        const [liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, sleep } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                await chatSDK.startChat();

                await sleep(3000); // wait to get conversation details

                const conversationDetails = await chatSDK.getConversationDetails();

                const runtimeContext = {
                    orgUrl: chatSDK.omnichannelConfig.orgUrl,
                    requestId: chatSDK.requestId,
                    conversationDetails
                };

                await chatSDK.endChat();
                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const { requestId, conversationDetails } = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).toBe(conversationDetails.state);
        expect(liveWorkItemDetailsResponseDataJson.ConversationId).toBe(conversationDetails.conversationId);
        expect(liveWorkItemDetailsResponseDataJson.CanRenderPostChat).toBe(conversationDetails.canRenderPostChat);
    });

    test('ChatSDK.getConversationDetails() with liveChatContext should not fail', async ({page}) => {
        await page.goto(testPage);

        const [invalidLiveWorkItemDetailsRequest, invalidLiveWorkItemDetailsResponse, _, liveChatContextLiveWorkItemDetailsRequest, liveChatContextLiveWorkItemDetailsResponse,  runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

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
            }, { omnichannelConfig }),
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext } = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const liveChatContextConversationDetails = await chatSDK.getConversationDetails({liveChatContext: runtimeContext.liveChatContext});
                runtimeContext.liveChatContextConversationDetails = liveChatContextConversationDetails;

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const { invalidRequestId, liveChatContext, invalidRequestIdConversationDetails, liveChatContextConversationDetails } = runtimeContext;
        const invalidLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${invalidRequestId}?channelId=lcw`;
        const liveChatContextLiveWorkItemDetailsRequestUrl = `${runtimeContext.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${liveChatContext.requestId}?channelId=lcw`;

        expect(invalidLiveWorkItemDetailsRequest.url() === invalidLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(invalidLiveWorkItemDetailsResponse.status()).toBe(400);
        expect(liveChatContextLiveWorkItemDetailsRequest.url() === liveChatContextLiveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveChatContextLiveWorkItemDetailsResponse.status()).toBe(200);
        expect(invalidRequestIdConversationDetails).toEqual({});
        expect(liveChatContextConversationDetails.state).toBeDefined();
        expect(liveChatContextConversationDetails.conversationId).toBeDefined();
        expect(liveChatContextConversationDetails.canRenderPostChat).toBeDefined();
    });
});