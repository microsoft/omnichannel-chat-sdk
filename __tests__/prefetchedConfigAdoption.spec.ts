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

    const attestation = { orgId: 'org-id', widgetId: 'widget-id' };

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
        chatSDK.unqServicesOrgUrl = null;
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
