/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ChatTokenUnauthorizedRecovery,
    ChatTokenUnauthorizedRecoveryCredential,
    chatTokenUnauthorizedRecoveryPolicyName,
    createAttachmentClientWithUnauthorizedRecovery,
    createChatTokenUnauthorizedRecovery,
    createChatTokenUnauthorizedRecoveryPolicy,
    isUnauthorizedError,
    UnauthorizedRecoverySource
} from "../../src/utils/chatTokenUnauthorizedRecovery";

const nowInMs = 1_700_000_000_000;

const createJwt = (expiresInSeconds: number, nonce = ""): string => {
    const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    return `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ exp: nowInMs / 1000 + expiresInSeconds, nonce })}.signature`;
};

const initialToken = createJwt(3600);
const renewedToken = createJwt(86400);

const createHeaders = (initial: Record<string, string> = {}) => {
    const values = new Map(Object.entries(initial));
    return {
        get: (name: string) => values.get(name),
        set: (name: string, value: string) => { values.set(name, value); }
    };
};

const createRequest = (token: string | undefined, body?: unknown) => ({
    headers: createHeaders(token ? { Authorization: `Bearer ${token}` } : {}),
    body
});

describe("chatTokenUnauthorizedRecovery", () => {
    let currentTime: number;

    const setup = (refreshToken: () => Promise<string>, options: { initial?: string } = {}) => {
        const params = {
            initialToken: options.initial ?? initialToken,
            refreshToken: jest.fn(refreshToken),
            onStart: jest.fn(),
            onSuccess: jest.fn(),
            onFailure: jest.fn(),
            minRenewalIntervalInMs: 60000,
            now: () => currentTime
        };

        return { params, recovery: createChatTokenUnauthorizedRecovery(params) };
    };

    beforeEach(() => {
        currentTime = nowInMs;
    });

    describe("createChatTokenUnauthorizedRecovery", () => {
        it("renews the token after a 401 with the current token", async () => {
            const { params, recovery } = setup(async () => renewedToken);

            await expect(recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest)).resolves.toBe(renewedToken);
            expect(params.refreshToken).toHaveBeenCalledTimes(1);
            expect(params.onStart).toHaveBeenCalledWith(UnauthorizedRecoverySource.ChatRequest);
            expect(params.onSuccess).toHaveBeenCalledWith(UnauthorizedRecoverySource.ChatRequest, false);
            expect(recovery.selectToken(initialToken)).toBe(renewedToken);
        });

        it("reuses a newer token without renewing again", async () => {
            const { params, recovery } = setup(async () => renewedToken);
            recovery.observeToken(renewedToken);

            await expect(recovery.recover(initialToken, UnauthorizedRecoverySource.Attachment)).resolves.toBe(renewedToken);
            expect(params.refreshToken).not.toHaveBeenCalled();
            expect(params.onSuccess).toHaveBeenCalledWith(UnauthorizedRecoverySource.Attachment, true);
        });

        it("renews once for concurrent 401s", async () => {
            let resolveRefresh: (token: string) => void = () => undefined;
            const { params, recovery } = setup(() => new Promise<string>((resolve) => { resolveRefresh = resolve; }));

            const first = recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest);
            const second = recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest);
            resolveRefresh(renewedToken);

            await expect(Promise.all([first, second])).resolves.toEqual([renewedToken, renewedToken]);
            expect(params.refreshToken).toHaveBeenCalledTimes(1);
        });

        it("renews at most once per interval", async () => {
            const secondRenewedToken = createJwt(90000);
            const refreshToken = jest.fn().mockResolvedValueOnce(renewedToken).mockResolvedValueOnce(secondRenewedToken);
            const { recovery } = setup(refreshToken);

            await recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest);
            await expect(recovery.recover(renewedToken, UnauthorizedRecoverySource.ChatRequest)).resolves.toBeUndefined();
            expect(refreshToken).toHaveBeenCalledTimes(1);

            currentTime += 60000;
            await expect(recovery.recover(renewedToken, UnauthorizedRecoverySource.ChatRequest)).resolves.toBe(secondRenewedToken);
            expect(refreshToken).toHaveBeenCalledTimes(2);
        });

        it.each([
            ["the same token", async () => initialToken],
            ["an expired token", async () => createJwt(-10)],
            ["an invalid token", async () => "abc"],
            ["an error", async () => { throw new Error("failed"); }]
        ])("gives up when renewal returns %s", async (_, refreshToken) => {
            const { params, recovery } = setup(refreshToken as () => Promise<string>);

            await expect(recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest)).resolves.toBeUndefined();
            expect(params.onFailure).toHaveBeenCalledWith(UnauthorizedRecoverySource.ChatRequest, "NoNewToken");
            expect(recovery.selectToken(initialToken)).toBe(initialToken);
        });

        it("does not fail when telemetry callbacks throw", async () => {
            const recovery = createChatTokenUnauthorizedRecovery({
                initialToken,
                refreshToken: async () => renewedToken,
                onStart: () => { throw new Error("telemetry"); },
                onSuccess: () => { throw new Error("telemetry"); },
                now: () => currentTime
            });

            await expect(recovery.recover(initialToken, UnauthorizedRecoverySource.ChatRequest)).resolves.toBe(renewedToken);
        });

        it("only keeps observed tokens that expire later", () => {
            const { recovery } = setup(async () => renewedToken);

            recovery.observeToken(createJwt(600));
            recovery.observeToken("abc");
            expect(recovery.selectToken(initialToken)).toBe(initialToken);

            recovery.observeToken(renewedToken);
            expect(recovery.selectToken(initialToken)).toBe(renewedToken);
            expect(recovery.selectToken(createJwt(90000))).not.toBe(renewedToken);
        });
    });

    describe("createChatTokenUnauthorizedRecoveryPolicy", () => {
        const createRecovery = (overrides: Partial<ChatTokenUnauthorizedRecovery> = {}): ChatTokenUnauthorizedRecovery => ({
            selectToken: jest.fn((token: string) => token),
            observeToken: jest.fn(),
            recover: jest.fn(async () => renewedToken),
            ...overrides
        });

        it("runs on every attempt", () => {
            const { policy, position } = createChatTokenUnauthorizedRecoveryPolicy(createRecovery());

            expect(position).toBe("perRetry");
            expect(policy.name).toBe(chatTokenUnauthorizedRecoveryPolicyName);
        });

        it("sends the newest token", async () => {
            const recovery = createRecovery({ selectToken: jest.fn(() => renewedToken) });
            const request = createRequest(initialToken);
            const next = jest.fn(async () => ({ status: 200 }));

            await createChatTokenUnauthorizedRecoveryPolicy(recovery).policy.sendRequest(request as any, next as any);

            expect(request.headers.get("Authorization")).toBe(`Bearer ${renewedToken}`);
            expect(next).toHaveBeenCalledTimes(1);
            expect(recovery.recover).not.toHaveBeenCalled();
        });

        it("resends a request that failed with 401 once with a renewed token", async () => {
            const recovery = createRecovery();
            const request = createRequest(initialToken, "{}");
            const next = jest.fn().mockResolvedValueOnce({ status: 401 }).mockResolvedValueOnce({ status: 401 });

            const response = await createChatTokenUnauthorizedRecoveryPolicy(recovery).policy.sendRequest(request as any, next as any);

            expect(recovery.recover).toHaveBeenCalledWith(initialToken, UnauthorizedRecoverySource.ChatRequest);
            expect(next).toHaveBeenCalledTimes(2);
            expect(request.headers.get("Authorization")).toBe(`Bearer ${renewedToken}`);
            expect(response.status).toBe(401);
        });

        it.each([
            ["no token is available", createRequest(initialToken), async () => undefined],
            ["the same token is returned", createRequest(initialToken), async () => initialToken],
            ["the body cannot be sent again", createRequest(initialToken, { stream: true }), async () => renewedToken],
            ["the request has no bearer token", createRequest(undefined), async () => renewedToken]
        ])("returns the 401 when %s", async (_, request, recover) => {
            const recovery = createRecovery({ recover: jest.fn(recover as () => Promise<string | undefined>) });
            const next = jest.fn(async () => ({ status: 401 }));

            const response = await createChatTokenUnauthorizedRecoveryPolicy(recovery).policy.sendRequest(request as any, next as any);

            expect(response.status).toBe(401);
            expect(next).toHaveBeenCalledTimes(1);
        });

        it.each([200, 403, 429, 500])("does not recover on %s", async (status) => {
            const recovery = createRecovery();
            const next = jest.fn(async () => ({ status }));

            await createChatTokenUnauthorizedRecoveryPolicy(recovery).policy.sendRequest(createRequest(initialToken) as any, next as any);

            expect(recovery.recover).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("ChatTokenUnauthorizedRecoveryCredential", () => {
        it("returns the newest token with its expiry", async () => {
            const inner = { getToken: jest.fn(async () => ({ token: initialToken, expiresOnTimestamp: 1 })), dispose: jest.fn() };
            const recovery = createChatTokenUnauthorizedRecovery({ initialToken, refreshToken: async () => renewedToken, now: () => currentTime });
            const credential = new ChatTokenUnauthorizedRecoveryCredential(inner, recovery);

            await expect(credential.getToken()).resolves.toEqual({ token: initialToken, expiresOnTimestamp: 1 });

            recovery.observeToken(renewedToken);
            await expect(credential.getToken()).resolves.toEqual({ token: renewedToken, expiresOnTimestamp: nowInMs + 86400 * 1000 });

            credential.dispose();
            expect(inner.dispose).toHaveBeenCalled();
        });
    });

    describe("isUnauthorizedError", () => {
        it.each([
            [{ status: 401 }],
            [{ statusCode: 401 }],
            [{ response: { status: 401 } }],
            [{ originalError: { status: 401 } }],
            [new Error("AMSCreateObjectFailed: 401 Unauthorized")],
            [new Error("AMSGetViewFailed: 401")]
        ])("returns true for %p", (error) => {
            expect(isUnauthorizedError(error)).toBe(true);
        });

        it.each([
            [undefined],
            [null],
            [{ status: 403 }],
            [new Error("AMSCreateObjectFailed: 4010 Unknown")],
            [new Error("Request failed: 401")],
            ["401"]
        ])("returns false for %p", (error) => {
            expect(isUnauthorizedError(error)).toBe(false);
        });
    });

    describe("createAttachmentClientWithUnauthorizedRecovery", () => {
        const unauthorized = () => new Error("AMSUploadDocumentFailed: 401 Unauthorized");

        const setupClient = (uploadDocument: jest.Mock) => {
            const client = {
                chatToken: { token: initialToken },
                uploadDocument,
                other: jest.fn(() => "other")
            };
            const recovery: ChatTokenUnauthorizedRecovery = {
                selectToken: jest.fn((token: string) => token),
                observeToken: jest.fn(),
                recover: jest.fn(async () => renewedToken)
            };
            const updateClientToken = jest.fn(async (token: string) => {
                client.chatToken = { token };
                return true;
            });

            return { client, recovery, updateClientToken, wrapped: createAttachmentClientWithUnauthorizedRecovery(client, recovery, updateClientToken) };
        };

        it("retries once with a renewed token after a 401", async () => {
            const uploadDocument = jest.fn().mockRejectedValueOnce(unauthorized()).mockResolvedValueOnce("uploaded");
            const { recovery, updateClientToken, wrapped } = setupClient(uploadDocument);

            await expect(wrapped.uploadDocument("id", {})).resolves.toBe("uploaded");
            expect(recovery.recover).toHaveBeenCalledWith(initialToken, UnauthorizedRecoverySource.Attachment);
            expect(updateClientToken).toHaveBeenCalledWith(renewedToken);
            expect(uploadDocument).toHaveBeenCalledTimes(2);
        });

        it("returns the second failure without retrying again", async () => {
            const uploadDocument = jest.fn().mockRejectedValue(unauthorized());
            const { wrapped } = setupClient(uploadDocument);

            await expect(wrapped.uploadDocument("id", {})).rejects.toThrow("401");
            expect(uploadDocument).toHaveBeenCalledTimes(2);
        });

        it.each([
            ["the error is not a 401", new Error("AMSUploadDocumentFailed: 500 Internal Server Error"), undefined],
            ["the iframe client rejects without an error", undefined, undefined],
            ["the call passes its own token", unauthorized(), { token: initialToken }]
        ])("does not retry when %s", async (_, error, token) => {
            const uploadDocument = jest.fn().mockRejectedValue(error);
            const { recovery, wrapped } = setupClient(uploadDocument);

            await expect(wrapped.uploadDocument("id", {}, token)).rejects.toBe(error);
            expect(recovery.recover).not.toHaveBeenCalled();
            expect(uploadDocument).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["no token is available", async () => undefined, async (): Promise<boolean> => true],
            ["the client token cannot be updated", async () => renewedToken, async () => false],
            ["updating the client token fails", async () => renewedToken, async () => { throw new Error("init"); }]
        ])("returns the original error when %s", async (_, recover, update) => {
            const error = unauthorized();
            const uploadDocument = jest.fn().mockRejectedValue(error);
            const client = { chatToken: { token: initialToken }, uploadDocument };
            const recovery: ChatTokenUnauthorizedRecovery = { selectToken: (token) => token, observeToken: jest.fn(), recover: jest.fn(recover as () => Promise<string | undefined>) };
            const wrapped = createAttachmentClientWithUnauthorizedRecovery(client, recovery, jest.fn(update as () => Promise<boolean>));

            await expect(wrapped.uploadDocument("id", {})).rejects.toBe(error);
            expect(uploadDocument).toHaveBeenCalledTimes(1);
        });

        it("leaves other members unchanged", () => {
            const { client, wrapped } = setupClient(jest.fn());

            expect(wrapped.other()).toBe("other");
            expect(wrapped.chatToken).toBe(client.chatToken);
        });
    });
});
