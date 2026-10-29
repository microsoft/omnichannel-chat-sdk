/**
 * Recovers ACS chat requests that fail with 401 Unauthorized while the chat token has not expired, for example after
 * the token was revoked.
 *
 * Recovery is fail-safe. It never throws, retries a failed request at most once, renews the token at most once per
 * interval for a chat, stops renewing after ACS rejects several renewed tokens in a row, and gives the original 401
 * back to the caller when no different usable token is available, which is exactly the behavior without recovery.
 */

import { ChatClientOptions } from "@azure/communication-chat";
import { CommunicationTokenCredential } from "@azure/communication-common";
import { getChatTokenExpiresOnInMs, isChatTokenUsable } from "./chatTokenRenewal";

export enum UnauthorizedRecoverySource {
    ChatRequest = "ChatRequest"
}

export enum UnauthorizedRecoveryFailureReason {
    /** Renewal did not return a different usable token. */
    NoNewToken = "NoNewToken",
    /** ACS returned 401 for the renewed token too. */
    RenewedTokenRejected = "RenewedTokenRejected"
}

export interface ChatTokenUnauthorizedRecoveryParams {
    initialToken: string;
    /** Renews the chat token. Must never throw and returns the current token when renewal is not possible. */
    refreshToken: () => Promise<string>;
    onStart?: (source: UnauthorizedRecoverySource) => void;
    /** Called when ACS accepts a renewed token, or when the latest known token is used without renewing. */
    onSuccess?: (source: UnauthorizedRecoverySource, usedExistingToken: boolean) => void;
    onFailure?: (source: UnauthorizedRecoverySource, reason: UnauthorizedRecoveryFailureReason) => void;
    minRenewalIntervalInMs?: number;
    /** Renewals in a row whose token ACS also rejected, after which recovery stops renewing for the chat. */
    maxRejectedRenewals?: number;
    now?: () => number;
}

export interface ChatTokenUnauthorizedRecovery {
    /** Returns the latest usable backend-issued token, falling back to the given token when none is usable. */
    selectToken: (token: string) => string;
    /** Records a backend refresher result, such as a proactive renewal, not a cached credential read. */
    observeToken: (token: string) => void;
    /** Returns a different usable token to retry with after a 401, or undefined when none is available. */
    recover: (failedToken: string | undefined, source: UnauthorizedRecoverySource) => Promise<string | undefined>;
    /** Reports whether ACS accepted a request sent with the given token. */
    reportTokenResult: (token: string, accepted: boolean) => void;
}

export const defaultUnauthorizedRecoveryMinRenewalIntervalInMs = 60 * 1000;
export const defaultUnauthorizedRecoveryMaxRejectedRenewals = 3;

export const createChatTokenUnauthorizedRecovery = (params: ChatTokenUnauthorizedRecoveryParams): ChatTokenUnauthorizedRecovery => {
    const minRenewalIntervalInMs = params.minRenewalIntervalInMs ?? defaultUnauthorizedRecoveryMinRenewalIntervalInMs;
    const maxRejectedRenewals = params.maxRejectedRenewals ?? defaultUnauthorizedRecoveryMaxRejectedRenewals;
    const now = params.now ?? (() => Date.now());

    let latestToken = params.initialToken;
    let lastRenewalTime: number | null = null;
    let activeRenewal: Promise<string | undefined> | null = null;
    let rejectedRenewals = 0;
    // Renewed token whose first ACS response has not been reported yet
    let unverifiedRenewal: { token: string; source: UnauthorizedRecoverySource } | null = null;

    const safeInvoke = (callback: () => void) => {
        try {
            callback();
        } catch {
            // Telemetry callbacks must never break recovery
        }
    };

    const observeToken = (token: string): void => {
        try {
            if (token && token !== latestToken && isChatTokenUsable(token, now())) {
                latestToken = token;
            }
        } catch {
            // Keep the current token
        }
    };

    const selectToken = (token: string): string => {
        try {
            if (latestToken && latestToken !== token && isChatTokenUsable(latestToken, now())) {
                return latestToken;
            }
        } catch {
            // Keep the given token
        }

        return token;
    };

    const renew = async (failedToken: string | undefined, source: UnauthorizedRecoverySource): Promise<string | undefined> => {
        lastRenewalTime = now();
        safeInvoke(() => params.onStart?.(source));

        let token: string | undefined;
        try {
            token = await params.refreshToken();
        } catch {
            token = undefined;
        }

        if (!token || token === failedToken || !isChatTokenUsable(token, now())) {
            safeInvoke(() => params.onFailure?.(source, UnauthorizedRecoveryFailureReason.NoNewToken));
            return undefined;
        }

        latestToken = token;
        unverifiedRenewal = { token, source };
        return token;
    };

    const reportTokenResult = (token: string, accepted: boolean): void => {
        try {
            if (!unverifiedRenewal || unverifiedRenewal.token !== token) {
                return;
            }

            const { source } = unverifiedRenewal;
            unverifiedRenewal = null;
            if (accepted) {
                rejectedRenewals = 0;
                safeInvoke(() => params.onSuccess?.(source, false));
            } else {
                rejectedRenewals++;
                safeInvoke(() => params.onFailure?.(source, UnauthorizedRecoveryFailureReason.RenewedTokenRejected));
            }
        } catch {
            // Reporting must never break the request
        }
    };

    const recover = async (failedToken: string | undefined, source: UnauthorizedRecoverySource): Promise<string | undefined> => {
        try {
            if (latestToken && latestToken !== failedToken && isChatTokenUsable(latestToken, now())) {
                safeInvoke(() => params.onSuccess?.(source, true));
                return latestToken;
            }

            if (activeRenewal) {
                return await activeRenewal;
            }

            if (rejectedRenewals >= maxRejectedRenewals
                || (lastRenewalTime !== null && now() - lastRenewalTime < minRenewalIntervalInMs)) {
                return undefined;
            }

            activeRenewal = (async () => {
                try {
                    return await renew(failedToken, source);
                } finally {
                    activeRenewal = null;
                }
            })();

            return await activeRenewal;
        } catch {
            return undefined;
        }
    };

    return { selectToken, observeToken, recover, reportTokenResult };
};

