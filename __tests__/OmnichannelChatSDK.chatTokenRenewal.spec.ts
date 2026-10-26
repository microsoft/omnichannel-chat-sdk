/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import { AMSClientLoadStates } from "../src/utils/AMSClientLoadStates";
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import LiveChatVersion from "../src/core/LiveChatVersion";
import TelemetryEvent from "../src/telemetry/TelemetryEvent";

describe('Omnichannel Chat SDK, chat token renewal', () => {
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    const chatId = '19:thread@thread.v2';

    const createJwt = (expiresInSeconds: number): string => {
        const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
        return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.signature`;
    };

    const initialToken = createJwt(300);

    beforeAll(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }

        if (global.window?.document) {
            (global as any).window.document = undefined;
        }
    });

    const startChat = async (options: { chatSDKConfig?: any, renewalEnabled?: any, renewChatToken?: any, authenticatedUserToken?: string, reconnectId?: string } = {}) => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            useCreateConversation: {
                disable: true,
            },
            ...options.chatSDKConfig
        });
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = false;

        await chatSDK.initialize();

        chatSDK["liveChatConfig"] = options.renewalEnabled === undefined ? {} : {
            LcwFcbConfiguration: {
                lcwChatTokenRenewalEnabled: options.renewalEnabled
            }
        };

        if ('renewChatToken' in options) {
            chatSDK.OCClient.renewChatToken = options.renewChatToken;
        }

        if (options.authenticatedUserToken) {
            chatSDK["authenticatedUserToken"] = options.authenticatedUserToken;
        }

        jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue({
            ChatId: chatId,
            Token: initialToken,
            RegionGtms: '{}',
            ExpiresIn: '300',
            VisitorId: 'visitorId',
            ACSEndpoint: 'acsEndpoint'
        });
        jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(undefined);
        jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue({});
        jest.spyOn(chatSDK.scenarioMarker, 'startScenario');
        jest.spyOn(chatSDK.scenarioMarker, 'completeScenario');
        jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        if (options.reconnectId) {
            chatSDK["isChatReconnect"] = true;
        }

        await chatSDK.startChat(options.reconnectId ? { reconnectId: options.reconnectId } : {});

        const tokenRefresher = (chatSDK.ACSClient.initialize as jest.Mock).mock.calls[0][0].tokenRefresher;
        return { chatSDK, tokenRefresher };
    };

    describe('does not change the existing behavior', () => {
        it.each([
            ['the chat config has no flag', undefined],
            ['the flag is false', 'false'],
            ['the flag is not a boolean', 'yes']
        ])('when %s', async (_, renewalEnabled) => {
            const renewChatToken = jest.fn();
            const { tokenRefresher } = await startChat({ renewalEnabled, renewChatToken });

            expect(tokenRefresher).toBeUndefined();
            expect(renewChatToken).not.toHaveBeenCalled();
        });

        it('when the installed OCSDK does not support renewing the chat token', async () => {
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken: undefined });

            expect(chatSDK.OCClient.renewChatToken).toBeUndefined();
            expect(tokenRefresher).toBeUndefined();
        });

        it('when renewal is disabled in the SDK config', async () => {
            const renewChatToken = jest.fn();
            const { tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, chatSDKConfig: { chatTokenRenewal: { disable: true } } });

            expect(tokenRefresher).toBeUndefined();
        });

        it('when the chat is not LiveChat V2', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.liveChatVersion = LiveChatVersion.V1;
            chatSDK["liveChatConfig"] = { LcwFcbConfiguration: { lcwChatTokenRenewalEnabled: 'true' } };
            chatSDK.OCClient = { renewChatToken: jest.fn() };
            chatSDK["chatToken"] = { chatId, token: initialToken };

            expect(chatSDK["createChatTokenRefresher"](initialToken)).toBeUndefined();
        });
    });

    describe('when enabled', () => {
        it.each([
            ['the string "true"', 'true'],
            ['the string "True"', 'True'],
            ['a boolean', true]
        ])('passes a refresher to ACS when the flag is %s', async (_, renewalEnabled) => {
            const { tokenRefresher } = await startChat({ renewalEnabled, renewChatToken: jest.fn() });

            expect(typeof tokenRefresher).toBe('function');
        });

        it('renews the token of the current chat and updates the chat token', async () => {
            const renewedToken = createJwt(86400);
            const voiceVideoCallToken = { Token: renewedToken };
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken, ExpiresIn: '86400', VoiceVideoCallToken: voiceVideoCallToken });
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });

            await expect(tokenRefresher()).resolves.toBe(renewedToken);

            expect(renewChatToken).toHaveBeenCalledWith(chatSDK.requestId, {});
            const chatToken = await chatSDK.getChatToken();
            expect(chatToken.token).toBe(renewedToken);
            expect(chatToken.expiresIn).toBe('86400');
            expect(chatToken.voiceVideoCallToken).toBe(voiceVideoCallToken);
            expect(chatToken.chatId).toBe(chatId);
            expect(chatToken.visitorId).toBe('visitorId');
            expect(chatToken.acsEndpoint).toBe('acsEndpoint');
            await expect(chatSDK.getCallingToken()).resolves.toBe(renewedToken);
            expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(TelemetryEvent.RenewChatToken, { RequestId: chatSDK.requestId, ChatId: chatId });
        });

        it('renews a reconnected chat by its reconnect id', async () => {
        const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: createJwt(86400) });
        const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, reconnectId: 'reconnectId', chatSDKConfig: { chatReconnect: { disable: false } } });

        await tokenRefresher();

        expect(renewChatToken).toHaveBeenCalledWith('reconnectId', {});
        expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(TelemetryEvent.RenewChatToken, { RequestId: chatSDK.requestId, ChatId: chatId });
    });

    it('keeps the existing voice and video token when the response has none', async () => {
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: createJwt(86400), ExpiresIn: '86400' });
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });
            chatSDK["chatToken"].voiceVideoCallToken = { Token: 'existing' };

            await tokenRefresher();

            expect((await chatSDK.getChatToken()).voiceVideoCallToken).toEqual({ Token: 'existing' });
        });

        it('uses a fresh token from the auth token provider for authenticated chats', async () => {
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: createJwt(86400) });
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, authenticatedUserToken: 'startToken' });
            chatSDK.chatSDKConfig.getAuthToken = jest.fn().mockResolvedValue('freshToken');

            await tokenRefresher();

            expect(renewChatToken).toHaveBeenCalledWith(chatSDK.requestId, { authenticatedUserToken: 'freshToken' });
            expect(chatSDK["authenticatedUserToken"]).toBe('startToken');
        });

        it.each([
            ['throws', () => Promise.reject(new Error('auth'))],
            ['returns no token', () => Promise.resolve(null)]
        ])('uses the token the chat was authenticated with when the auth token provider %s', async (_, getAuthToken) => {
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: createJwt(86400) });
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, authenticatedUserToken: 'startToken' });
            chatSDK.chatSDKConfig.getAuthToken = jest.fn(getAuthToken);

            await tokenRefresher();

            expect(renewChatToken).toHaveBeenCalledWith(chatSDK.requestId, { authenticatedUserToken: 'startToken' });
        });

        describe('after an HTTP error', () => {
            const httpError = (status: number) => Object.assign(new Error(`Request failed with status code ${status}`), { response: { status } });
            const cooldownInMs = 60 * 1000;
            let currentTime: number;

            beforeEach(() => {
                currentTime = Date.now();
                jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
            });

            afterEach(() => {
                jest.restoreAllMocks();
            });

            it.each([400, 401, 403])('retries an authenticated renewal after HTTP %d once the cooldown passes', async (status) => {
                const renewedToken = createJwt(86400);
                const renewChatToken = jest.fn()
                    .mockRejectedValueOnce(httpError(status))
                    .mockResolvedValueOnce({ ChatId: chatId, Token: renewedToken, ExpiresIn: '86400' });
                const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, authenticatedUserToken: 'startToken' });

                await expect(tokenRefresher()).resolves.toBe(initialToken);
                currentTime += cooldownInMs;
                await expect(tokenRefresher()).resolves.toBe(renewedToken);

                expect(renewChatToken).toHaveBeenCalledTimes(2);
                expect((await chatSDK.getChatToken()).token).toBe(renewedToken);
            });

            it.each([404, 405])('stops renewing an authenticated chat after HTTP %d', async (status) => {
                const renewChatToken = jest.fn().mockRejectedValue(httpError(status));
                const { tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken, authenticatedUserToken: 'startToken' });

                await expect(tokenRefresher()).resolves.toBe(initialToken);
                currentTime += cooldownInMs;
                await expect(tokenRefresher()).resolves.toBe(initialToken);

                expect(renewChatToken).toHaveBeenCalledTimes(1);
            });

            it.each([400, 401, 403, 404, 405])('stops renewing an anonymous chat after HTTP %d', async (status) => {
                const renewChatToken = jest.fn().mockRejectedValue(httpError(status));
                const { tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });

                await expect(tokenRefresher()).resolves.toBe(initialToken);
                currentTime += cooldownInMs;
                await expect(tokenRefresher()).resolves.toBe(initialToken);

                expect(renewChatToken).toHaveBeenCalledTimes(1);
            });
        });

        it.each([
            ['the API is not deployed', Object.assign(new Error('Request failed with status code 404'), { response: { status: 404 } })],
            ['the API fails', Object.assign(new Error('Request failed with status code 500'), { response: { status: 500 } })],
            ['the request times out', new Error('Request Timed Out')]
        ])('falls back to the current token when %s', async (_, error) => {
            const renewChatToken = jest.fn().mockRejectedValue(error);
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });

            await expect(tokenRefresher()).resolves.toBe(initialToken);

            expect((await chatSDK.getChatToken()).token).toBe(initialToken);
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledWith(TelemetryEvent.RenewChatToken, expect.objectContaining({ RequestId: chatSDK.requestId, ChatId: chatId }));
        });

        it('does not call the API after the chat ended', async () => {
            const renewChatToken = jest.fn();
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });
            chatSDK.requestId = 'newRequestId';
            chatSDK["chatToken"] = {};

            await expect(tokenRefresher()).resolves.toBe(initialToken);

            expect(renewChatToken).not.toHaveBeenCalled();
        });

        it('does not call the API while the chat is ending', async () => {
            const renewChatToken = jest.fn();
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });
            chatSDK["isEndingChat"] = true;

            await expect(tokenRefresher()).resolves.toBe(initialToken);

            expect(renewChatToken).not.toHaveBeenCalled();
        });

        it('does not update a new chat with the token renewed for the previous chat', async () => {
            let chatSDKRef: any;
            const renewChatToken = jest.fn().mockImplementation(async () => {
                chatSDKRef.requestId = 'newRequestId';
                chatSDKRef["chatToken"] = { chatId: 'newChat', token: 'newChatToken' };
                return { ChatId: chatId, Token: createJwt(86400) };
            });
            const { chatSDK, tokenRefresher } = await startChat({ renewalEnabled: 'true', renewChatToken });
            chatSDKRef = chatSDK;

            await expect(tokenRefresher()).resolves.toBe(initialToken);

            expect(chatSDK["chatToken"]).toEqual({ chatId: 'newChat', token: 'newChatToken' });
        });
    });

    describe('attachment client', () => {
        const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

        const startChatWithAttachments = async (renewChatToken: jest.Mock, initialize: jest.Mock, loadState = AMSClientLoadStates.LOADED) => {
            const result = await startChat({ renewalEnabled: 'true', renewChatToken });
            result.chatSDK["isAMSClientAllowed"] = true;
            result.chatSDK["AMSClientLoadCurrentState"] = loadState;
            result.chatSDK["AMSClient"] = { initialize };
            return result;
        };

        it('gets the renewed token', async () => {
            const renewedToken = createJwt(86400);
            const initialize = jest.fn().mockResolvedValue(undefined);
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken });
            const { chatSDK, tokenRefresher } = await startChatWithAttachments(renewChatToken, initialize);

            await expect(tokenRefresher()).resolves.toBe(renewedToken);
            await flushPromises();

            expect(initialize).toHaveBeenCalledTimes(1);
            expect(initialize.mock.calls[0][0].chatToken).toBe(chatSDK["chatToken"]);
            expect(initialize.mock.calls[0][0].chatToken).toEqual(expect.objectContaining({ chatId, token: renewedToken, visitorId: 'visitorId', acsEndpoint: 'acsEndpoint' }));
            expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(TelemetryEvent.RefreshAttachmentClientToken, { RequestId: chatSDK.requestId, ChatId: chatId });
        });

        it('is not changed when renewal fails', async () => {
            const initialize = jest.fn();
            const renewChatToken = jest.fn().mockRejectedValue(Object.assign(new Error('Request failed with status code 404'), { response: { status: 404 } }));
            const { chatSDK, tokenRefresher } = await startChatWithAttachments(renewChatToken, initialize);

            await expect(tokenRefresher()).resolves.toBe(initialToken);
            await flushPromises();

            expect(initialize).not.toHaveBeenCalled();
            expect(chatSDK.scenarioMarker.startScenario).not.toHaveBeenCalledWith(TelemetryEvent.RefreshAttachmentClientToken, expect.anything());
        });

        it.each([
            ['attachments are not allowed', (chatSDK: any) => { chatSDK["isAMSClientAllowed"] = false; }],
            ['the attachment client is not loaded', (chatSDK: any) => { chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.LOADING; }],
            ['there is no attachment client', (chatSDK: any) => { chatSDK["AMSClient"] = null; }]
        ])('is not changed when %s', async (_, arrange) => {
            const renewedToken = createJwt(86400);
            const initialize = jest.fn();
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken });
            const { chatSDK, tokenRefresher } = await startChatWithAttachments(renewChatToken, initialize);
            arrange(chatSDK);

            await expect(tokenRefresher()).resolves.toBe(renewedToken);
            await flushPromises();

            expect(initialize).not.toHaveBeenCalled();
        });

        it.each([
            ['rejects', jest.fn().mockRejectedValue(new Error('ams'))],
            ['throws', jest.fn().mockImplementation(() => { throw new Error('ams'); })]
        ])('does not affect renewal when it %s', async (_, initialize) => {
            const renewedToken = createJwt(86400);
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken });
            const { chatSDK, tokenRefresher } = await startChatWithAttachments(renewChatToken, initialize);

            await expect(tokenRefresher()).resolves.toBe(renewedToken);
            await flushPromises();

            expect((await chatSDK.getChatToken()).token).toBe(renewedToken);
            expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(TelemetryEvent.RenewChatToken, expect.anything());
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledWith(TelemetryEvent.RefreshAttachmentClientToken, expect.objectContaining({ RequestId: chatSDK.requestId, ChatId: chatId }));
        });
    });

    describe('recovery from 401 with an unexpired token', () => {
        const getUnauthorizedRecovery = (chatSDK: any) => (chatSDK.ACSClient.initialize as jest.Mock).mock.calls[0][0].unauthorizedRecovery;

        it.each([
            ['renewal is not enabled', { renewalEnabled: 'false', renewChatToken: jest.fn() }],
            ['the installed OCSDK does not support renewing the chat token', { renewalEnabled: 'true', renewChatToken: undefined }],
            ['renewal is disabled in the SDK config', { renewalEnabled: 'true', renewChatToken: jest.fn(), chatSDKConfig: { chatTokenRenewal: { disable: true } } }],
            ['recovery is disabled in the SDK config', { renewalEnabled: 'true', renewChatToken: jest.fn(), chatSDKConfig: { chatTokenRenewal: { disableUnauthorizedRecovery: true } } }]
        ])('is not enabled when %s', async (_, options) => {
            const { chatSDK } = await startChat(options);

            expect(getUnauthorizedRecovery(chatSDK)).toBeUndefined();
            expect(chatSDK["chatTokenUnauthorizedRecovery"]).toBeNull();
        });

        it('renews the token of the current chat after a 401', async () => {
            const renewedToken = createJwt(86400);
            const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken });
            const { chatSDK } = await startChat({ renewalEnabled: 'true', renewChatToken });
            const recovery = getUnauthorizedRecovery(chatSDK);

            await expect(recovery.recover(initialToken, 'ChatRequest')).resolves.toBe(renewedToken);

            expect(renewChatToken).toHaveBeenCalledTimes(1);
            expect((await chatSDK.getChatToken()).token).toBe(renewedToken);
            expect(chatSDK.scenarioMarker.startScenario).toHaveBeenCalledWith(TelemetryEvent.ChatTokenUnauthorizedRecovery, { RequestId: chatSDK.requestId, ChatId: chatId });
            expect(chatSDK.scenarioMarker.completeScenario).toHaveBeenCalledWith(TelemetryEvent.ChatTokenUnauthorizedRecovery, { RequestId: chatSDK.requestId, ChatId: chatId });
        });

        it('reports a failure when no new token is available', async () => {
            const renewChatToken = jest.fn().mockRejectedValue(Object.assign(new Error('Request failed with status code 500'), { response: { status: 500 } }));
            const { chatSDK } = await startChat({ renewalEnabled: 'true', renewChatToken });

            await expect(getUnauthorizedRecovery(chatSDK).recover(initialToken, 'ChatRequest')).resolves.toBeUndefined();

            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledWith(TelemetryEvent.ChatTokenUnauthorizedRecovery, {
                RequestId: chatSDK.requestId,
                ChatId: chatId,
                ExceptionDetails: JSON.stringify({ response: 'NoNewToken', source: 'ChatRequest' })
            });
        });

        describe('attachment client', () => {
            const unauthorized = () => new Error('AMSUploadDocumentFailed: 401 Unauthorized');

            const createAttachmentClient = (uploadDocument: jest.Mock) => {
                const client: any = { chatToken: { token: initialToken }, uploadDocument };
                client.initialize = jest.fn(async ({ chatToken }: any) => { client.chatToken = chatToken; });
                return client;
            };

            it('retries an upload that failed with 401 once with a renewed token', async () => {
                const renewedToken = createJwt(86400);
                const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: renewedToken });
                const { chatSDK } = await startChat({ renewalEnabled: 'true', renewChatToken });
                const uploadDocument = jest.fn().mockRejectedValueOnce(unauthorized()).mockResolvedValueOnce('uploaded');
                const client = createAttachmentClient(uploadDocument);

                await expect(chatSDK["getAttachmentClientWithUnauthorizedRecovery"](client).uploadDocument('id', {})).resolves.toBe('uploaded');

                expect(uploadDocument).toHaveBeenCalledTimes(2);
                expect(client.initialize).toHaveBeenCalledWith({ chatToken: expect.objectContaining({ chatId, token: renewedToken, visitorId: 'visitorId' }) });
            });

            it('does not give a token to the client after the chat changed', async () => {
                const renewChatToken = jest.fn().mockResolvedValue({ ChatId: chatId, Token: createJwt(86400) });
                const { chatSDK } = await startChat({ renewalEnabled: 'true', renewChatToken });
                const error = unauthorized();
                const uploadDocument = jest.fn().mockRejectedValue(error);
                const client = createAttachmentClient(uploadDocument);
                const wrapped = chatSDK["getAttachmentClientWithUnauthorizedRecovery"](client);
                chatSDK["chatTokenUnauthorizedRecovery"] = null;

                await expect(wrapped.uploadDocument('id', {})).rejects.toBe(error);

                expect(client.initialize).not.toHaveBeenCalled();
                expect(uploadDocument).toHaveBeenCalledTimes(1);
            });

            it('is the client itself when recovery is not enabled', async () => {
                const { chatSDK } = await startChat({ renewalEnabled: 'false' });
                const client = createAttachmentClient(jest.fn());

                expect(chatSDK["getAttachmentClientWithUnauthorizedRecovery"](client)).toBe(client);
            });
        });
    });
});
