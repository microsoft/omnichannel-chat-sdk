import { ChatSDKErrorName } from "../core/ChatSDKError";
import { getChatTokenExpiresOnInMs } from "./chatTokenRenewal";

export const defaultAuthTokenRefreshMarginInMs = 60 * 1000;
export const defaultAuthTokenRefreshTimeoutInMs = 10 * 1000;

/**
 * Returns true when the token is a JWT that expires within the margin. Tokens whose expiry cannot be read
 * are treated as fresh so that opaque tokens keep their current behavior.
 */
export const isAuthTokenNearExpiry = (token: unknown, marginInMs: number, nowInMs: number = Date.now()): boolean => {
    const expiresOnInMs = getChatTokenExpiresOnInMs(token);
    return expiresOnInMs !== undefined && expiresOnInMs <= nowInMs + marginInMs;
};

/**
 * Returns a coarse bucket of the time left before the token expires. Used in telemetry instead of the exact
 * expiry so that no token claim is logged.
 */
export const getSecondsToExpiryBucket = (token: unknown, nowInMs: number = Date.now()): string => {
    const expiresOnInMs = getChatTokenExpiresOnInMs(token);
    if (expiresOnInMs === undefined) {
        return "unknown";
    }

    const seconds = (expiresOnInMs - nowInMs) / 1000;
    if (seconds <= -300) {
        return "expired>300s";
    }
    if (seconds <= 0) {
        return "expired";
    }
    if (seconds <= 60) {
        return "0-60s";
    }
    if (seconds <= 300) {
        return "60-300s";
    }
    return ">300s";
};

/**
 * Describes the token returned by getAuthToken compared with the previous one, using only booleans and buckets.
 * Shows whether the provider keeps returning the same or an expired token without logging the token or a hash of it.
 */
export const getReturnedAuthTokenTelemetry = (previousToken: unknown, returnedToken: unknown, nowInMs: number = Date.now()): { [key: string]: string } => ({
    TokenChanged: String(returnedToken !== previousToken),
    ReturnedTokenExpired: String(isAuthTokenNearExpiry(returnedToken, 0, nowInMs)),
    ReturnedTokenSecondsToExpiryBucket: getSecondsToExpiryBucket(returnedToken, nowInMs)
});

export const isUnauthorizedError = (error: unknown): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error as any)?.response?.status === 401;
};

export const authTokenRefreshTimedOut = "Timed out";
export const authTokenRefreshExpired = "ExpiredAuthToken";

/**
 * Maps a token refresh failure to a fixed reason, so telemetry never carries free-form text from the host's provider.
 */
export const getAuthTokenRefreshFailureReason = (error: unknown): string => {
    const message = (error as Error)?.message;
    if (message === authTokenRefreshTimedOut) {
        return "Timeout";
    }
    if (message === ChatSDKErrorName.UndefinedAuthToken || message === authTokenRefreshExpired) {
        return message;
    }
    return "ProviderError";
};

/**
 * Resolves with the result of the promise, or rejects when it does not settle within the timeout.
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutInMs: number): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(authTokenRefreshTimedOut)), timeoutInMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
    });
};

export const positiveOrDefault = (value: number | undefined, defaultValue: number): number =>
    typeof value === "number" && Number.isFinite(value) && value > 0 ? value : defaultValue;
