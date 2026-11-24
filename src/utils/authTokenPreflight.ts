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

// 424: MRT's planned status for a public-key endpoint failure (replacing today's 400 text below).
const retryableCloseStatusCodes = [401, 408, 424, 429, 499];
// ocsdk rejects timed-out requests with a plain Error whose message starts with this name.
const ocsdkTimeoutErrorName = "ClientHTTPTimeoutError";
// MRT AuthTokenValidationAttribute returns this text as the HTTP 400 body for every InvalidPublicKeyException (endpoint failure or key configuration error). There is no fault code; keep this text in sync.
// Temporary: remove this 400 match once MRT returns 424 for public-key endpoint failures in all regions.
const publicKeyConfigurationErrorText = "invalid public key configuration";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPublicKeyConfigurationError = (data: any): boolean => {
    const text = typeof data === "string" ? data : data?.message;
    return typeof text === "string" && text.toLowerCase().includes(publicKeyConfigurationErrorText);
};

/**
 * Whether a failed session close may succeed if sent again with the same request id: no response (network error
 * or timeout), HTTP 401, 408, 424, 429, 499, 5xx, or a 400 saying the public key configuration is invalid.
 */
export const isRetryableCloseError = (error: unknown): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpError = error as any;
    const status = httpError?.response?.status;
    if (typeof status === "number") {
        return retryableCloseStatusCodes.includes(status) || (status >= 500 && status <= 599)
            || (status === 400 && isPublicKeyConfigurationError(httpError.response.data));
    }

    if (httpError?.isAxiosError === true || httpError?.request !== undefined) {
        return true;
    }

    return typeof httpError?.message === "string" && httpError.message.startsWith(ocsdkTimeoutErrorName);
};

export const getHttpStatusForTelemetry = (error: unknown): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    return typeof status === "number" ? String(status) : "None";
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
