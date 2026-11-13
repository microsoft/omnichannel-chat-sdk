/**
 * Fail-safe ACS chat token refresher backed by the Omnichannel renew chat token API.
 *
 * The refresher never throws. On failure it returns the last known good token, which may have expired if renewal
 * cannot recover. It never installs an unusable token received from the renewal API.
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
    /** Completes an attempt whose chat ended or was replaced, without counting a renewal failure. */
    onSkipped?: () => void;
    /** Returns true when an HTTP status means renewal cannot succeed for this chat. Checked on each failure. */
    isNonRetriableStatus?: (statusCode: number) => boolean;
    /** Invoked once when renewal stops for this chat. May throw. */
    onStopped?: (details: ChatTokenRenewalStoppedDetails) => void;
    /** Wait while the current token is unexpired. After expiry, later waits double with jitter. */
    retryCooldownInMs?: number;
    maxRetryCooldownInMs?: number;
    /** Renewal stops after this many failures in a row. */
    maxConsecutiveFailures?: number;
    /** Renewal stops after this many HTTP 400/401/403 responses in a row that isNonRetriableStatus allows to retry. */
    maxConsecutiveAuthFailures?: number;
    timeoutInMs?: number;
    now?: () => number;
    random?: () => number;
}

export enum ChatTokenRenewalStopReason {
    NonRetriableStatus = "NonRetriableStatus",
    AuthRejected = "AuthRejected",
    MaxFailures = "MaxFailures"
}

export interface ChatTokenRenewalStoppedDetails {
    reason: ChatTokenRenewalStopReason;
    /** Failures in a row, including the last one. */
    failures: number;
    /** Failure reason of the last attempt, for example HttpStatus503. */
    lastFailure: string;
}

export const defaultChatTokenRenewalRetryCooldownInMs = 60 * 1000;
export const defaultChatTokenRenewalMaxRetryCooldownInMs = 10 * 60 * 1000;
export const defaultChatTokenRenewalMaxConsecutiveFailures = 8;
export const defaultChatTokenRenewalMaxConsecutiveAuthFailures = 3;
export const defaultChatTokenRenewalTimeoutInMs = 60 * 1000;
const minimumTokenLifetimeInMs = 60 * 1000;
// Waits after the second failure are reduced by up to this fraction so that chats that failed together do not retry together.
const retryCooldownJitter = 0.2;
const authFailureStatusCodes = [400, 401, 403];

// The API is not deployed, renewal is disabled for the org, or the chat cannot be renewed. Retrying will not help.
export const defaultNonRetriableStatusCodes = [400, 401, 403, 404, 405];

// On the authenticated route, 400/401/403 come from customer token validation and can succeed once the host has a fresh token.
export const authenticatedNonRetriableStatusCodes = [404, 405];

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
 * Returns the expiry of a JWT chat token in milliseconds since epoch, or undefined when it cannot be read.
 */
export const getChatTokenExpiresOnInMs = (token: unknown): number | undefined => {
    try {
        if (typeof token !== "string" || token.trim().length === 0) {
            return undefined;
        }

        const parts = token.split(".");
        if (parts.length !== 3) {
            return undefined;
        }

        const payload = decodeBase64Url(parts[1]);
        if (!payload) {
            return undefined;
        }

        const { exp } = JSON.parse(payload);
        return typeof exp === "number" ? exp * 1000 : undefined;
    } catch {
        return undefined;
    }
};

/**
 * Returns true when the token is a JWT whose exp claim is far enough in the future to be accepted by ACS.
 */
export const isChatTokenUsable = (token: unknown, nowInMs: number = Date.now()): boolean => {
    const expiresOnInMs = getChatTokenExpiresOnInMs(token);
    return expiresOnInMs !== undefined && expiresOnInMs > nowInMs + minimumTokenLifetimeInMs;
};

const getStatusCode = (error: unknown): number | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    return typeof status === "number" ? status : undefined;
};

// Accepts Retry-After delta-seconds, including fractional values. HTTP-date values are not parsed.
const getRetryAfterInMs = (error: unknown): number | undefined => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const headers = (error as any)?.response?.headers;
        const value = headers?.["retry-after"] ?? headers?.["Retry-After"];
        const seconds = typeof value === "number" ? value : typeof value === "string" && /^\s*\d+(\.\d+)?\s*$/.test(value) ? parseFloat(value) : NaN;
        return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined;
    } catch {
        return undefined;
    }
};

const positiveOrDefault = (value: number | undefined, defaultValue: number): number =>
    typeof value === "number" && Number.isFinite(value) && value > 0 ? value : defaultValue;

