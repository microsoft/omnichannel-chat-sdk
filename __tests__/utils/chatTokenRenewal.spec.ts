import { ChatTokenRefresherParams, createChatTokenRefresher, isChatTokenUsable, RenewedChatToken } from "../../src/utils/chatTokenRenewal";

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

        const setup = (renewChatToken: () => Promise<RenewedChatToken>, onRenewed: (renewed: RenewedChatToken) => void = jest.fn(), isNonRetriableStatus?: (statusCode: number) => boolean, overrides: Partial<ChatTokenRefresherParams> = {}) => {
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
                onStopped: jest.fn(),
                retryCooldownInMs: 60000,
                timeoutInMs: 1000,
                now: () => currentTime,
                random: jest.fn(() => 0)
            };

            return { params, refresher: createChatTokenRefresher({ ...params, ...overrides }) };
        };

        // Calls the refresher after waitInMs and returns how many times the API was called in total.
        const callAfter = async (refresher: () => Promise<string>, params: { renewChatToken: jest.Mock }, waitInMs: number) => {
            currentTime += waitInMs;
            await refresher();
            return params.renewChatToken.mock.calls.length;
        };

        const maxCooldownInMs = 10 * 60 * 1000;
        const rateLimited = (retryAfter: string) => Object.assign(new Error("Request failed with status code 429"), { response: { status: 429, headers: { "retry-after": retryAfter } } });

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

        describe("retry limits", () => {
            const serverError = async (): Promise<RenewedChatToken> => { throw httpError(500); };

            it("keeps the first retry at the base cooldown without jitter and waits longer after later failures", async () => {
                const { params, refresher } = setup(serverError, jest.fn(), undefined, { random: () => 0.999 });

                await refresher();
                expect(await callAfter(refresher, params, 59999)).toBe(1);
                expect(await callAfter(refresher, params, 1)).toBe(2);
                expect(await callAfter(refresher, params, 60000)).toBe(2);
            });

            it("doubles the wait after each failure up to the maximum cooldown", async () => {
                const { params, refresher } = setup(serverError, jest.fn(), undefined, { maxConsecutiveFailures: 20 });

                await refresher();
                let calls = 1;
                for (const waitInMs of [60000, 120000, 240000, 480000, maxCooldownInMs, maxCooldownInMs]) {
                    expect(await callAfter(refresher, params, waitInMs - 1)).toBe(calls);
                    expect(await callAfter(refresher, params, 1)).toBe(++calls);
                }
            });

            it("shortens a wait by at most 20 percent and never below the base cooldown", async () => {
                const { params, refresher } = setup(serverError, jest.fn(), undefined, { random: () => 1 });
                await refresher();
                await callAfter(refresher, params, 60000);
                expect(await callAfter(refresher, params, 95999)).toBe(2);
                expect(await callAfter(refresher, params, 1)).toBe(3);

                const capped = setup(serverError, jest.fn(), undefined, { random: () => 1, maxRetryCooldownInMs: 60000 });
                await capped.refresher();
                await callAfter(capped.refresher, capped.params, 60000);
                expect(await callAfter(capped.refresher, capped.params, 59999)).toBe(2);
                expect(await callAfter(capped.refresher, capped.params, 1)).toBe(3);
            });

            it("stops after 8 failures in a row and reports the stop once", async () => {
                const { params, refresher } = setup(serverError);

                for (let i = 0; i < 10; i++) {
                    await callAfter(refresher, params, maxCooldownInMs);
                }
                currentTime += 24 * 60 * 60 * 1000;
                await expect(refresher()).resolves.toBe(initialToken);

                expect(params.renewChatToken).toHaveBeenCalledTimes(8);
                expect(params.onStopped).toHaveBeenCalledTimes(1);
                expect(params.onStopped).toHaveBeenCalledWith({ reason: "MaxFailures", failures: 8, lastFailure: "HttpStatus500" });
            });

            it("starts counting again and uses the base cooldown after a success", async () => {
                const renewChatToken = jest.fn<Promise<RenewedChatToken>, []>()
                    .mockRejectedValueOnce(httpError(500))
                    .mockRejectedValueOnce(httpError(500))
                    .mockResolvedValueOnce({ ChatId: chatId, Token: renewedToken })
                    .mockRejectedValue(httpError(500));
                const { params, refresher } = setup(renewChatToken, jest.fn(), undefined, { maxConsecutiveFailures: 3 });

                await refresher();
                await callAfter(refresher, params, 60000);
                expect(await callAfter(refresher, params, 120000)).toBe(3);
                expect(await callAfter(refresher, params, 0)).toBe(4);
                expect(await callAfter(refresher, params, 60000)).toBe(5);
                expect(await callAfter(refresher, params, 60000)).toBe(5);
                expect(params.onStopped).not.toHaveBeenCalled();
                expect(await callAfter(refresher, params, 60000)).toBe(6);

                expect(params.onStopped).toHaveBeenCalledWith({ reason: "MaxFailures", failures: 3, lastFailure: "HttpStatus500" });
            });

            it("stops an authenticated chat after 3 HTTP 400/401/403 in a row, and other failures reset that count", async () => {
                const renewChatToken = jest.fn<Promise<RenewedChatToken>, []>()
                    .mockRejectedValueOnce(httpError(401))
                    .mockRejectedValueOnce(httpError(403))
                    .mockRejectedValueOnce(httpError(503))
                    .mockRejectedValueOnce(httpError(401))
                    .mockRejectedValueOnce(httpError(400))
                    .mockRejectedValue(httpError(401));
                const { params, refresher } = setup(renewChatToken, jest.fn(), () => false);

                await refresher();
                for (let i = 0; i < 7; i++) {
                    await callAfter(refresher, params, maxCooldownInMs);
                }

                expect(params.renewChatToken).toHaveBeenCalledTimes(6);
                expect(params.onStopped).toHaveBeenCalledTimes(1);
                expect(params.onStopped).toHaveBeenCalledWith({ reason: "AuthRejected", failures: 6, lastFailure: "HttpStatus401" });
            });

            it("reports a stop on a status that cannot succeed", async () => {
                const { params, refresher } = setup(async () => { throw httpError(404); });

                await refresher();

                expect(params.onStopped).toHaveBeenCalledWith({ reason: "NonRetriableStatus", failures: 1, lastFailure: "HttpStatus404" });
            });

            it("does not count a renewal for a chat that ended while the API call was in progress", async () => {
                let attempt = 0;
                const { params, refresher } = setup(async () => {
                    attempt++;
                    if (attempt === 2) {
                        isChatActive = false;
                        return { ChatId: chatId, Token: renewedToken };
                    }
                    throw httpError(500);
                }, jest.fn(), undefined, { maxConsecutiveFailures: 2 });

                await refresher();
                await callAfter(refresher, params, 60000);
                isChatActive = true;
                expect(params.onStopped).not.toHaveBeenCalled();
                await callAfter(refresher, params, 60000);

                expect(params.onStopped).toHaveBeenCalledWith({ reason: "MaxFailures", failures: 2, lastFailure: "HttpStatus500" });
            });

            it("waits for Retry-After on HTTP 429, up to the maximum cooldown", async () => {
                const { params, refresher } = setup(async () => { throw rateLimited("150"); });
                await refresher();
                expect(await callAfter(refresher, params, 149999)).toBe(1);
                expect(await callAfter(refresher, params, 1)).toBe(2);

                const capped = setup(async () => { throw rateLimited("3600"); });
                await capped.refresher();
                expect(await callAfter(capped.refresher, capped.params, maxCooldownInMs - 1)).toBe(1);
                expect(await callAfter(capped.refresher, capped.params, 1)).toBe(2);
            });

            it("ignores Retry-After on other statuses, so the first retry stays at 60 seconds", async () => {
                const unavailable = Object.assign(new Error("Request failed with status code 503"), { response: { status: 503, headers: { "retry-after": "120" } } });
                const { params, refresher } = setup(async () => { throw unavailable; });
                await refresher();
                expect(await callAfter(refresher, params, 59999)).toBe(1);
                expect(await callAfter(refresher, params, 1)).toBe(2);
            });
        });
    });
});
