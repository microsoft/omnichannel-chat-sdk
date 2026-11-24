/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import { ChatSDKErrorName } from "../src/core/ChatSDKError";
import TelemetryEvent from "../src/telemetry/TelemetryEvent";

describe('Omnichannel Chat SDK, authenticated user token preflight', () => {
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    const createJwt = (expiresInSeconds: number): string => {
        const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
        return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.signature`;
    };

    const unauthorizedError = () => Object.assign(new Error('Unauthorized'), { response: { status: 401 } });

    beforeAll(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }

        if (global.window?.document) {
            (global as any).window.document = undefined;
        }
    });

    const createChatSDK = async (options: { authTokenPreflight?: any, getAuthToken?: any, token?: string, useCreateConversation?: any } = {}) => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            getAuthToken: options.getAuthToken,
            authTokenPreflight: options.authTokenPreflight,
            useCreateConversation: options.useCreateConversation
        });
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = false;

        await chatSDK.initialize();

        chatSDK["authenticatedUserToken"] = options.token ?? createJwt(30);
        chatSDK.scenarioMarker.singleRecord = jest.fn();

        return chatSDK;
    };

    it('should not call getAuthToken when the host disables the preflight', async () => {
        const expiredToken = createJwt(-600);
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken, token: expiredToken, authTokenPreflight: { disable: true } });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockRejectedValue(unauthorizedError());

        await expect(chatSDK.getUnreadMessageCount()).rejects.toMatchObject({ message: ChatSDKErrorName.UnreadMessageCountRetrievalFailure });

        expect(getAuthToken).not.toHaveBeenCalled();
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledTimes(1);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(expiredToken);
    });

    it('should refresh a token near expiry before the request by default', async () => {
        const freshToken = createJwt(3600);
        const getAuthToken = jest.fn().mockResolvedValue(freshToken);
        const chatSDK = await createChatSDK({ getAuthToken });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockResolvedValue({ count: 1 });

        await chatSDK.getUnreadMessageCount();

        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(freshToken);
        expect(chatSDK["authenticatedUserToken"]).toBe(freshToken);
    });

    it('should not refresh a token that is not near expiry', async () => {
        const token = createJwt(3600);
        const getAuthToken = jest.fn();
        const chatSDK = await createChatSDK({ getAuthToken, token });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockResolvedValue({ count: 1 });

        await chatSDK.getUnreadMessageCount();

        expect(getAuthToken).not.toHaveBeenCalled();
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(token);
    });

    it('should not refresh when the host disables the preflight', async () => {
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken, authTokenPreflight: { disable: true } });

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(getAuthToken).not.toHaveBeenCalled();
    });

    it('should share one refresh between concurrent callers', async () => {
        const freshToken = createJwt(3600);
        let resolveToken: (token: string) => void = () => undefined;
        const getAuthToken = jest.fn().mockReturnValue(new Promise<string>((resolve) => { resolveToken = resolve; }));
        const chatSDK = await createChatSDK({ getAuthToken });

        const first = chatSDK["ensureFreshAuthToken"]("First");
        const second = chatSDK["ensureFreshAuthToken"]("Second");
        resolveToken(freshToken);
        await Promise.all([first, second]);

        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK["authenticatedUserToken"]).toBe(freshToken);
    });

    it('should keep the current token when getAuthToken times out', async () => {
        const token = createJwt(30);
        let resolveLateToken: (token: string) => void = () => undefined;
        const getAuthToken = jest.fn().mockReturnValue(new Promise<string>((resolve) => { resolveLateToken = resolve; }));
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { refreshTimeoutInMs: 10 } });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(chatSDK["authenticatedUserToken"]).toBe(token);
        expect(failScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.objectContaining({ ExceptionDetails: "Timeout" }));
        expect(chatSDK["authTokenRefreshPromise"]).toBeNull();

        // A result that arrives after the timeout must not replace a newer token
        const newerToken = createJwt(7200);
        chatSDK["authenticatedUserToken"] = newerToken;
        resolveLateToken(createJwt(3600));
        await Promise.resolve();
        await Promise.resolve();
        expect(chatSDK["authenticatedUserToken"]).toBe(newerToken);
    });

    it('should not accept an expired token from getAuthToken', async () => {
        const token = createJwt(30);
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(-10));
        const chatSDK = await createChatSDK({ getAuthToken, token });

        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(chatSDK["authenticatedUserToken"]).toBe(token);
        expect(failScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.objectContaining({
            TokenChanged: "true",
            ReturnedTokenExpired: "true",
            ReturnedTokenSecondsToExpiryBucket: "expired",
            ExceptionDetails: "ExpiredAuthToken"
        }));
    });

    it('should report a fixed reason instead of the provider error message', async () => {
        const token = createJwt(30);
        const getAuthToken = jest.fn().mockRejectedValue(new Error('user@contoso.com secret-detail'));
        const chatSDK = await createChatSDK({ getAuthToken, token });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        const data = failScenario.mock.calls[0][1] as Record<string, string>;
        expect(data.ExceptionDetails).toBe("ProviderError");
        expect(JSON.stringify(data)).not.toContain('secret-detail');
    });

    it('should report UndefinedAuthToken when getAuthToken returns no token', async () => {
        const token = createJwt(30);
        const getAuthToken = jest.fn().mockResolvedValue(undefined);
        const chatSDK = await createChatSDK({ getAuthToken, token });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(chatSDK["authenticatedUserToken"]).toBe(token);
        expect(failScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.objectContaining({ ExceptionDetails: "UndefinedAuthToken" }));
    });

    it('should report when getAuthToken returns the same expired token without logging it', async () => {
        const token = createJwt(-10);
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        const data = failScenario.mock.calls[0][1] as Record<string, string>;
        expect(data).toEqual(expect.objectContaining({ TokenChanged: "false", ReturnedTokenExpired: "true" }));
        expect(JSON.stringify(data)).not.toContain(token);
    });

    it('should report a changed, valid token on success', async () => {
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken });
        const completeScenario = jest.spyOn(chatSDK.scenarioMarker, 'completeScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(completeScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.objectContaining({
            TokenChanged: "true",
            ReturnedTokenExpired: "false",
            ReturnedTokenSecondsToExpiryBucket: ">300s"
        }));
    });

    it('should retry once with a new token after HTTP 401', async () => {
        const token = createJwt(3600);
        const freshToken = createJwt(7200);
        const getAuthToken = jest.fn().mockResolvedValue(freshToken);
        const chatSDK = await createChatSDK({ getAuthToken, token });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount')
            .mockRejectedValueOnce(unauthorizedError())
            .mockResolvedValueOnce({ count: 2 });

        const result = await chatSDK.getUnreadMessageCount();

        expect(result).toEqual({ count: 2 });
        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenNthCalledWith(1, token);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenNthCalledWith(2, freshToken);
        expect(chatSDK.scenarioMarker.singleRecord).toHaveBeenCalledWith(TelemetryEvent.AuthTokenRejected, expect.objectContaining({ Operation: "GetUnreadMessageCount" }));
    });

    it('should not retry after HTTP 401 when the token cannot be refreshed', async () => {
        const token = createJwt(3600);
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token });
        const request = jest.fn().mockRejectedValue(unauthorizedError());

        await expect(chatSDK["withAuthTokenRetry"]("Test", request)).rejects.toThrow('Unauthorized');

        expect(request).toHaveBeenCalledTimes(1);
    });

    it('should not retry errors other than HTTP 401', async () => {
        const getAuthToken = jest.fn();
        const chatSDK = await createChatSDK({ getAuthToken, token: createJwt(3600) });
        const request = jest.fn().mockRejectedValue(Object.assign(new Error('Server error'), { response: { status: 500 } }));

        await expect(chatSDK["withAuthTokenRetry"]("Test", request)).rejects.toThrow('Server error');

        expect(request).toHaveBeenCalledTimes(1);
        expect(getAuthToken).not.toHaveBeenCalled();
    });

    it.each([
        ['missing', {}, false],
        ['false', { retainSessionOnAuthExpired: false }, false],
        ['true', { retainSessionOnAuthExpired: true }, true],
        ['true with disable', { retainSessionOnAuthExpired: true, disable: true }, false]
    ])('should throw AuthenticationExpired for HTTP 401 only when retainSessionOnAuthExpired is opted in (%s)', async (_name, authTokenPreflight, shouldThrow) => {
        const chatSDK = await createChatSDK({ getAuthToken: jest.fn(), authTokenPreflight });
        const action = () => chatSDK["throwIfAuthenticationExpired"](unauthorizedError(), TelemetryEvent.CloseChatSession);

        if (shouldThrow) {
            expect(action).toThrow(ChatSDKErrorName.AuthenticationExpired);
        } else {
            expect(action).not.toThrow();
        }
    });

    it.each([
        ['JWT', createJwt(3600)],
        ['opaque', 'opaque-token']
    ])('should release the session with ConversationClosureFailure by default when endChat gets HTTP 401 (%s token)', async (_name, token) => {
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token });
        chatSDK["chatToken"] = { chatId: 'chat-id' };
        const requestId = chatSDK.requestId;
        jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValue(unauthorizedError());

        await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureFailure });

        expect(chatSDK.requestId).not.toBe(requestId);
        expect(chatSDK["chatToken"]).toEqual({});
    });

    it('should keep the session when endChat fails because the sign-in expired so it can be retried', async () => {
        const token = createJwt(3600);
        const freshToken = createJwt(7200);
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { retainSessionOnAuthExpired: true } });
        chatSDK["chatToken"] = { chatId: 'chat-id' };
        const requestId = chatSDK.requestId;
        jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValueOnce(unauthorizedError());

        await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.AuthenticationExpired });

        expect(chatSDK.requestId).toBe(requestId);
        expect(chatSDK["chatToken"]).toEqual({ chatId: 'chat-id' });
        expect(chatSDK["isEndingChat"]).toBe(false);

        getAuthToken.mockResolvedValue(freshToken);
        chatSDK["authenticatedUserToken"] = freshToken;
        (chatSDK.OCClient.sessionClose as jest.Mock).mockResolvedValueOnce(undefined);

        await chatSDK.endChat();

        expect(chatSDK.OCClient.sessionClose).toHaveBeenNthCalledWith(2, requestId, expect.objectContaining({ authenticatedUserToken: freshToken }));
        expect(chatSDK.requestId).not.toBe(requestId);
        expect(chatSDK["chatToken"]).toEqual({});
    });

    it('should release the session when endChat fails with HTTP 401 and the preflight is disabled', async () => {
        const chatSDK = await createChatSDK({ getAuthToken: jest.fn(), authTokenPreflight: { disable: true } });
        chatSDK["chatToken"] = { chatId: 'chat-id' };
        const requestId = chatSDK.requestId;
        jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValueOnce(unauthorizedError());

        await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureFailure });

        expect(chatSDK.requestId).not.toBe(requestId);
        expect(chatSDK["chatToken"]).toEqual({});
    });

    describe('retryable close failure', () => {
        const httpError = (status: number, data?: unknown) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });
        const networkError = () => Object.assign(new Error('Network Error'), { isAxiosError: true, request: {} });
        const timeoutError = () => new Error('ClientHTTPTimeoutError: Server took too long to respond');

        const createClosingChatSDK = async (authTokenPreflight: any, closeError: unknown) => {
            const chatSDK = await createChatSDK({ getAuthToken: jest.fn().mockResolvedValue(createJwt(3600)), token: createJwt(3600), authTokenPreflight });
            chatSDK["chatToken"] = { chatId: 'chat-id' };
            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValue(closeError);
            return chatSDK;
        };

        it.each([
            ['HTTP 401', httpError(401)],
            ['HTTP 408', httpError(408)],
            ['HTTP 429', httpError(429)],
            ['HTTP 499', httpError(499)],
            ['HTTP 500', httpError(500)],
            ['HTTP 503', httpError(503)],
            ['HTTP 400 public key configuration (string body)', httpError(400, 'Invalid public key configuration.')],
            ['HTTP 400 public key configuration (message body)', httpError(400, { message: 'Invalid public key configuration' })],
            ['network error', networkError()],
            ['ocsdk timeout', timeoutError()]
        ])('should keep the session and throw ConversationClosureRetryable on %s when opted in', async (_name, closeError) => {
            const chatSDK = await createClosingChatSDK({ retainSessionOnRetryableCloseFailure: true }, closeError);
            const requestId = chatSDK.requestId;

            await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureRetryable });

            expect(chatSDK.requestId).toBe(requestId);
            expect(chatSDK["chatToken"]).toEqual({ chatId: 'chat-id' });
            expect(chatSDK["isEndingChat"]).toBe(false);
        });

        it.each([
            ['HTTP 400 when opted in', { retainSessionOnRetryableCloseFailure: true }, httpError(400)],
            ['HTTP 400 with another message when opted in', { retainSessionOnRetryableCloseFailure: true }, httpError(400, 'OrgId and WidgetAppId must be valid GUID')],
            ['HTTP 400 public key configuration when not opted in', {}, httpError(400, 'Invalid public key configuration.')],
            ['HTTP 403 when opted in', { retainSessionOnRetryableCloseFailure: true }, httpError(403)],
            ['HTTP 404 when opted in', { retainSessionOnRetryableCloseFailure: true }, httpError(404)],
            ['a non-HTTP error when opted in', { retainSessionOnRetryableCloseFailure: true }, new TypeError('bug')],
            ['HTTP 500 when not opted in', {}, httpError(500)],
            ['HTTP 500 when the preflight is disabled', { retainSessionOnRetryableCloseFailure: true, disable: true }, httpError(500)]
        ])('should release the session with ConversationClosureFailure on %s', async (_name, authTokenPreflight, closeError) => {
            const chatSDK = await createClosingChatSDK(authTokenPreflight, closeError);
            const requestId = chatSDK.requestId;

            await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureFailure });

            expect(chatSDK.requestId).not.toBe(requestId);
            expect(chatSDK["chatToken"]).toEqual({});
        });

        it('should throw AuthenticationExpired for HTTP 401 when both options are set', async () => {
            const chatSDK = await createClosingChatSDK({ retainSessionOnAuthExpired: true, retainSessionOnRetryableCloseFailure: true }, httpError(401));

            await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.AuthenticationExpired });
        });

        it('should close with the same request id when endChat is retried', async () => {
            const chatSDK = await createClosingChatSDK({ retainSessionOnRetryableCloseFailure: true }, httpError(503));
            const requestId = chatSDK.requestId;

            await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureRetryable });
            (chatSDK.OCClient.sessionClose as jest.Mock).mockResolvedValueOnce(undefined);
            await chatSDK.endChat();

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(2);
            expect((chatSDK.OCClient.sessionClose as jest.Mock).mock.calls[1][0]).toBe(requestId);
            expect(chatSDK.requestId).not.toBe(requestId);
            expect(chatSDK["chatToken"]).toEqual({});
        });
    });

    describe('pending agent-end check', () => {
        const agentLeftEvent = { participantsRemoved: [{ id: 'agent-id' }] };

        const setupAgentEnd = async (getAuthToken: jest.Mock, token: string, authTokenPreflight?: any, lookupError: any = unauthorizedError()) => {
            const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight });
            chatSDK["chatToken"] = { chatId: 'chat-id' };
            const handlers: { onThreadUpdate: any } = { onThreadUpdate: null };
            chatSDK.conversation = {
                registerOnThreadUpdate: jest.fn((handler: any) => { handlers.onThreadUpdate = handler; }),
                disconnect: jest.fn()
            };
            jest.spyOn(chatSDK, 'stopPolling').mockImplementation(() => undefined);
            const onAgentEndSession = jest.fn();
            await chatSDK.onAgentEndSession(onAgentEndSession);
            const getLWIDetails = jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockRejectedValue(lookupError);

            // Every status lookup fails, by default because the sign-in expired
            const handled = handlers.onThreadUpdate(agentLeftEvent);
            await jest.advanceTimersByTimeAsync(5000);
            await handled;

            return { chatSDK, onAgentEndSession, getLWIDetails };
        };

        const flushPromises = async () => {
            for (let i = 0; i < 10; i++) {
                await Promise.resolve();
            }
        };

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it.each([
            ['Closed', 1],
            ['WrapUp', 1],
            ['Active', 0]
        ])('should settle the pending check after a fresh token arrives (%s)', async (state, expectedCallbacks) => {
            const token = createJwt(3600);
            const getAuthToken = jest.fn().mockResolvedValue(token);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(getAuthToken, token);

            expect(getLWIDetails).toHaveBeenCalledTimes(3);
            expect(onAgentEndSession).not.toHaveBeenCalled();
            expect(chatSDK["pendingAgentEndCheck"]).not.toBeNull();

            getAuthToken.mockResolvedValue(createJwt(7200));
            getLWIDetails.mockResolvedValue({ State: state, ConversationId: 'conversation-id' });
            await chatSDK["ensureFreshAuthToken"]("Test", true);
            await flushPromises();

            expect(onAgentEndSession).toHaveBeenCalledTimes(expectedCallbacks);
            if (expectedCallbacks) {
                expect(onAgentEndSession).toHaveBeenCalledWith(agentLeftEvent);
            }
            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
            expect(chatSDK.scenarioMarker.singleRecord).toHaveBeenCalledWith(TelemetryEvent.PendingAgentEndCheckSettled, expect.objectContaining({ Outcome: expectedCallbacks ? 'Closed' : 'Active' }));
        });

        it('should settle the pending check on the next successful host status lookup and fire only once', async () => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token);

            getLWIDetails.mockResolvedValue({ State: 'Closed', ConversationId: 'conversation-id' });
            await chatSDK.getConversationDetails();
            await chatSDK.getConversationDetails();

            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
        });

        it('should drop the pending check when the chat ends', async () => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token);
            const requestId = chatSDK.requestId;

            chatSDK["releaseEndedChat"]();
            getLWIDetails.mockResolvedValue({ State: 'Closed', ConversationId: 'conversation-id' });
            await chatSDK.getConversationDetails({ liveChatContext: { requestId, chatToken: { chatId: 'chat-id' } } });

            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
            expect(onAgentEndSession).not.toHaveBeenCalled();
        });

        const endChatWhileAgentEndSettles = async (closeOutcome: 'unauthorized' | 'success', reconnectId?: string) => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token, { retainSessionOnAuthExpired: true });
            if (reconnectId) {
                chatSDK["chatSDKConfig"].chatReconnect = { disable: false };
                chatSDK["isChatReconnect"] = true;
                chatSDK["isPersistentChat"] = false;
                chatSDK["reconnectId"] = reconnectId;
            }
            let finishClose: () => void = () => undefined;
            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockImplementation(() => new Promise<void>((resolve, reject) => {
                finishClose = () => closeOutcome === 'success' ? resolve() : reject(unauthorizedError());
            }));

            const requestIdBeforeEnd = chatSDK.requestId;
            const endChat = chatSDK.endChat();
            const endChatResult = endChat.then(() => 'resolved', (error: any) => error.message);
            await flushPromises();
            expect(chatSDK["isEndingChat"]).toBe(true);

            // A host status read reports Closed while endChat() is still running
            getLWIDetails.mockResolvedValue({ State: 'Closed', ConversationId: 'conversation-id' });
            await chatSDK.getConversationDetails();
            expect(onAgentEndSession).not.toHaveBeenCalled();

            finishClose();
            const result = await endChatResult;
            expect(onAgentEndSession).not.toHaveBeenCalled();
            await jest.advanceTimersByTimeAsync(0);

            return { chatSDK, onAgentEndSession, result, requestIdBeforeEnd };
        };

        it('should deliver an agent close seen during endChat once when endChat keeps the session', async () => {
            const { chatSDK, onAgentEndSession, result } = await endChatWhileAgentEndSettles('unauthorized');

            expect(result).toBe(ChatSDKErrorName.AuthenticationExpired);
            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
            expect(onAgentEndSession).toHaveBeenCalledWith(agentLeftEvent);

            await chatSDK.getConversationDetails();
            await jest.advanceTimersByTimeAsync(0);
            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
            expect(chatSDK["deferredAgentEndSession"]).toBeNull();
        });

        it('should deliver an agent close seen during endChat on a reconnect session that keeps the session', async () => {
            const { chatSDK, onAgentEndSession, result, requestIdBeforeEnd } = await endChatWhileAgentEndSettles('unauthorized', 'reconnect-id');

            // The kept session keeps its own requestId, so the ACS token refresher still sees the chat as active
            expect(chatSDK.requestId).toBe(requestIdBeforeEnd);
            expect(result).toBe(ChatSDKErrorName.AuthenticationExpired);
            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
        });

        it('should end the chat as before when lookups fail for a reason other than an expired sign-in', async () => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token, undefined, { response: { status: 503 } });

            expect(getLWIDetails).toHaveBeenCalledTimes(3);
            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
        });

        it('should not let an Active read that started before the check clear it', async () => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token);
            const pendingCheck = chatSDK["pendingAgentEndCheck"];
            chatSDK["pendingAgentEndCheck"] = null;
            let finishRead: (details: any) => void = () => undefined;
            getLWIDetails.mockImplementationOnce(() => new Promise((resolve) => { finishRead = resolve; }));

            const staleRead = chatSDK.getConversationDetails();
            await flushPromises();
            chatSDK["pendingAgentEndCheck"] = pendingCheck;
            finishRead({ State: 'Active', ConversationId: 'conversation-id' });
            await staleRead;

            expect(chatSDK["pendingAgentEndCheck"]).toBe(pendingCheck);
            expect(onAgentEndSession).not.toHaveBeenCalled();

            getLWIDetails.mockResolvedValue({ State: 'Closed', ConversationId: 'conversation-id' });
            await chatSDK.getConversationDetails();
            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
        });

        it('should settle the pending check after authenticateChat sets a new token', async () => {
            const token = createJwt(3600);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(jest.fn().mockResolvedValue(token), token);
            chatSDK.OCClient.midConversationAuthenticateChat = jest.fn().mockResolvedValue(undefined);
            getLWIDetails.mockResolvedValue({ State: 'Closed', ConversationId: 'conversation-id' });

            await chatSDK.authenticateChat(createJwt(7200));
            await flushPromises();

            expect(onAgentEndSession).toHaveBeenCalledTimes(1);
            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
        });

        it('should discard an agent close seen during endChat when endChat tears the session down', async () => {
            const { chatSDK, onAgentEndSession, result } = await endChatWhileAgentEndSettles('success');

            expect(result).toBe('resolved');
            expect(onAgentEndSession).not.toHaveBeenCalled();
            expect(chatSDK["deferredAgentEndSession"]).toBeNull();
        });

        it('should give up after a bounded number of reconcile attempts', async () => {
            const token = createJwt(3600);
            const getAuthToken = jest.fn().mockResolvedValue(token);
            const { chatSDK, onAgentEndSession, getLWIDetails } = await setupAgentEnd(getAuthToken, token);
            getLWIDetails.mockRejectedValue(new Error('network'));

            for (let i = 0; i < 4; i++) {
                getAuthToken.mockResolvedValue(createJwt(3600 + (i + 1) * 60));
                await chatSDK["ensureFreshAuthToken"]("Test", true);
                await flushPromises();
            }

            expect(getLWIDetails).toHaveBeenCalledTimes(6);
            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
            expect(onAgentEndSession).not.toHaveBeenCalled();
            expect(chatSDK.scenarioMarker.singleRecord).toHaveBeenCalledWith(TelemetryEvent.PendingAgentEndCheckSettled, expect.objectContaining({ Outcome: 'Abandoned' }));
        });

        it('should not retain a pending check when the preflight is disabled', async () => {
            const chatSDK = await createChatSDK({ getAuthToken: jest.fn(), authTokenPreflight: { disable: true } });
            chatSDK["chatToken"] = { chatId: 'chat-id' };
            const handlers: { onThreadUpdate: any } = { onThreadUpdate: null };
            chatSDK.conversation = { registerOnThreadUpdate: jest.fn((handler: any) => { handlers.onThreadUpdate = handler; }) };
            jest.spyOn(chatSDK, 'getConversationDetails').mockRejectedValue(new Error('network'));
            await chatSDK.onAgentEndSession(jest.fn());

            const handled = handlers.onThreadUpdate(agentLeftEvent);
            await jest.advanceTimersByTimeAsync(5000);
            await handled;

            expect(chatSDK["pendingAgentEndCheck"]).toBeNull();
        });
    });
    describe('startChat', () => {
        const mockStartChatDependencies = (chatSDK: any) => {
            chatSDK.authSettings = {};
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue({ ChatId: 'chatId', Token: 'token', RegionGtms: '{}' });
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(undefined);
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue({});
        };

        const sentTokens = (mock: jest.Mock) => mock.mock.calls.map((call: any[]) => call[1].authenticatedUserToken);

        it('should refresh and retry createConversation once after a 401', async () => {
            const staleToken = createJwt(3600);
            const freshToken = createJwt(7200);
            const getAuthToken = jest.fn().mockResolvedValue(freshToken);
            const chatSDK = await createChatSDK({ getAuthToken, token: staleToken });
            mockStartChatDependencies(chatSDK);
            const createConversation = jest.spyOn(chatSDK.OCClient, 'createConversation')
                .mockRejectedValueOnce(unauthorizedError())
                .mockResolvedValue({ ChatId: 'chatId', Token: 'token', RegionGtms: '{}' });

            await chatSDK.startChat();

            expect(sentTokens(createConversation as any)).toEqual([staleToken, freshToken]);
        });

        it('should fail createConversation without a retry when the provider returns the rejected token', async () => {
            const staleToken = createJwt(3600);
            const getAuthToken = jest.fn().mockResolvedValue(staleToken);
            const chatSDK = await createChatSDK({ getAuthToken, token: staleToken });
            mockStartChatDependencies(chatSDK);
            const createConversation = jest.spyOn(chatSDK.OCClient, 'createConversation').mockRejectedValue(unauthorizedError());

            await expect(chatSDK.startChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationInitializationFailure });
            expect(createConversation).toHaveBeenCalledTimes(1);
        });

        it('should not retry createConversation on errors other than 401', async () => {
            const getAuthToken = jest.fn().mockResolvedValue(createJwt(7200));
            const chatSDK = await createChatSDK({ getAuthToken, token: createJwt(3600) });
            mockStartChatDependencies(chatSDK);
            const createConversation = jest.spyOn(chatSDK.OCClient, 'createConversation')
                .mockRejectedValue(Object.assign(new Error('Server error'), { response: { status: 500 } }));

            await expect(chatSDK.startChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationInitializationFailure });
            expect(createConversation).toHaveBeenCalledTimes(1);
            expect(getAuthToken).not.toHaveBeenCalled();
        });

        it('should call the provider once before the first createConversation request when the refresh fails', async () => {
            const getAuthToken = jest.fn().mockRejectedValue(new Error('Provider unavailable'));
            const chatSDK = await createChatSDK({ getAuthToken, token: createJwt(30) });
            mockStartChatDependencies(chatSDK);
            const request = jest.spyOn(chatSDK.OCClient, 'createConversation').mockImplementation(async () => {
                expect(getAuthToken).toHaveBeenCalledTimes(1);
                return { ChatId: 'chatId', Token: 'token', RegionGtms: '{}' };
            });

            await chatSDK.startChat();

            expect(request).toHaveBeenCalledTimes(1);
            expect(getAuthToken).toHaveBeenCalledTimes(1);
        });

        it('should refresh and retry sessionInit once after a 401', async () => {
            const staleToken = createJwt(3600);
            const freshToken = createJwt(7200);
            const getAuthToken = jest.fn().mockResolvedValue(freshToken);
            const chatSDK = await createChatSDK({ getAuthToken, token: staleToken, useCreateConversation: { disable: true } });
            mockStartChatDependencies(chatSDK);
            const sessionInit = jest.spyOn(chatSDK.OCClient, 'sessionInit')
                .mockRejectedValueOnce(unauthorizedError())
                .mockResolvedValue(undefined);

            await chatSDK.startChat();

            expect(sentTokens(sessionInit as any)).toEqual([staleToken, freshToken]);
        });
    });
});
