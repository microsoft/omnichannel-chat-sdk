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
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                chatSDK.setDebug(true);
                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
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
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

            const optionalParams = {
                    getLiveChatConfigOptionalParams: {
                        sendCacheHeaders: true
                    }
                };

                await chatSDK.initialize(optionalParams);

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const requestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}?requestId=${requestId}&channelId=lcw`;
        const requestHeaders = request.headers();
        const cacheHeaders = 'no-store, must-revalidate, no-cache';

        expect(request.url() === requestUrl).toBe(true);
        expect(requestHeaders['cache-control']).toBe(cacheHeaders);
        expect(response.status()).toBe(200);
    });

    test('ChatSDK.startChat() should fetch the chat token & perform session init', async ({page}) => {
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
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const chatTokenRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(chatTokenRequest.url() === chatTokenRequestUrl).toBe(true);
        expect(chatTokenResponse.status()).toBe(200);
        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
    });

    test('ChatSDK.startChat() with customContext should be part of session init payload', async ({page}) => {
        await page.goto(testPage);

        const customContext = {
            'contextKey1': {'value': 'contextValue1', 'isDisplayable': true}, // Valid
            'contextKey2': {'value': 12.34, 'isDisplayable': false}, // Invalid
            'contextKey3': {'value': true} // Invalid
        };

        const [sessionInitRequest, sessionInitResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionInitPath);
            }),
            await page.evaluate(async ({ omnichannelConfig, customContext }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat({customContext});

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, customContext })
        ]);

        const {requestId} = runtimeContext;
        const sessionInitRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const sessionInitRequestPostData = sessionInitRequest.postDataJSON();
        const {customContextData: sessionInitCustomContextData} = sessionInitRequestPostData;

        expect(sessionInitRequest.url() === sessionInitRequestUrl).toBe(true);
        expect(sessionInitResponse.status()).toBe(200);
        expect(sessionInitCustomContextData).toStrictEqual(customContext);
    });

    test('ChatSDK.startChat() with a liveChatContext of a closed conversation should throw an \'ClosedConversation\' error', async ({page}) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const { sleep } = window;

                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    runtimeId: chatSDK.runtimeId,
                    requestId: chatSDK.requestId,
                };

                await chatSDK.startChat();

                const liveChatContext = await chatSDK.getCurrentLiveChatContext();

                await chatSDK.endChat();

                await sleep(3000); // Sleep to avoid race condition

                try {
                    await chatSDK.startChat({liveChatContext: liveChatContext});
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            }, { omnichannelConfig }),
        ]);

        const expectedErrorMessage = "ClosedConversation";
        const {errorMessage} = runtimeContext;
        expect(errorMessage).toBe(expectedErrorMessage);
    });

    test('ChatSDK.startChat() with a liveChatContext should validate the live work item details & should not perform session init call', async ({page}) => {
        await page.goto(testPage);

        const requestUrls = [];
        page.on('request', (request) => {
            if (request.url().includes("livechatconnector")) {
                requestUrls.push(request.url());
            }
        });

        const [_, liveWorkItemDetailsRequest, liveWorkItemDetailsResponse, runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

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
                return request.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK, runtimeContext} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                runtimeContext.runtimeIdSecondSession = chatSDK.runtimeId;
                runtimeContext.requestIdSecondSession = chatSDK.requestId;

                try {
                    await chatSDK.startChat({liveChatContext: runtimeContext.liveChatContext});
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestIdFirstSession: requestId} = runtimeContext;
        const liveWorkItemDetailsRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;
        const liveWorkItemDetailsResponseDataJson = await liveWorkItemDetailsResponse.json();
        const sessionInitCalls = requestUrls.filter((url) => url.includes(OmnichannelEndpoints.LiveChatSessionInitPath));

        expect(liveWorkItemDetailsRequest.url() === liveWorkItemDetailsRequestUrl).toBe(true);
        expect(liveWorkItemDetailsResponse.status()).toBe(200);
        expect(liveWorkItemDetailsResponseDataJson.State).not.toBe('Closed');
        expect(sessionInitCalls.length).toBe(1);
    });

    test('ChatSDK.sendMessage() should send a message with default tags & proper metadata', async ({page}) => {
        await page.goto(testPage);

        const content = "Hi";
        const [sendMessageRequest, sendMessageResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.sendMessagePathPattern)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig, content}) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
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
            }, { omnichannelConfig, content})
        ]);

        const {acsEndpoint, chatId} = runtimeContext;
        const sendMessageRequestPartialUrl = `${acsEndpoint}chat/threads/${encodeURIComponent(chatId)}/messages?api-version=`;
        const sendMessageRequestPostDataDataJson = sendMessageRequest.postDataJSON();
        const {content: sendMessageRequestContent, metadata: {deliveryMode, tags, widgetId}} = sendMessageRequestPostDataDataJson;

        expect(sendMessageRequestContent).toBe(content);
        expect(deliveryMode).toBe('bridged');
        expect(tags.split(',').includes('ChannelId-lcw')).toBe(true);
        expect(tags.split(',').includes('FromCustomer')).toBe(true);
        expect(widgetId).toBe(omnichannelConfig.widgetId);
        expect(sendMessageRequest.url().includes(sendMessageRequestPartialUrl)).toBe(true);
        expect(sendMessageResponse.status()).toBe(201);
    });

    test('ChatSDK.getMessages() should return a list of messages', async ({page}) => {
        await page.goto(testPage);

        const content = "Hi";
        const [getMessagesRequest, getMessagesResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && request.method() === 'GET';
            }),
            page.waitForResponse(response => {
                return response.url().match(ACSEndpoints.getMessagesPathPattern)?.length >= 0 && response.request().method() === 'GET'
            }),
            await page.evaluate(async ({ omnichannelConfig, content}) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
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
            }, { omnichannelConfig, content})
        ]);

        const {acsEndpoint, chatId} = runtimeContext;
        const getMessagesRequestPartialUrl = `${acsEndpoint}chat/threads/${encodeURIComponent(chatId)}/messages?api-version=`;
        const getMessagesResponseDataJson = await getMessagesResponse.json();
        const sentMessages = getMessagesResponseDataJson.value.filter((message) => message.type === 'text');
        const sentMessageContent = sentMessages[0].content.message;

        expect(getMessagesRequest.url().includes(getMessagesRequestPartialUrl)).toBe(true);
        expect(getMessagesResponse.status()).toBe(200);
        expect(getMessagesResponseDataJson).toBeDefined();
        expect(sentMessageContent).toBe(content);
    });

    test('ChatSDK.onNewMessage() should not fail', async ({page}) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig}) => {
                const { sleep } = window;

                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
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
            }, { omnichannelConfig})
        ]);

        expect(runtimeContext.messages).toBeDefined();
        expect(runtimeContext.messages.length >= 0).toBe(true);
        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });

    test('ChatSDK.onNewMessage() with rehydrate flag should return previously received and new incoming messages', async ({page}) => {
        await page.goto(testPage);

        const content = "Hi";
        const [runtimeContext] = await Promise.all([
            await page.evaluate(async ({ omnichannelConfig, content}) => {
                const { sleep } = window;

                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
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
                    }, {rehydrate: true});
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                    runtimeContext.errorObject = `${err}`;
                }

                await sleep(10000); // Wait to accumulate messages if any

                runtimeContext.messages = messages;

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig, content})
        ]);

        const sentMessages = runtimeContext.messages.filter((message) => message.tags.includes('FromCustomer'));
        const sentMessageContent = sentMessages[0].content;

        expect(sentMessageContent).toBe(content);
        expect(runtimeContext.messages).toBeDefined();
        expect(runtimeContext.messages.length >= 0).toBe(true);
        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext?.errorObject).not.toBeDefined();
    });

    test('ChatSDK.endChat() should perform session close', async ({page}) => {
        await page.goto(testPage);

        const [sessionCloseRequest, sessionCloseResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            page.waitForResponse(response => {
                return response.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath);
            }),
            await page.evaluate(async ({ omnichannelConfig }) => {
                const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

                await chatSDK.initialize();

                const runtimeContext = {
                    requestId: chatSDK.requestId
                };

                await chatSDK.startChat();

                await chatSDK.endChat();

                return runtimeContext;
            }, { omnichannelConfig })
        ]);

        const {requestId} = runtimeContext;
        const sessionCloseRequestUrl = `${omnichannelConfig.orgUrl}/${OmnichannelEndpoints.LiveChatSessionClosePath}/${omnichannelConfig.orgId}/${omnichannelConfig.widgetId}/${requestId}?channelId=lcw`;

        expect(sessionCloseRequest.url() === sessionCloseRequestUrl).toBe(true);
        expect(sessionCloseResponse.status()).toBe(200);
    });
});