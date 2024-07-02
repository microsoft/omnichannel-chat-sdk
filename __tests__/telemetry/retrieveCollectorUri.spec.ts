import retrieveCollectorUri from '../../src/telemetry/retrieveCollectorUri';
import EUDomainNames from '../../src/telemetry/EUDomainNames';
import GCCDomainPatterns from '../../src/telemetry/GCCDomainPatterns';

describe('retrieveCollectorUri', () => {
    const defaultCollectorUri = "https://browser.pipe.aria.microsoft.com/Collector/3.0/";
    const EUCollectorUri = "https://eu-mobile.events.data.microsoft.com/Collector/3.0/";
    const GCCCollectorUri = "https://tb.pipe.aria.microsoft.com/Collector/3.0/";

    it('retrieveCollectorUri() should return default EUCollectorUri on EU orgUrls', () => {
        for (const domain of EUDomainNames) {
            const orgUrl = `foo.${domain}`;
            const collectorUri = retrieveCollectorUri(orgUrl);
            expect(collectorUri).toBe(EUCollectorUri);
        }
    });

    it('retrieveCollectorUri() should return default defaultCollectorUri on non-EU orgUrl', () => {
        const orgUrl = "microsoft.com";
        const collectorUri = retrieveCollectorUri(orgUrl);

        expect(collectorUri).toBe(defaultCollectorUri);
    });

    it('retrieveCollectorUri() should return default GCCCollectorUri on GCC orgUrl', () => {
        for (const domainPattern of GCCDomainPatterns) {
            const orgUrl = `foo.${domainPattern}.bar`;
            const collectorUri = retrieveCollectorUri(orgUrl);
            expect(collectorUri).toBe(GCCCollectorUri);
        }
    });

    it('retrieveCollectorUri() with \'crm9\' as part of the org name should NOT return GCCCollectorUri on GCC orgUrl', () => {
        const orgUrl = `[prefix]crm9[suffix].crm90.bar`;
        const collectorUri = retrieveCollectorUri(orgUrl);

        expect(collectorUri).not.toBe(GCCCollectorUri);
        expect(collectorUri).toBe(defaultCollectorUri);
    });
});