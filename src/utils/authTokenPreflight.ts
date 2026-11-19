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

export const isUnauthorizedError = (error: unknown): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error as any)?.response?.status === 401;
};

/**
 * Resolves with the result of the promise, or rejects when it does not settle within the timeout.
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutInMs: number): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Timed out")), timeoutInMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
    });
};

export const positiveOrDefault = (value: number | undefined, defaultValue: number): number =>
    typeof value === "number" && Number.isFinite(value) && value > 0 ? value : defaultValue;
