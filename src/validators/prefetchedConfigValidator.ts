import { PrefetchedConfigAttestation } from "../core/GetLiveChatConfigOptionalParams";
import LiveChatVersion from "../core/LiveChatVersion";

/**
 * Reason a prefetched live chat config was not adopted. Emitted as telemetry so a
 * silent fallback to the network is still observable.
 */
export enum PrefetchedConfigRejectionReason {
    NotProvided = "NotProvided",
    CacheBypass = "CacheBypass",
    MissingAttestation = "MissingAttestation",
    IdentityMismatch = "IdentityMismatch",
    UnverifiedOrgUrl = "UnverifiedOrgUrl",
    MalformedPayload = "MalformedPayload",
    MissingLiveChatVersion = "MissingLiveChatVersion",
    UnsupportedLiveChatVersion = "UnsupportedLiveChatVersion",
    PayloadOrgIdMismatch = "PayloadOrgIdMismatch",
    PayloadWidgetIdMismatch = "PayloadWidgetIdMismatch"
}

export interface PrefetchedConfigValidationResult {
    accepted: boolean;
    reason?: PrefetchedConfigRejectionReason;
}

const accepted: PrefetchedConfigValidationResult = { accepted: true };

const rejected = (reason: PrefetchedConfigRejectionReason): PrefetchedConfigValidationResult => ({ accepted: false, reason });

/**
 * Decide whether a caller-prefetched live chat config may be adopted in place of a
 * network fetch.
 *
 * The prefetched payload arrives from outside the SDK, so it is treated as
 * untrusted input. It is adopted only when every check passes:
 *
 * 1. A payload was actually supplied.
 * 2. The caller is not deliberately bypassing cache — a cache bypass must reach
 *    the network, otherwise `sendCacheHeaders` would be silently defeated.
 * 3. The caller attested which org/widget it fetched the config for.
 * 4. That attestation matches this SDK instance's own configured identity.
 * 5. The payload is shaped like a config (`LiveWSAndLiveChatEngJoin` present, and
 *    a `LiveChatVersion`).
 * 6. The payload's OWN identity matches too. The attestation is only a *claim
 *    about* the payload; without this step a caller that attests correctly but
 *    hands over the wrong object — two widgets on one page with the configs
 *    swapped, no attacker required — would be accepted. This is what actually
 *    makes a cross-widget or cross-tenant payload harmless.
 *
 * Payload identity is enforced only when the payload carries those fields, since
 * not every config does; a config that omits them is still gated by checks 3-5.
 *
 * Two further conditions block adoption because the network fetch has side effects
 * beyond returning the config:
 *
 * - The first fetch is also what proves the org url currently in use actually
 *   resolves. When that url was rewritten at runtime, nothing else exercises it,
 *   so those callers always take the fetch and never the fast path.
 * - The fetch also settles the live chat version on the underlying client. Only
 *   the version that client already defaults to can be adopted without the fetch,
 *   so any other version is rejected rather than half-applied.
 *
 * Any failure is a rejection, never an error: every input is type-checked before
 * it is used, and the caller falls back to its normal network fetch, so a bad
 * prefetch costs a round-trip and nothing else.
 *
 * Identity comparison is case-insensitive because org and widget ids are GUIDs
 * whose casing is not stable across the surfaces that pass them around.
 *
 * @param prefetchedLiveChatConfig The payload supplied by the caller.
 * @param attestation The identity the caller claims the payload was fetched for.
 * @param expected This SDK instance's own configured identity.
 * @param bypassCache Whether the caller requested a deliberate cache bypass.
 * @param orgUrlVerified Whether the org url in use is already known to resolve.
 */
export const validatePrefetchedLiveChatConfig = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prefetchedLiveChatConfig: any,
    attestation: PrefetchedConfigAttestation | undefined,
    expected: PrefetchedConfigAttestation,
    bypassCache: boolean,
    orgUrlVerified: boolean
): PrefetchedConfigValidationResult => {
    if (prefetchedLiveChatConfig === undefined || prefetchedLiveChatConfig === null) {
        return rejected(PrefetchedConfigRejectionReason.NotProvided);
    }

    if (bypassCache) {
        return rejected(PrefetchedConfigRejectionReason.CacheBypass);
    }

    if (!attestation || typeof attestation.orgId !== "string" || typeof attestation.widgetId !== "string" || !attestation.orgId || !attestation.widgetId) {
        return rejected(PrefetchedConfigRejectionReason.MissingAttestation);
    }

    if (typeof expected.orgId !== "string" || typeof expected.widgetId !== "string" || !expected.orgId || !expected.widgetId) {
        return rejected(PrefetchedConfigRejectionReason.MissingAttestation);
    }

    const sameIdentity =
        attestation.orgId.toLowerCase() === expected.orgId.toLowerCase() &&
        attestation.widgetId.toLowerCase() === expected.widgetId.toLowerCase();

    if (!sameIdentity) {
        return rejected(PrefetchedConfigRejectionReason.IdentityMismatch);
    }

    if (!orgUrlVerified) {
        return rejected(PrefetchedConfigRejectionReason.UnverifiedOrgUrl);
    }

    if (typeof prefetchedLiveChatConfig !== "object" || Array.isArray(prefetchedLiveChatConfig)) {
        return rejected(PrefetchedConfigRejectionReason.MalformedPayload);
    }

    // Every live chat config carries this block; its absence means we were handed
    // something that is not a config, and adopting it would fail later in
    // buildConfigurations() in a much harder place to diagnose.
    if (!prefetchedLiveChatConfig.LiveWSAndLiveChatEngJoin || typeof prefetchedLiveChatConfig.LiveWSAndLiveChatEngJoin !== "object") {
        return rejected(PrefetchedConfigRejectionReason.MalformedPayload);
    }

    if (prefetchedLiveChatConfig.LiveChatVersion === undefined || prefetchedLiveChatConfig.LiveChatVersion === null) {
        return rejected(PrefetchedConfigRejectionReason.MissingLiveChatVersion);
    }

    if (prefetchedLiveChatConfig.LiveChatVersion !== LiveChatVersion.V2) {
        return rejected(PrefetchedConfigRejectionReason.UnsupportedLiveChatVersion);
    }

    // The attestation above is only the caller's CLAIM about this payload. These
    // two checks verify the payload itself, which is what stops a correctly
    // attested but wrongly selected object from being adopted. Enforced only when
    // present, since not every config carries them.
    const payloadOrgId = prefetchedLiveChatConfig.SalOrgId;
    if (typeof payloadOrgId === "string" && payloadOrgId.length > 0 && payloadOrgId.toLowerCase() !== expected.orgId.toLowerCase()) {
        return rejected(PrefetchedConfigRejectionReason.PayloadOrgIdMismatch);
    }

    const payloadWidgetId = prefetchedLiveChatConfig.LiveWSAndLiveChatEngJoin.msdyn_widgetappid;
    if (typeof payloadWidgetId === "string" && payloadWidgetId.length > 0 && payloadWidgetId.toLowerCase() !== expected.widgetId.toLowerCase()) {
        return rejected(PrefetchedConfigRejectionReason.PayloadWidgetIdMismatch);
    }

    return accepted;
};

export default validatePrefetchedLiveChatConfig;
