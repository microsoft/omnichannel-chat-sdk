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
 *
 * The payload should be the config response body exactly as the config endpoint
 * returned it. A config obtained through this SDK's own fetch additionally carries
 * a `headers.date` stamp taken from the HTTP response; a prefetched payload only
 * carries it if the caller preserved it.
 *
 * Unsupported internal optimization, and sound only under one condition: the
 * config must stay inside the realm that fetched it. The intended caller fetches
 * it and hands it over inside the same cross-origin, first-party document, so
 * same-origin policy already keeps the payload away from any embedding page. It
 * is never published to a host page or posted across an origin boundary.
 *
 * Two hardening measures were scoped out on that basis: an allow-list for
 * `authTokenUrl`, and fail-closed enforcement of data masking. If this ever
 * becomes a documented parameter, or the payload is moved across realms or
 * origins, both come back into scope -- at that point the config is reachable by
 * third-party script and the validation here is no longer sufficient on its own.
 */
interface InternalPrefetchedConfigParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prefetchedLiveChatConfig?: any;
    prefetchedConfigAttestation?: PrefetchedConfigAttestation;
}

export default GetLiveChatConfigOptionalParams;
export type { PrefetchedConfigAttestation, InternalPrefetchedConfigParams };