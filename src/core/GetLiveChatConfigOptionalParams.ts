interface InjectedLiveChatConfigAttestation {
    orgId: string;
    widgetId: string;
}

interface GetLiveChatConfigOptionalParams {
    sendCacheHeaders?: boolean;
    useRuntimeCache?: boolean;
}

/**
 * Not part of the public GetLiveChatConfigOptionalParams surface. These fields are read internally by getChatConfig
 * and are intentionally excluded from the public type so they do not appear in the consumer-facing API. A pre-fetched
 * payload is honored only when its attestation matches the orgId/widgetId this SDK was constructed with and it passes
 * validation; otherwise the SDK falls back to a network fetch. Ignored when sendCacheHeaders is set.
 */
interface InternalInjectedConfigParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injectedLiveChatConfig?: any;
    injectedConfigAttestation?: InjectedLiveChatConfigAttestation;
}

export type { InjectedLiveChatConfigAttestation, InternalInjectedConfigParams };
export default GetLiveChatConfigOptionalParams;