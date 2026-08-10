/**
 * Attestation accompanying a prefetched live chat config.
 *
 * The caller that already fetched the config states which org/widget it fetched it
 * for. The SDK compares this against its own configured identity and rejects any
 * mismatch, so a stale or cross-widget payload can never be adopted.
 */
interface PrefetchedConfigAttestation {
    orgId: string;
    widgetId: string;
}

interface GetLiveChatConfigOptionalParams {
    sendCacheHeaders?: boolean;
    useRuntimeCache?: boolean;
}

/**
 * Deliberately NOT part of the public `GetLiveChatConfigOptionalParams` surface.
 *
 * These fields are read internally by `getChatConfig` and are kept off the public
 * params type so they do not surface in consumer-facing autocomplete. Callers that
 * pass them do so through an explicit cast.
 *
 * A prefetched payload is adopted only when it passes validation, including that
 * both the attested identity and the payload's own identity match the
 * orgId/widgetId this SDK was constructed with; otherwise the SDK falls back to a
 * network fetch. Ignored when `sendCacheHeaders` is set, since a deliberate cache
 * bypass must always reach the network.
 */
interface InternalPrefetchedConfigParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prefetchedLiveChatConfig?: any;
    prefetchedConfigAttestation?: PrefetchedConfigAttestation;
}

export default GetLiveChatConfigOptionalParams;
export type { PrefetchedConfigAttestation, InternalPrefetchedConfigParams };