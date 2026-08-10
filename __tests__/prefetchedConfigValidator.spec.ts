import validatePrefetchedLiveChatConfig, { PrefetchedConfigRejectionReason } from "../src/validators/prefetchedConfigValidator";

const expected = { orgId: "org-1", widgetId: "widget-1" };
const validConfig = {
    LiveChatVersion: 2,
    SalOrgId: "org-1",
    LiveWSAndLiveChatEngJoin: { ShowWidget: "true", msdyn_widgetappid: "widget-1" }
};
const matchingAttestation = { orgId: "org-1", widgetId: "widget-1" };

describe("prefetchedConfigValidator", () => {
    describe("acceptance", () => {
        it("accepts a well-formed config with a matching attestation", () => {
            const result = validatePrefetchedLiveChatConfig(validConfig, matchingAttestation, expected, false);

            expect(result.accepted).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it("accepts when identity matches but casing differs", () => {
            const result = validatePrefetchedLiveChatConfig(
                validConfig,
                { orgId: "ORG-1", widgetId: "Widget-1" },
                expected,
                false
            );

            expect(result.accepted).toBe(true);
        });
    });

    describe("no prefetch attempted", () => {
        it.each([undefined, null])("rejects %p as NotProvided", (payload) => {
            const result = validatePrefetchedLiveChatConfig(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.NotProvided);
        });
    });

    describe("cache bypass", () => {
        it("rejects prefetch when the caller requested a cache bypass", () => {
            // A deliberate bypass must reach the network, otherwise sendCacheHeaders
            // would be silently defeated by a stale prefetched payload.
            const result = validatePrefetchedLiveChatConfig(validConfig, matchingAttestation, expected, true);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.CacheBypass);
        });
    });

    describe("attestation", () => {
        it("rejects a payload with no attestation at all", () => {
            const result = validatePrefetchedLiveChatConfig(validConfig, undefined, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });

        it.each([
            ["empty orgId", { orgId: "", widgetId: "widget-1" }],
            ["empty widgetId", { orgId: "org-1", widgetId: "" }]
        ])("rejects an attestation with %s", (_label, attestation) => {
            const result = validatePrefetchedLiveChatConfig(validConfig, attestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });

        it("rejects when this instance has no identity to compare against", () => {
            const result = validatePrefetchedLiveChatConfig(
                validConfig,
                matchingAttestation,
                { orgId: "", widgetId: "" },
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingAttestation);
        });
    });

    describe("identity mismatch", () => {
        it("rejects a config attested for a different org", () => {
            const result = validatePrefetchedLiveChatConfig(
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
            const result = validatePrefetchedLiveChatConfig(
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
            const result = validatePrefetchedLiveChatConfig(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MalformedPayload);
        });

        it("rejects an object missing LiveWSAndLiveChatEngJoin", () => {
            const result = validatePrefetchedLiveChatConfig({ SomethingElse: true }, matchingAttestation, expected, false);

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
            const result = validatePrefetchedLiveChatConfig(
                { ...validConfig, SalOrgId: "other-org" },
                matchingAttestation,
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.PayloadOrgIdMismatch);
        });

        it("rejects a payload whose own widget id belongs to a different widget", () => {
            const result = validatePrefetchedLiveChatConfig(
                { ...validConfig, LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: "other-widget" } },
                matchingAttestation,
                expected,
                false
            );

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.PayloadWidgetIdMismatch);
        });

        it("accepts a payload whose identity matches with different casing", () => {
            const result = validatePrefetchedLiveChatConfig(
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
            const result = validatePrefetchedLiveChatConfig(payload, matchingAttestation, expected, false);

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
            const result = validatePrefetchedLiveChatConfig(payload, matchingAttestation, expected, false);

            expect(result.accepted).toBe(false);
            expect(result.reason).toBe(PrefetchedConfigRejectionReason.MissingLiveChatVersion);
        });
    });

    describe("check ordering", () => {
        it("reports NotProvided ahead of a cache bypass", () => {
            const result = validatePrefetchedLiveChatConfig(undefined, matchingAttestation, expected, true);

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.NotProvided);
        });

        it("reports a cache bypass ahead of an identity mismatch", () => {
            const result = validatePrefetchedLiveChatConfig(
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
            const result = validatePrefetchedLiveChatConfig(
                "junk",
                { orgId: "other-org", widgetId: "other-widget" },
                expected,
                false
            );

            expect(result.reason).toBe(PrefetchedConfigRejectionReason.IdentityMismatch);
        });
    });
});
