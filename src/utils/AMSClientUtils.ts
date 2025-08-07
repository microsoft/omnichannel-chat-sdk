import { isBrowser } from "./platform";

export const whitelistedUrls = [
    "https://oc-cdn-ppe2.azureedge.net",
    "https://oc-cdn-public.azureedge.net",
    "https://oc-cdn-public-sam.azureedge.net",
    "https://oc-cdn-ocuae-uae.azureedge.net",
    "https://oc-cdn-ocfra-fra.azureedge.net",
    "https://oc-cdn-public-ger.azureedge.net",
    "https://oc-cdn-public-che.azureedge.net",
    "https://oc-cdn-public-ind.azureedge.net",
    "https://oc-cdn-public-gbr.azureedge.net",
    "https://oc-cdn-public-apj.azureedge.net",
    "https://oc-cdn-public-oce.azureedge.net",
    "https://oc-cdn-public-jpn.azureedge.net",
    "https://oc-cdn-public-eur.azureedge.net",
    "https://oc-cdn-ocprod.azureedge.net",
    "https://ocprodocprodnamgs.blob.core.usgovcloudapi.net"
];

export const regionBasedSupportedUrls = [
    "https://oc-cdn-ppe2.azureedge.net",
    "https://oc-cdn-public.azureedge.net",
    "https://oc-cdn-public-sam.azureedge.net",
    "https://oc-cdn-ocuae-uae.azureedge.net",
    "https://oc-cdn-ocfra-fra.azureedge.net",
    "https://oc-cdn-public-ger.azureedge.net",
    "https://oc-cdn-public-che.azureedge.net",
    "https://oc-cdn-public-ind.azureedge.net",
    "https://oc-cdn-public-gbr.azureedge.net",
    "https://oc-cdn-public-apj.azureedge.net",
    "https://oc-cdn-public-oce.azureedge.net",
    "https://oc-cdn-public-jpn.azureedge.net",
    "https://oc-cdn-public-eur.azureedge.net",
    "https://oc-cdn-ocprod.azureedge.net",
    "https://ocprodocprodnamgs.blob.core.usgovcloudapi.net"
];

export const regionBasedUrlSupportedVersions = [
    "0.1.8",
    "0.1.9",
    "0.1.10"
];

export const isUrlWhitelisted = (url: string) => {
    return whitelistedUrls.includes(url);
};

export const shouldUseFramedMode = (disableWhitelistedUrls = true) => {
    if (isBrowser() && disableWhitelistedUrls === false) {
        const domain = window.location.origin || '';
        return isUrlWhitelisted(domain) ? false : true; // Framed mode is used when domain is not whitelisted
    }

    return isBrowser();
};

export const isRegionBasedUrlSupported = (widgetSnippetBaseUrl: string) => {
    return regionBasedSupportedUrls.includes(widgetSnippetBaseUrl);
}

export const isRegionBasedUrlVersionSupported = () => {
    const version = require('@microsoft/omnichannel-amsclient/package.json').version // eslint-disable-line @typescript-eslint/no-var-requires
    return regionBasedUrlSupportedVersions.includes(version);
}

export const retrieveRegionBasedUrl = (widgetSnippetBaseUrl: string) => {
    const isUrlSupported = isRegionBasedUrlSupported(widgetSnippetBaseUrl);
    const isVersionSupported = isRegionBasedUrlVersionSupported();
    if (isBrowser() && widgetSnippetBaseUrl && isUrlSupported && isVersionSupported) {
        const regionBasedUrl = `${widgetSnippetBaseUrl}/livechatwidget/v2scripts/ams`;
        return regionBasedUrl;
    }

    return '';
};