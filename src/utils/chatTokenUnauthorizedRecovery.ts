/**
 * Recovers ACS chat and attachment requests that fail with 401 Unauthorized while the chat token has not expired,
 * for example after the token was revoked.
 *
 * Recovery is fail-safe. It never throws, retries a failed request at most once, renews the token at most once per
 * interval for a chat, and gives the original 401 back to the caller when no different usable token is available,
 * which is exactly the behavior without recovery.
 */

import { ChatClientOptions } from "@azure/communication-chat";
import { CommunicationTokenCredential } from "@azure/communication-common";
import { getChatTokenExpiresOnInMs, isChatTokenUsable } from "./chatTokenRenewal";

export enum UnauthorizedRecoverySource {
    ChatRequest = "ChatRequest",
    Attachment = "Attachment"
}

export interface ChatTokenUnauthorizedRecoveryParams {
    initialToken: string;
    /** Renews the chat token. Must never throw and returns the current token when renewal is not possible. */
    refreshToken: () => Promise<string>;
    onStart?: (source: UnauthorizedRecoverySource) => void;
    onSuccess?: (source: UnauthorizedRecoverySource, usedExistingToken: boolean) => void;
    onFailure?: (source: UnauthorizedRecoverySource, reason: string) => void;
    minRenewalIntervalInMs?: number;
    now?: () => number;
}

export interface ChatTokenUnauthorizedRecovery {
    /** Returns the token to send: the given token, or the newest usable token known, whichever expires later. */
    selectToken: (token: string) => string;
    /** Records a token obtained outside recovery, such as a proactive renewal. */
    observeToken: (token: string) => void;
    /** Returns a different usable token to retry with after a 401, or undefined when none is available. */
    recover: (failedToken: string | undefined, source: UnauthorizedRecoverySource) => Promise<string | undefined>;
}

export const defaultUnauthorizedRecoveryMinRenewalIntervalInMs = 60 * 1000;

export const createChatTokenUnauthorizedRecovery = (params: ChatTokenUnauthorizedRecoveryParams): ChatTokenUnauthorizedRecovery => {
    const minRenewalIntervalInMs = params.minRenewalIntervalInMs ?? defaultUnauthorizedRecoveryMinRenewalIntervalInMs;
    const now = params.now ?? (() => Date.now());

    let latestToken = params.initialToken;
    let lastRenewalTime: number | null = null;
    let activeRenewal: Promise<string | undefined> | null = null;

    const safeInvoke = (callback: () => void) => {
        try {
            callback();
        } catch {
            // Telemetry callbacks must never break recovery
        }
    };

    const isNewer = (candidate: string, current: string): boolean => {
        const candidateExpiresOn = getChatTokenExpiresOnInMs(candidate);
        if (candidateExpiresOn === undefined) {
            return false;
        }

        const currentExpiresOn = getChatTokenExpiresOnInMs(current);
        return currentExpiresOn === undefined || candidateExpiresOn > currentExpiresOn;
    };

    const observeToken = (token: string): void => {
        try {
            if (token && token !== latestToken && isChatTokenUsable(token, now()) && isNewer(token, latestToken)) {
                latestToken = token;
            }
        } catch {
            // Keep the current token
        }
    };

    const selectToken = (token: string): string => {
        try {
            if (latestToken && latestToken !== token && isChatTokenUsable(latestToken, now()) && isNewer(latestToken, token)) {
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
            safeInvoke(() => params.onFailure?.(source, "NoNewToken"));
            return undefined;
        }

        observeToken(token);
        safeInvoke(() => params.onSuccess?.(source, false));
        return token;
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

            if (lastRenewalTime !== null && now() - lastRenewalTime < minRenewalIntervalInMs) {
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

    return { selectToken, observeToken, recover };
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
 * Pipeline policy for ACS chat requests. Runs after the authentication policy on every attempt, sends the newest
 * usable token, and resends a request that failed with 401 once with a different usable token.
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
            if (response.status !== 401 || !sentToken || !isReplayableBody(request)) {
                return response;
            }

            const token = await recovery.recover(sentToken, UnauthorizedRecoverySource.ChatRequest);
            if (!token || token === sentToken) {
                return response;
            }

            request.headers.set(authorizationHeaderName, `${bearerPrefix}${token}`);
            return next(request);
        }
    };

    return { policy, position: "perRetry" };
};

/**
 * Credential that gives the newest usable token to ACS, including the real-time notification client, which reads
 * the token from the credential instead of the request pipeline.
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

const getStatusCode = (error: unknown): number | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidate = error as any;
    const statuses = [candidate?.status, candidate?.statusCode, candidate?.response?.status, candidate?.originalError?.status];
    return statuses.find((status) => typeof status === "number");
};

// The attachment client reports HTTP failures as "AMS<Operation>Failed: <status> <statusText>"
const attachmentUnauthorizedMessagePattern = /^AMS\w*Failed: 401\b/;

export const isUnauthorizedError = (error: unknown): boolean => {
    try {
        if (getStatusCode(error) === 401) {
            return true;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = (error as any)?.message;
        return typeof message === "string" && attachmentUnauthorizedMessagePattern.test(message);
    } catch {
        return false;
    }
};

// Attachment client methods that call the attachment service, with the position of their optional chat token
const attachmentOperations: Record<string, number> = {
    createObject: 2,
    uploadDocument: 2,
    getViewStatus: 1,
    getView: 2
};

/**
 * Wraps the attachment client so an upload or download that fails with 401 is retried once after the client is
 * given a different usable token. Calls that pass their own token, and failures without a 401 status, are not
 * retried.
 *
 * @param updateClientToken Gives the token to the attachment client and resolves to false when it could not.
 */
export const createAttachmentClientWithUnauthorizedRecovery = <T extends object>(
    attachmentClient: T,
    recovery: ChatTokenUnauthorizedRecovery,
    updateClientToken: (token: string) => Promise<boolean>
): T => {
    try {
        return new Proxy(attachmentClient, {
            get: (target, property, receiver) => {
                const value = Reflect.get(target, property, receiver);
                if (typeof property !== "string" || !(property in attachmentOperations) || typeof value !== "function") {
                    return value;
                }

                const tokenArgumentIndex = attachmentOperations[property];
                return async (...args: unknown[]) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const usedToken: string | undefined = (target as any)?.chatToken?.token;
                    try {
                        return await value.apply(target, args);
                    } catch (error) {
                        if (args[tokenArgumentIndex] || !isUnauthorizedError(error)) {
                            throw error;
                        }

                        const token = await recovery.recover(usedToken, UnauthorizedRecoverySource.Attachment);
                        let isUpdated = false;
                        try {
                            isUpdated = !!token && await updateClientToken(token);
                        } catch {
                            isUpdated = false;
                        }

                        if (!isUpdated) {
                            throw error;
                        }

                        return value.apply(target, args);
                    }
                };
            }
        });
    } catch {
        return attachmentClient;
    }
};
