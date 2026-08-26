import validatePrefetchedLiveChatConfig, { PrefetchedConfigRejectionReason } from "../src/validators/prefetchedConfigValidator";

const expected = { orgId: "org-1", widgetId: "widget-1" };
const validConfig = {
    LiveChatVersion: 2,
    SalOrgId: "org-1",
    LiveWSAndLiveChatEngJoin: { ShowWidget: "true", msdyn_widgetappid: "widget-1" }
};
const ORG_URL = "https://m-org-1.eu.omnichannelengagementhub.com";
const matchingAttestation = { orgId: "org-1", widgetId: "widget-1", orgUrl: ORG_URL };

// The url this instance would use and the url the caller says it fetched from
// agree by default, because agreeing is the ordinary case; the tests that care
// about disagreement pass them explicitly.
const validate = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    attestation: { orgId: string; widgetId: string; orgUrl?: string } | undefined = matchingAttestation,
    instanceIdentity: { orgId: string; widgetId: string } = expected,
    bypassCache = false,
    effectiveOrgUrl = ORG_URL
) => validatePrefetchedLiveChatConfig(payload, attestation, instanceIdentity, bypassCache, effectiveOrgUrl);

describe("prefetchedConfigValidator", () => {
    describe("acceptance", () => {
        it("accepts a well-formed config with a matching attestation", () => {
            const result = validate(validConfig, matchingAttestation, expected, false);

            expect(result.accepted).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it("accepts when identity matches but casing differs", () => {
            const result = validate(
                validConfig,
                { orgId: "ORG-1", widgetId: "Widget-1", orgUrl: ORG_URL },
                expected,
                false
            );

            expect(result.accepted).toBe(true);
        });
    });

    describe("no prefetch attempted", () => {
        it.each([undefined, null])("rejects %p as NotProvided", (payload) => {
            const result = validate(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.NotProvided);
        });
    });

    describe("cache bypass", () => {
        it("rejects prefetch when the caller requested a cache bypass", () => {
            // A deliberate bypass must reach the network, otherwise sendCacheHeaders
            // would be silently defeated by a stale prefetched payload.
            const result = validate(validConfig, matchingAttestation, expected, true);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.CacheBypass);
        });
    });

    describe("attestation", () => {
        it("rejects a payload with no attestation at all", () => {
            // Calls through directly: the wrapper above substitutes a default for
            // an omitted attestation, which is exactly what this test must not get.
            const result = validatePrefetchedLiveChatConfig(validConfig, undefined, expected, false, ORG_URL);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });

        it.each([
            ["empty orgId", { orgId: "", widgetId: "widget-1" }],
            ["empty widgetId", { orgId: "org-1", widgetId: "" }]
        ])("rejects an attestation with %s", (_label, attestation) => {
            const result = validate(validConfig, attestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });

        it("rejects when this instance has no identity to compare against", () => {
            const result = validate(
                validConfig,
                matchingAttestation,
                { orgId: "", widgetId: "" },
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });

        it.each([
            ["numbers", { orgId: 123, widgetId: 456 }],
            ["objects", { orgId: {}, widgetId: {} }],
            ["arrays", { orgId: [], widgetId: [] }],
            ["a numeric orgId only", { orgId: 123, widgetId: "widget-1" }]
        ])("rejects an attestation whose ids are %s rather than throwing", (_label, attestation) => {
            // These are truthy, so a bare falsy check would let them through and
            // then throw on the case-insensitive comparison. Rejecting is what the
            // documented contract promises: never an error, always a fallback.
            expect(() => validate(validConfig, attestation as never)).not.toThrow();
            expect(validate(validConfig, attestation as never).reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });
    });

    describe("identity mismatch", () => {
        it("rejects a config attested for a different org", () => {
            const result = validate(
                validConfig,
                { orgId: "other-org", widgetId: "widget-1" },
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.IdentityMismatch);
        });

        it("rejects a config attested for a different widget in the same org", () => {
            // This is the cross-widget case: same tenant, wrong widget. Adopting it
            // would silently serve one widget's configuration to another.
            const result = validate(
                validConfig,
                { orgId: "org-1", widgetId: "other-widget" },
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.IdentityMismatch);
        });
    });

    describe("malformed payload", () => {
        it.each([
            ["a string", "not-a-config"],
            ["a number", 42],
            ["a boolean", true],
            ["an array", [{ LiveWSAndLiveChatEngJoin: {} }]]
        ])("rejects %s", (_label, payload) => {
            const result = validate(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MalformedPayload);
        });

        it("rejects an object missing LiveWSAndLiveChatEngJoin", () => {
            const result = validate({ SomethingElse: true }, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MalformedPayload);
        });
    });

    describe("payload identity", () => {
        it("rejects a payload whose own SalOrgId belongs to a different org", () => {
            // The attestation is correct here — this is the case a caller that
            // attests properly but hands over the wrong object would hit, e.g. two
            // widgets on one page with their configs swapped. Attestation alone
            // would have accepted it.
            const result = validate(
                { ...validConfig, SalOrgId: "other-org" },
                matchingAttestation,
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.PayloadOrgIdMismatch);
        });

        it("rejects a payload whose own widget id belongs to a different widget", () => {
            const result = validate(
                { ...validConfig, LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: "other-widget" } },
                matchingAttestation,
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.PayloadWidgetIdMismatch);
        });

        it("accepts a payload whose identity matches with different casing", () => {
            const result = validate(
                { ...validConfig, SalOrgId: "ORG-1", LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: "WIDGET-1" } },
                matchingAttestation,
                expected,
                false
            );

            expect(result.accepted).toBe(true);
        });

        it.each([
            ["SalOrgId is absent", { LiveChatVersion: 2, LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: "widget-1" } }],
            ["msdyn_widgetappid is absent", { LiveChatVersion: 2, SalOrgId: "org-1", LiveWSAndLiveChatEngJoin: {} }],
            ["both are absent", { LiveChatVersion: 2, LiveWSAndLiveChatEngJoin: {} }],
            ["SalOrgId is empty", { LiveChatVersion: 2, SalOrgId: "", LiveWSAndLiveChatEngJoin: {} }],
            ["SalOrgId is not a string", { LiveChatVersion: 2, SalOrgId: 42, LiveWSAndLiveChatEngJoin: {} }]
        ])("accepts when %s, since not every config carries them", (_label, payload) => {
            const result = validate(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(true);
        });
    });

    describe("live chat version", () => {
        it.each([
            ["absent", { SalOrgId: "org-1", LiveWSAndLiveChatEngJoin: {} }],
            ["null", { LiveChatVersion: null, SalOrgId: "org-1", LiveWSAndLiveChatEngJoin: {} }]
        ])("rejects a payload whose LiveChatVersion is %s", (_label, payload) => {
            // Without it the SDK cannot tell which chat stack to build, and would
            // fail later in buildConfigurations rather than here.
            const result = validate(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingLiveChatVersion);
        });

        it.each([
            ["an older version", 1],
            ["an unknown future version", 3],
            ["a string that looks like a version", "2"]
        ])("rejects %s", (_label, version) => {
            // The skipped network fetch is also what settles the version on the
            // underlying client. Only the version that client already defaults to
            // can be adopted without it; anything else would leave the two halves
            // disagreeing and fail later at token or transcript calls.
            const result = validate({ ...validConfig, LiveChatVersion: version });

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.UnsupportedLiveChatVersion);
        });
    });

    describe("org url proof", () => {
        // The fetch being skipped is the only thing that proves the org url in use
        // actually resolves — the SDK may rewrite it at runtime (unq -> Core
        // Services) and nothing else exercises the rewritten one. So the caller has
        // to hand over proof of its own: the url it fetched from.
        const UNQ_URL = "https://contoso-crm4.omnichannelengagementhub.com";

        it("rejects a payload from a caller that attested no fetch url", () => {
            // No proof offered. Adopting would leave every later call pointed at a
            // host nothing has ever reached.
            const result = validate(
                validConfig,
                { orgId: "org-1", widgetId: "widget-1" },
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.UnverifiedOrgUrl);
        });

        it("rejects a payload fetched from a different url than the one in use", () => {
            // This is the case that matters for a customer still embedding an old
            // unq org url: if the caller fetched the unq host but this instance
            // rewrote itself to Core Services, the caller proved the wrong host.
            const result = validate(
                { ...validConfig },
                { orgId: "org-1", widgetId: "widget-1", orgUrl: UNQ_URL },
                expected,
                false,
                ORG_URL
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.OrgUrlMismatch);
        });

        it("accepts a Core Services fetch by a caller embedding an old unq org url", () => {
            // The customer's embed still says unq, but the caller normalizes to Core
            // Services before fetching and this instance converts to the same host,
            // so the caller's own successful fetch IS the proof. This is the common
            // production shape, and rejecting it is what made the fast path dead
            // code for most orgs.
            const result = validate(
                validConfig,
                { orgId: "org-1", widgetId: "widget-1", orgUrl: ORG_URL },
                expected,
                false,
                ORG_URL
            );

            expect(result.accepted).toBe(true);
        });

        it("accepts when neither side converts, so both stay on the unq url", () => {
            // An org whose geo has no Core Services mapping: the caller leaves the
            // url alone and so does this instance, so they agree on the unq host and
            // the caller's fetch proves the one actually in use.
            const result = validate(
                validConfig,
                { orgId: "org-1", widgetId: "widget-1", orgUrl: UNQ_URL },
                expected,
                false,
                UNQ_URL
            );

            expect(result.accepted).toBe(true);
        });

        it("compares on origin, not on the raw string", () => {
            // The two urls are built independently by two different code paths, so
            // they may legitimately differ in trailing slash or case while naming
            // the same host. Treating that as a mismatch would cost a round-trip for
            // no reason.
            const result = validate(
                validConfig,
                { orgId: "org-1", widgetId: "widget-1", orgUrl: `${ORG_URL.toUpperCase()}/` },
                expected,
                false,
                ORG_URL
            );

            expect(result.accepted).toBe(true);
        });

        it.each(["", "not-a-url", "m-org-1.eu.omnichannelengagementhub.com"])(
            "does not adopt on an unusable attested url %p",
            (orgUrl) => {
                // This gates a fast path, so "cannot tell" has to mean "take the
                // network fetch" rather than throw or guess.
                const result = validate(
                    validConfig,
                    { orgId: "org-1", widgetId: "widget-1", orgUrl },
                    expected,
                    false,
                    ORG_URL
                );

                expect(result.accepted).toBe(false);
            }
        );

        it("reports an identity mismatch ahead of an org url problem", () => {
            const result = validate(
                validConfig,
                { orgId: "other-org", widgetId: "widget-1" },
                expected,
                false
            );

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.IdentityMismatch);
        });
    });

    describe("check ordering", () => {
        it("reports NotProvided ahead of a cache bypass", () => {
            const result = validate(undefined, matchingAttestation, expected, true);

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.NotProvided);
        });

        it("reports a cache bypass ahead of an identity mismatch", () => {
            const result = validate(
                validConfig,
                { orgId: "other-org", widgetId: "other-widget" },
                expected,
                true
            );

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.CacheBypass);
        });

        it("reports an identity mismatch ahead of a malformed payload", () => {
            // Identity is checked first on purpose: a mismatched payload must be
            // reported as a mismatch even when it is also junk.
            const result = validate(
                "junk",
                { orgId: "other-org", widgetId: "other-widget" },
                expected,
                false
            );

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.IdentityMismatch);
        });
    });
});
