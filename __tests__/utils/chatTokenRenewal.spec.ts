import { createChatTokenRefresher, isChatTokenUsable, RenewedChatToken } from "../../src/utils/chatTokenRenewal";

const nowInMs = 1_700_000_000_000;

const createJwt = (payload: Record<string, unknown>): string => {
    const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    return `${encode({ alg: "RS256", typ: "JWT" })}.${encode(payload)}.signature`;
};

const initialToken = createJwt({ exp: nowInMs / 1000 + 300 });
const renewedToken = createJwt({ exp: nowInMs / 1000 + 86400 });
const chatId = "19:thread@thread.v2";

const httpError = (status: number) => Object.assign(new Error(`Request failed with status code ${status}`), { response: { status } });

describe("chatTokenRenewal", () => {
    describe("isChatTokenUsable", () => {
        it("returns true for a JWT that expires later", () => {
            expect(isChatTokenUsable(renewedToken, nowInMs)).toBe(true);
        });

        it.each([
            ["undefined", undefined],
            ["empty", ""],
            ["not a JWT", "abc"],
            ["undecodable payload", "a.%%%.c"],
            ["no exp", createJwt({ sub: "x" })],
            ["expired", createJwt({ exp: nowInMs / 1000 - 1 })],
            ["expiring within a minute", createJwt({ exp: nowInMs / 1000 + 30 })]
        ])("returns false when the token is %s", (_, token) => {
            expect(isChatTokenUsable(token, nowInMs)).toBe(false);
        });
    });

    describe("createChatTokenRefresher", () => {
        let currentTime: number;
        let isChatActive: boolean;

        const setup = (renewChatToken: () => Promise<RenewedChatToken>, onRenewed: (renewed: RenewedChatToken) => void = jest.fn(), isNonRetriableStatus?: (statusCode: number) => boolean) => {
            const params = {
                initialToken,
                chatId,
                isChatActive: jest.fn(() => isChatActive),
                renewChatToken: jest.fn(renewChatToken),
                onRenewed: jest.fn(onRenewed),
                onStart: jest.fn(),
                onSuccess: jest.fn(),
                onFailure: jest.fn(),
                isNonRetriableStatus,
                retryCooldownInMs: 60000,
                timeoutInMs: 1000,
                now: () => currentTime
            };

            return { params, refresher: createChatTokenRefresher(params) };
        };

        beforeEach(() => {
            currentTime = nowInMs;
            isChatActive = true;
        });

        it("returns and stores the renewed token on success", async () => {
            const renewed = { ChatId: chatId, Token: renewedToken, ExpiresIn: "86400" };
            const { params, refresher } = setup(async () => renewed);

            await expect(refresher()).resolves.toBe(renewedToken);

            expect(params.onRenewed).toHaveBeenCalledWith(renewed);
            expect(params.onStart).toHaveBeenCalledTimes(1);
            expect(params.onSuccess).toHaveBeenCalledTimes(1);
            expect(params.onFailure).not.toHaveBeenCalled();
        });

        it.each([400, 401, 403, 404, 405])("returns the current token and stops renewing after HTTP %d", async (status) => {
            const { params, refresher } = setup(async () => { throw httpError(status); });

            await expect(refresher()).resolves.toBe(initialToken);
            currentTime += 24 * 60 * 60 * 1000;
            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.renewChatToken).toHaveBeenCalledTimes(1);
            expect(params.onFailure).toHaveBeenCalledWith(`HttpStatus${status}`, expect.any(Error));
        });

        it.each([
            ["HTTP 500", () => httpError(500)],
            ["HTTP 429", () => httpError(429)],
            ["a network error", () => new Error("Network Error")]
        ])("returns the current token and retries after the cooldown on %s", async (_, createError) => {
            const { params, refresher } = setup(async () => { throw createError(); });

            await expect(refresher()).resolves.toBe(initialToken);
            currentTime += 59999;
            await expect(refresher()).resolves.toBe(initialToken);
            expect(params.renewChatToken).toHaveBeenCalledTimes(1);

            currentTime += 1;
            await expect(refresher()).resolves.toBe(initialToken);
            expect(params.renewChatToken).toHaveBeenCalledTimes(2);
        });

        it("retries after the cooldown when isNonRetriableStatus returns false", async () => {
            const renewChatToken = jest.fn<Promise<RenewedChatToken>, []>()
                .mockRejectedValueOnce(httpError(401))
                .mockResolvedValueOnce({ ChatId: chatId, Token: renewedToken, ExpiresIn: "86400" });
            const isNonRetriableStatus = jest.fn(() => false);
            const { params, refresher } = setup(renewChatToken, jest.fn(), isNonRetriableStatus);

            await expect(refresher()).resolves.toBe(initialToken);
            expect(isNonRetriableStatus).toHaveBeenCalledWith(401);
            currentTime += 60000;
            await expect(refresher()).resolves.toBe(renewedToken);

            expect(params.renewChatToken).toHaveBeenCalledTimes(2);
            expect(params.onFailure).toHaveBeenCalledWith("HttpStatus401", expect.any(Error));
        });

        it("stops renewing when isNonRetriableStatus returns true", async () => {
            const { params, refresher } = setup(async () => { throw httpError(500); }, jest.fn(), () => true);

            await expect(refresher()).resolves.toBe(initialToken);
            currentTime += 24 * 60 * 60 * 1000;
            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.renewChatToken).toHaveBeenCalledTimes(1);
        });

        it("returns the current token when the API does not respond in time", async () => {
            jest.useFakeTimers();
            try {
                const { params, refresher } = setup(() => new Promise<RenewedChatToken>(() => undefined));

                const result = refresher();
                jest.advanceTimersByTime(1000);

                await expect(result).resolves.toBe(initialToken);
                expect(params.onFailure).toHaveBeenCalledWith("RequestFailed", expect.any(Error));
            } finally {
                jest.useRealTimers();
            }
        });

        it.each([
            ["an empty response", undefined],
            ["another chat", { ChatId: "19:other@thread.v2", Token: renewedToken }],
            ["no chat id", { Token: renewedToken }],
            ["no token", { ChatId: chatId }],
            ["an expired token", { ChatId: chatId, Token: createJwt({ exp: nowInMs / 1000 - 1 }) }],
            ["a malformed token", { ChatId: chatId, Token: "not-a-jwt" }]
        ])("returns the current token without updating the chat when the response has %s", async (_, response) => {
            const { params, refresher } = setup(async () => response as RenewedChatToken);

            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.onRenewed).not.toHaveBeenCalled();
            expect(params.onFailure).toHaveBeenCalled();
        });

        it("does not call the API once the chat is no longer active", async () => {
            isChatActive = false;
            const { params, refresher } = setup(async () => ({ ChatId: chatId, Token: renewedToken }));

            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.renewChatToken).not.toHaveBeenCalled();
            expect(params.onStart).not.toHaveBeenCalled();
        });

        it("does not update the chat when it ends while the API call is in progress", async () => {
            const { params, refresher } = setup(async () => {
                isChatActive = false;
                return { ChatId: chatId, Token: renewedToken };
            });

            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.onRenewed).not.toHaveBeenCalled();
            expect(params.onFailure).toHaveBeenCalledWith("ChatNotActive", undefined);
        });

        it("returns the current token when updating the chat throws", async () => {
            const { params, refresher } = setup(async () => ({ ChatId: chatId, Token: renewedToken }), () => { throw new Error("update"); });

            await expect(refresher()).resolves.toBe(initialToken);

            expect(params.onFailure).toHaveBeenCalledWith("UpdateFailed", expect.any(Error));
        });

        it("never throws when telemetry callbacks throw", async () => {
            const { params, refresher } = setup(async () => ({ ChatId: chatId, Token: renewedToken }));
            params.onStart.mockImplementation(() => { throw new Error("telemetry"); });
            params.onSuccess.mockImplementation(() => { throw new Error("telemetry"); });

            await expect(refresher()).resolves.toBe(renewedToken);
        });

        it("shares a single API call between concurrent refreshes", async () => {
            let resolveRenewal: (value: RenewedChatToken) => void = () => undefined;
            const { params, refresher } = setup(() => new Promise<RenewedChatToken>((resolve) => { resolveRenewal = resolve; }));

            const first = refresher();
            const second = refresher();
            resolveRenewal({ ChatId: chatId, Token: renewedToken });

            await expect(Promise.all([first, second])).resolves.toEqual([renewedToken, renewedToken]);
            expect(params.renewChatToken).toHaveBeenCalledTimes(1);
        });

        it("returns the latest renewed token after a later failure", async () => {
            let attempt = 0;
            const { refresher } = setup(async () => {
                attempt++;
                if (attempt === 1) {
                    return { ChatId: chatId, Token: renewedToken };
                }

                throw httpError(500);
            });

            await expect(refresher()).resolves.toBe(renewedToken);
            await expect(refresher()).resolves.toBe(renewedToken);
        });
    });
});
