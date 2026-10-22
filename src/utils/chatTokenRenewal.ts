/**
 * Fail-safe ACS chat token refresher backed by the Omnichannel renew chat token API.
 *
 * The refresher NEVER throws and NEVER returns an unusable token. On any failure (API not deployed, feature disabled,
 * chat ended, network error, timeout, invalid response, ...) it returns the last known good token, which is exactly
 * what the SDK did before renewal existed, so behavior falls back to the existing flow.
 */

export interface RenewedChatToken {
    ChatId?: string;
    Token?: string;
    ExpiresIn?: string | number;
    VoiceVideoCallToken?: unknown;
}

export interface ChatTokenRefresherParams {
    initialToken: string;
    chatId: string;
    /** Returns false once the chat this refresher was created for has ended or was replaced. */
    isChatActive: () => boolean;
    /** Calls the renew chat token API. May throw. */
    renewChatToken: () => Promise<RenewedChatToken>;
    /** Invoked after a usable token is received for the same chat. May throw. */
    onRenewed: (renewed: RenewedChatToken) => void;
    onStart?: () => void;
    onSuccess?: () => void;
    onFailure?: (reason: string, error?: unknown) => void;
    retryCooldownInMs?: number;
    timeoutInMs?: number;
    now?: () => number;
}

export const defaultChatTokenRenewalRetryCooldownInMs = 60 * 1000;
export const defaultChatTokenRenewalTimeoutInMs = 60 * 1000;
const minimumTokenLifetimeInMs = 60 * 1000;

// The API is not deployed, renewal is disabled for the org, or the chat cannot be renewed. Retrying will not help.
const nonRetriableStatusCodes = [400, 401, 403, 404, 405];

const decodeBase64Url = (value: string): string | null => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    if (typeof atob === "function") {
        return atob(padded);
    }

    if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
        return Buffer.from(padded, "base64").toString("utf8");
    }

    return null;
};

/**
 * Returns true when the token is a JWT whose exp claim is far enough in the future to be accepted by ACS.
 */
export const isChatTokenUsable = (token: unknown, nowInMs: number = Date.now()): boolean => {
    try {
        if (typeof token !== "string" || token.trim().length === 0) {
            return false;
        }

        const parts = token.split(".");
        if (parts.length !== 3) {
            return false;
        }

        const payload = decodeBase64Url(parts[1]);
        if (!payload) {
            return false;
        }

        const { exp } = JSON.parse(payload);
        return typeof exp === "number" && exp * 1000 > nowInMs + minimumTokenLifetimeInMs;
    } catch {
        return false;
    }
};

const getStatusCode = (error: unknown): number | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    return typeof status === "number" ? status : undefined;
};

export const createChatTokenRefresher = (params: ChatTokenRefresherParams): (() => Promise<string>) => {
    const retryCooldownInMs = params.retryCooldownInMs ?? defaultChatTokenRenewalRetryCooldownInMs;
    const timeoutInMs = params.timeoutInMs ?? defaultChatTokenRenewalTimeoutInMs;
    const now = params.now ?? (() => Date.now());

    let latestToken = params.initialToken;
    let isDisabled = false;
    let lastFailureTime: number | null = null;
    let activeRenewal: Promise<string> | null = null;

    const safeInvoke = (callback?: () => void) => {
        try {
            callback?.();
        } catch {
            // Telemetry callbacks must never break the refresh.
        }
    };

    const fail = (reason: string, error?: unknown, disable = false): string => {
        if (disable) {
            isDisabled = true;
        } else {
            lastFailureTime = now();
        }

        safeInvoke(() => params.onFailure?.(reason, error));
        return latestToken;
    };

    const renew = async (): Promise<string> => {
        safeInvoke(params.onStart);

        let renewed: RenewedChatToken;
        try {
            let timeoutId: ReturnType<typeof setTimeout> | undefined;
            const timeout = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error("RenewChatTokenTimeout")), timeoutInMs);
            });

            try {
                renewed = await Promise.race([params.renewChatToken(), timeout]);
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            const statusCode = getStatusCode(error);
            const isNonRetriable = statusCode !== undefined && nonRetriableStatusCodes.includes(statusCode);
            return fail(statusCode !== undefined ? `HttpStatus${statusCode}` : "RequestFailed", error, isNonRetriable);
        }

        if (!params.isChatActive()) {
            return fail("ChatNotActive");
        }

        if (!renewed || renewed.ChatId !== params.chatId) {
            return fail("ChatIdMismatch");
        }

        if (!isChatTokenUsable(renewed.Token, now())) {
            return fail("InvalidToken");
        }

        try {
            params.onRenewed(renewed);
        } catch (error) {
            return fail("UpdateFailed", error);
        }

        latestToken = renewed.Token as string;
        lastFailureTime = null;
        safeInvoke(params.onSuccess);
        return latestToken;
    };

    return async (): Promise<string> => {
        try {
            if (isDisabled || !params.isChatActive()) {
                return latestToken;
            }

            if (lastFailureTime !== null && now() - lastFailureTime < retryCooldownInMs) {
                return latestToken;
            }

            if (!activeRenewal) {
                activeRenewal = (async () => {
                    try {
                        return await renew();
                    } finally {
                        activeRenewal = null;
                    }
                })();
            }

            return await activeRenewal;
        } catch {
            return latestToken;
        }
    };
};
