import EUDomainNames from "./EUDomainNames";
import GCCDomainPatterns from "./GCCDomainPatterns";

const retrieveCollectorUri = (orgUrl: string): string => {
    const defaultCollectorUri = "https://browser.pipe.aria.microsoft.com/Collector/3.0/";
    const EUCollectorUri = "https://eu-mobile.events.data.microsoft.com/Collector/3.0/";
    const GCCCollectorUri = "https://tb.pipe.aria.microsoft.com/Collector/3.0/";

    let url = orgUrl;
    if (orgUrl.endsWith("/")) {
        url = orgUrl.replace("/", "");
    }

    for (let i = 0; i < EUDomainNames.length; i++) {
        if (url.endsWith(EUDomainNames[i])) {
            return EUCollectorUri;
        }
    }

    for (let i = 0; i < GCCDomainPatterns.length; i++) {
        if (url.includes(GCCDomainPatterns[i])) {
            return GCCCollectorUri;
        }
    }

    return defaultCollectorUri;
};

export default retrieveCollectorUri;