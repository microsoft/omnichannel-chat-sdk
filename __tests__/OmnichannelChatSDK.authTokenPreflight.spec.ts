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

    const createChatSDK = async (options: { authTokenPreflight?: any, fcbFlag?: any, getAuthToken?: any, token?: string } = {}) => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
            getAuthToken: options.getAuthToken,
            authTokenPreflight: options.authTokenPreflight
        });
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = false;

        await chatSDK.initialize();

        chatSDK["liveChatConfig"] = options.fcbFlag === undefined ? {} : {
            LcwFcbConfiguration: {
                lcwAuthTokenPreflightEnabled: options.fcbFlag
            }
        };
        chatSDK["authenticatedUserToken"] = options.token ?? createJwt(30);
        chatSDK.scenarioMarker.singleRecord = jest.fn();

        return chatSDK;
    };

    it('should not call getAuthToken when the preflight is disabled', async () => {
        const expiredToken = createJwt(-600);
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken, token: expiredToken });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockRejectedValue(unauthorizedError());

        await expect(chatSDK.getUnreadMessageCount()).rejects.toMatchObject({ message: ChatSDKErrorName.UnreadMessageCountRetrievalFailure });

        expect(getAuthToken).not.toHaveBeenCalled();
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledTimes(1);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(expiredToken);
    });

    it('should refresh a token near expiry before the request when enabled by the live chat config', async () => {
        const freshToken = createJwt(3600);
        const getAuthToken = jest.fn().mockResolvedValue(freshToken);
        const chatSDK = await createChatSDK({ getAuthToken, fcbFlag: 'True' });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockResolvedValue({ count: 1 });

        await chatSDK.getUnreadMessageCount();

        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(freshToken);
        expect(chatSDK["authenticatedUserToken"]).toBe(freshToken);
    });

    it('should not refresh a token that is not near expiry', async () => {
        const token = createJwt(3600);
        const getAuthToken = jest.fn();
        const chatSDK = await createChatSDK({ getAuthToken, authTokenPreflight: { enable: true }, token });
        jest.spyOn(chatSDK.OCClient, 'getUnreadMessageCount').mockResolvedValue({ count: 1 });

        await chatSDK.getUnreadMessageCount();

        expect(getAuthToken).not.toHaveBeenCalled();
        expect(chatSDK.OCClient.getUnreadMessageCount).toHaveBeenCalledWith(token);
    });

    it('should let disable override the live chat config', async () => {
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken, fcbFlag: 'true', authTokenPreflight: { disable: true, enable: true } });

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(getAuthToken).not.toHaveBeenCalled();
    });

    it('should share one refresh between concurrent callers', async () => {
        const freshToken = createJwt(3600);
        let resolveToken: (token: string) => void = () => undefined;
        const getAuthToken = jest.fn().mockReturnValue(new Promise<string>((resolve) => { resolveToken = resolve; }));
        const chatSDK = await createChatSDK({ getAuthToken, authTokenPreflight: { enable: true } });

        const first = chatSDK["ensureFreshAuthToken"]("First");
        const second = chatSDK["ensureFreshAuthToken"]("Second");
        resolveToken(freshToken);
        await Promise.all([first, second]);

        expect(getAuthToken).toHaveBeenCalledTimes(1);
        expect(chatSDK["authenticatedUserToken"]).toBe(freshToken);
    });

    it('should keep the current token when getAuthToken times out', async () => {
        const token = createJwt(30);
        const getAuthToken = jest.fn().mockReturnValue(new Promise(() => undefined));
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true, refreshTimeoutInMs: 10 } });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(chatSDK["authenticatedUserToken"]).toBe(token);
        expect(failScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.anything());
        expect(chatSDK["authTokenRefreshPromise"]).toBeNull();
    });

    it('should not accept an expired token from getAuthToken', async () => {
        const token = createJwt(30);
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(-10));
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true } });

        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        expect(chatSDK["authenticatedUserToken"]).toBe(token);
        expect(failScenario).toHaveBeenCalledWith(TelemetryEvent.EnsureFreshAuthToken, expect.objectContaining({
            TokenChanged: "true",
            ReturnedTokenExpired: "true",
            ReturnedTokenSecondsToExpiryBucket: "expired"
        }));
    });

    it('should report when getAuthToken returns the same expired token without logging it', async () => {
        const token = createJwt(-10);
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true } });
        const failScenario = jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

        await chatSDK["ensureFreshAuthToken"]("Test");

        const data = failScenario.mock.calls[0][1] as Record<string, string>;
        expect(data).toEqual(expect.objectContaining({ TokenChanged: "false", ReturnedTokenExpired: "true" }));
        expect(JSON.stringify(data)).not.toContain(token);
    });

    it('should report a changed, valid token on success', async () => {
        const getAuthToken = jest.fn().mockResolvedValue(createJwt(3600));
        const chatSDK = await createChatSDK({ getAuthToken, authTokenPreflight: { enable: true } });
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
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true } });
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
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true } });
        const request = jest.fn().mockRejectedValue(unauthorizedError());

        await expect(chatSDK["withAuthTokenRetry"]("Test", request)).rejects.toThrow('Unauthorized');

        expect(request).toHaveBeenCalledTimes(1);
    });

    it('should not retry errors other than HTTP 401', async () => {
        const getAuthToken = jest.fn();
        const chatSDK = await createChatSDK({ getAuthToken, token: createJwt(3600), authTokenPreflight: { enable: true } });
        const request = jest.fn().mockRejectedValue(Object.assign(new Error('Server error'), { response: { status: 500 } }));

        await expect(chatSDK["withAuthTokenRetry"]("Test", request)).rejects.toThrow('Server error');

        expect(request).toHaveBeenCalledTimes(1);
        expect(getAuthToken).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationExpired for HTTP 401 only when enabled', async () => {
        const enabledChatSDK = await createChatSDK({ getAuthToken: jest.fn(), authTokenPreflight: { enable: true } });
        const disabledChatSDK = await createChatSDK({ getAuthToken: jest.fn() });

        expect(() => enabledChatSDK["throwIfAuthenticationExpired"](unauthorizedError(), TelemetryEvent.CloseChatSession)).toThrow(ChatSDKErrorName.AuthenticationExpired);
        expect(() => disabledChatSDK["throwIfAuthenticationExpired"](unauthorizedError(), TelemetryEvent.CloseChatSession)).not.toThrow();
    });

    it('should keep the session when endChat fails because the sign-in expired so it can be retried', async () => {
        const token = createJwt(3600);
        const freshToken = createJwt(7200);
        const getAuthToken = jest.fn().mockResolvedValue(token);
        const chatSDK = await createChatSDK({ getAuthToken, token, authTokenPreflight: { enable: true } });
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
        const chatSDK = await createChatSDK({ getAuthToken: jest.fn() });
        chatSDK["chatToken"] = { chatId: 'chat-id' };
        const requestId = chatSDK.requestId;
        jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValueOnce(unauthorizedError());

        await expect(chatSDK.endChat()).rejects.toMatchObject({ message: ChatSDKErrorName.ConversationClosureFailure });

        expect(chatSDK.requestId).not.toBe(requestId);
        expect(chatSDK["chatToken"]).toEqual({});
    });
});
