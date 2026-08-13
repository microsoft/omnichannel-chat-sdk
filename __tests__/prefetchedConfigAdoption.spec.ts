/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Adoption-failure behaviour for a caller-prefetched live chat config.
 *
 * The validator decides whether a payload is *allowed* to be adopted. These tests
 * cover what happens once adoption is under way and the payload turns out to be
 * unusable anyway — a config can satisfy every validator check and still be missing
 * a block that buildConfigurations() dereferences.
 *
 * The contract being pinned: such a payload must NOT be latched. The SDK must fall
 * back to the network so no half-applied configuration (most importantly, data
 * masking that was never installed) can survive into a live conversation.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import LiveChatVersion from "../src/core/LiveChatVersion";

describe('Prefetched live chat config adoption', () => {
    const omnichannelConfig = {
        orgUrl: 'https://unqorg.omnichannelengagementhub.com',
        orgId: 'org-id',
        widgetId: 'widget-id'
    };

    const attestation = { orgId: 'org-id', widgetId: 'widget-id', orgUrl: omnichannelConfig.orgUrl };

    const networkConfig = {
        LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: 'widget-id' },
        LiveChatVersion: LiveChatVersion.V2,
        DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
        ChatWidgetLanguage: { msdyn_localeid: '1033' }
    };

    const makeSDK = () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = { singleRecord: jest.fn(), startScenario: jest.fn(), completeScenario: jest.fn(), failScenario: jest.fn() };
        chatSDK.OCClient = { getChatConfig: jest.fn().mockResolvedValue(networkConfig) };
        chatSDK.evaluateAMSAvailability = jest.fn();
        return chatSDK;
    };

    it('adopts a complete prefetched config without a network fetch', async () => {
        const chatSDK = makeSDK();
        const prefetched = { ...networkConfig, prefetchMarker: true };

        const result = await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: prefetched,
            prefetchedConfigAttestation: attestation
        });

        expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(0);
        expect(result.prefetchMarker).toBe(true);
    });

    it('falls back to the network when adopting the payload throws, leaving no partial state', async () => {
        const chatSDK = makeSDK();

        // Passes every validator check, but has no DataMaskingInfo, which
        // buildConfigurations() dereferences.
        const prefetched = {
            LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: 'widget-id' },
            LiveChatVersion: LiveChatVersion.V2,
            prefetchMarker: true
        };

        const result = await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: prefetched,
            prefetchedConfigAttestation: attestation
        });

        // The network fetch is what must have produced the config in use.
        expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
        expect(result.prefetchMarker).toBeUndefined();
        expect(chatSDK.liveChatConfig).toBe(networkConfig);
        expect(chatSDK.liveChatConfig.prefetchMarker).toBeUndefined();
    });

    it('records the adoption failure as a rejection rather than surfacing it', async () => {
        const chatSDK = makeSDK();

        await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: {
                LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: 'widget-id' },
                LiveChatVersion: LiveChatVersion.V2
            },
            prefetchedConfigAttestation: attestation
        });

        const rejections = chatSDK.scenarioMarker.singleRecord.mock.calls
            .filter((call: unknown[]) => `${call[0]}`.includes('Rejected'));

        expect(rejections.length).toBeGreaterThan(0);
    });
});

/**
 * The shape almost every production org actually has.
 *
 * The SDK rewrites a legacy unq org url to Core Services at runtime, and the
 * config fetch is the only thing that proves the rewritten host resolves — it is
 * also the only call with a DNS-failure fallback. So a caller that wants to skip
 * that fetch has to supply the proof itself: the url it fetched from. These tests
 * pin that the rewrite and the fast path can coexist, because for a long time
 * they could not: any org whose url was rewritten always took the network fetch,
 * which is nearly all of them.
 */
describe('Prefetched live chat config with a rewritten org url', () => {
    const UNQ_ORG_URL = 'https://contoso-crm4.omnichannelengagementhub.com';
    const CORE_SERVICES_ORG_URL = 'https://m-org-id.eu.omnichannelengagementhub.com';

    const networkConfig = {
        LiveWSAndLiveChatEngJoin: { msdyn_widgetappid: 'widget-id' },
        LiveChatVersion: LiveChatVersion.V2,
        DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
        ChatWidgetLanguage: { msdyn_localeid: '1033' }
    };

    /** An instance that has already done the runtime rewrite, as initialize() does. */
    const makeConvertedSDK = () => {
        const chatSDK = new OmnichannelChatSDK({
            orgUrl: UNQ_ORG_URL,
            orgId: 'org-id',
            widgetId: 'widget-id'
        });
        chatSDK.scenarioMarker = { singleRecord: jest.fn(), startScenario: jest.fn(), completeScenario: jest.fn(), failScenario: jest.fn() };
        chatSDK.OCClient = { getChatConfig: jest.fn().mockResolvedValue(networkConfig) };
        chatSDK.evaluateAMSAvailability = jest.fn();
        // The real conversion, not a stubbed flag: both initialization paths run
        // this before getChatConfig, and using the real one is what makes the
        // url below a fact rather than an assumption.
        chatSDK.useCoreServicesOrgUrlIfNotSet();
        return chatSDK;
    };

    it('rewrites a legacy unq org url to Core Services', () => {
        // Pinned because everything else here depends on the exact url produced;
        // a caller computing the same url independently has to agree with it.
        const chatSDK = makeConvertedSDK();

        expect(chatSDK.omnichannelConfig.orgUrl).toBe(CORE_SERVICES_ORG_URL);
        expect(chatSDK.unqServicesOrgUrl).toBe(UNQ_ORG_URL);
    });

    it('adopts a config fetched from the rewritten url without a second fetch', async () => {
        // The caller normalized the legacy url the same way and fetched from the
        // result, so its successful fetch already proved the host this instance
        // is about to use. One getConfig for the whole load.
        const chatSDK = makeConvertedSDK();

        const result = await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: { ...networkConfig, prefetchMarker: true },
            prefetchedConfigAttestation: {
                orgId: 'org-id',
                widgetId: 'widget-id',
                orgUrl: CORE_SERVICES_ORG_URL
            }
        });

        expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(0);
        expect(result.prefetchMarker).toBe(true);
    });

    it('refetches when the caller only proved the pre-rewrite url', async () => {
        // The caller reached the legacy host; this instance is about to use the
        // Core Services one, which nothing has touched. Falling back costs a
        // round-trip and keeps the DNS-failure fallback that lives in the fetch.
        const chatSDK = makeConvertedSDK();

        const result = await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: { ...networkConfig, prefetchMarker: true },
            prefetchedConfigAttestation: {
                orgId: 'org-id',
                widgetId: 'widget-id',
                orgUrl: UNQ_ORG_URL
            }
        });

        expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
        expect(result.prefetchMarker).toBeUndefined();
    });

    it('refetches when the caller proved nothing', async () => {
        const chatSDK = makeConvertedSDK();

        await chatSDK.getChatConfig({
            prefetchedLiveChatConfig: { ...networkConfig, prefetchMarker: true },
            prefetchedConfigAttestation: { orgId: 'org-id', widgetId: 'widget-id' }
        });

        expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
    });
});
