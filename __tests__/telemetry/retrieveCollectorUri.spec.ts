import retrieveCollectorUri from '../../src/telemetry/retrieveCollectorUri';
import EUDomainNames from '../../src/telemetry/EUDomainNames';

describe('retrieveCollectorUri', () => {
    const defaultCollectorUri = "https://browser.pipe.aria.microsoft.com/Collector/3.0/";
    const EUCollectorUri = "https://eu-mobile.events.data.microsoft.com/Collector/3.0/";

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
});