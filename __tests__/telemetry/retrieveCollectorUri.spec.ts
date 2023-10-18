import retrieveCollectorUri from '../../src/telemetry/retrieveCollectorUri';

describe('retrieveCollectorUri', () => {
    const defaultCollectorUri = "https://browser.pipe.aria.microsoft.com/Collector/3.0/";
    const EUCollectorUri = "https://eu-mobile.events.data.microsoft.com/Collector/3.0/";

    it('retrieveCollectorUri() should return default EUCollectorUri on EU orgUrl', () => {
        const orgUrl = "foo.crm4.omnichannelengagementhub.com";
        const collectorUri = retrieveCollectorUri(orgUrl);

        expect(collectorUri).toBe(EUCollectorUri);
    });

    it('retrieveCollectorUri() should return default defaultCollectorUri on non-EU orgUrl', () => {
        const orgUrl = "microsoft.com";
        const collectorUri = retrieveCollectorUri(orgUrl);

        expect(collectorUri).toBe(defaultCollectorUri);
    });
});