export const createChatTokenRefresher = (params: ChatTokenRefresherParams): (() => Promise<string>) => {
    const retryCooldownInMs = params.retryCooldownInMs ?? defaultChatTokenRenewalRetryCooldownInMs;
    const maxRetryCooldownInMs = Math.max(retryCooldownInMs, positiveOrDefault(params.maxRetryCooldownInMs, defaultChatTokenRenewalMaxRetryCooldownInMs));
    const maxConsecutiveFailures = Math.floor(positiveOrDefault(params.maxConsecutiveFailures, defaultChatTokenRenewalMaxConsecutiveFailures)) || 1;
    const maxConsecutiveAuthFailures = Math.floor(positiveOrDefault(params.maxConsecutiveAuthFailures, defaultChatTokenRenewalMaxConsecutiveAuthFailures)) || 1;
    const timeoutInMs = params.timeoutInMs ?? defaultChatTokenRenewalTimeoutInMs;
    const now = params.now ?? (() => Date.now());
    const random = params.random ?? Math.random;
    const isNonRetriableStatus = params.isNonRetriableStatus ?? ((statusCode: number) => defaultNonRetriableStatusCodes.includes(statusCode));

    let latestToken = params.initialToken;
    let isDisabled = false;
    let lastFailureTime: number | null = null;
    let currentCooldownInMs = retryCooldownInMs;
    let failureCount = 0;
    let postExpiryFailureCount = 0;
    let authFailureCount = 0;
    let activeRenewal: Promise<string> | null = null;

    const safeInvoke = (callback?: () => void) => {
        try {
            callback?.();
        } catch {
            // Telemetry callbacks must never break the refresh.
        }
    };

    const getCooldownInMs = (retryAfterInMs?: number): number => {
        let cooldownInMs = retryCooldownInMs;
        const expiresOnInMs = getChatTokenExpiresOnInMs(latestToken);
        postExpiryFailureCount = expiresOnInMs !== undefined && expiresOnInMs > now() ? 0 : postExpiryFailureCount + 1;
        if (postExpiryFailureCount > 1) {
            const backoffInMs = Math.min(maxRetryCooldownInMs, retryCooldownInMs * Math.pow(2, postExpiryFailureCount - 1));
            let jitter = 0;
            try {
                jitter = Math.min(Math.max(Number(random()) || 0, 0), 1);
            } catch {
                // No jitter
            }
            cooldownInMs = Math.max(retryCooldownInMs, backoffInMs * (1 - retryCooldownJitter * jitter));
        }

        return retryAfterInMs !== undefined ? Math.max(cooldownInMs, Math.min(retryAfterInMs, maxRetryCooldownInMs)) : cooldownInMs;
    };

    const stop = (reason: ChatTokenRenewalStopReason, lastFailure: string): void => {
        isDisabled = true;
        const details: ChatTokenRenewalStoppedDetails = { reason, failures: failureCount, lastFailure };
        safeInvoke(() => params.onStopped?.(details));
    };

    const fail = (reason: string, error?: unknown, statusCode?: number): string => {
        const isNonRetriable = statusCode !== undefined && isNonRetriableStatus(statusCode);
        failureCount++;
        authFailureCount = statusCode !== undefined && authFailureStatusCodes.includes(statusCode) ? authFailureCount + 1 : 0;
        if (!isNonRetriable) {
            currentCooldownInMs = getCooldownInMs(statusCode === 429 ? getRetryAfterInMs(error) : undefined);
            lastFailureTime = now();
        }

        safeInvoke(() => params.onFailure?.(reason, error));

        if (isNonRetriable) {
            stop(ChatTokenRenewalStopReason.NonRetriableStatus, reason);
        } else if (authFailureCount >= maxConsecutiveAuthFailures) {
            stop(ChatTokenRenewalStopReason.AuthRejected, reason);
        } else if (failureCount >= maxConsecutiveFailures) {
            stop(ChatTokenRenewalStopReason.MaxFailures, reason);
        }

        return latestToken;
    };

    // The chat ended or was replaced while the API call was in progress. Not a renewal failure.
    const skip = (): string => {
        safeInvoke(params.onSkipped);
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
            if (!params.isChatActive()) {
                return skip();
            }
            const statusCode = getStatusCode(error);
            return fail(statusCode !== undefined ? `HttpStatus${statusCode}` : "RequestFailed", error, statusCode);
        }

        if (!params.isChatActive()) {
            return skip();
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
        currentCooldownInMs = retryCooldownInMs;
        failureCount = 0;
        postExpiryFailureCount = 0;
        authFailureCount = 0;
        safeInvoke(params.onSuccess);
        return latestToken;
    };

    return async (): Promise<string> => {
        try {
            if (isDisabled || !params.isChatActive()) {
                return latestToken;
            }

            if (lastFailureTime !== null && now() - lastFailureTime < currentCooldownInMs) {
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