type ChatAdditionalPolicy = NonNullable<ChatClientOptions["additionalPolicies"]>[number];
type ChatPipelinePolicy = ChatAdditionalPolicy["policy"];
type ChatPipelineRequest = Parameters<ChatPipelinePolicy["sendRequest"]>[0];

export const chatTokenUnauthorizedRecoveryPolicyName = "ChatTokenUnauthorizedRecoveryPolicy";

const authorizationHeaderName = "Authorization";
const bearerPrefix = "Bearer ";

const getBearerToken = (request: ChatPipelineRequest): string | undefined => {
    const header = request.headers.get(authorizationHeaderName);
    return header && header.startsWith(bearerPrefix) ? header.substring(bearerPrefix.length) : undefined;
};

// Only bodies that can be sent again unchanged are retried
const isReplayableBody = (request: ChatPipelineRequest): boolean => {
    const body = request.body;
    return body === undefined || body === null || typeof body === "string";
};

/**
 * Pipeline policy for ACS chat requests. Runs after the authentication policy on every attempt, sends the latest
 * usable backend-issued token, and resends a request that failed with 401 once with a different usable token.
 */
export const createChatTokenUnauthorizedRecoveryPolicy = (recovery: ChatTokenUnauthorizedRecovery): ChatAdditionalPolicy => {
    const policy: ChatPipelinePolicy = {
        name: chatTokenUnauthorizedRecoveryPolicyName,
        sendRequest: async (request, next) => {
            let sentToken = getBearerToken(request);
            if (sentToken) {
                const selectedToken = recovery.selectToken(sentToken);
                if (selectedToken !== sentToken) {
                    request.headers.set(authorizationHeaderName, `${bearerPrefix}${selectedToken}`);
                    sentToken = selectedToken;
                }
            }

            const response = await next(request);
            if (sentToken) {
                recovery.reportTokenResult(sentToken, response.status !== 401);
            }

            if (response.status !== 401 || !sentToken || !isReplayableBody(request)) {
                return response;
            }

            const token = await recovery.recover(sentToken, UnauthorizedRecoverySource.ChatRequest);
            if (!token || token === sentToken) {
                return response;
            }

            request.headers.set(authorizationHeaderName, `${bearerPrefix}${token}`);
            const retryResponse = await next(request);
            recovery.reportTokenResult(token, retryResponse.status !== 401);
            return retryResponse;
        }
    };

    return { policy, position: "perRetry" };
};

/**
 * Credential that gives the latest usable backend-issued token to ACS, including the real-time notification client,
 * which reads the token from the credential instead of the request pipeline.
 */
export class ChatTokenUnauthorizedRecoveryCredential implements CommunicationTokenCredential {
    private credential: CommunicationTokenCredential;
    private recovery: ChatTokenUnauthorizedRecovery;

    public constructor(credential: CommunicationTokenCredential, recovery: ChatTokenUnauthorizedRecovery) {
        this.credential = credential;
        this.recovery = recovery;
    }

    public async getToken(options?: Parameters<CommunicationTokenCredential["getToken"]>[0]): Promise<Awaited<ReturnType<CommunicationTokenCredential["getToken"]>>> {
        const accessToken = await this.credential.getToken(options);
        const token = this.recovery.selectToken(accessToken.token);
        const expiresOnTimestamp = token !== accessToken.token ? getChatTokenExpiresOnInMs(token) : undefined;
        return expiresOnTimestamp !== undefined ? { token, expiresOnTimestamp } : accessToken;
    }

    public dispose(): void {
        this.credential.dispose();
    }
}
