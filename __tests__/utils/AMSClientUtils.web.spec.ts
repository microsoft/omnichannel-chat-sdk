/**
 * @jest-environment jsdom
 */

import { whitelistedUrls, isUrlWhitelisted, shouldUseFramedMode, regionBasedSupportedUrls, regionBasedUrlSupportedVersions, isRegionBasedUrlSupported, retrieveRegionBasedUrl } from "../../src/utils/AMSClientUtils";

describe("AMSClientUtils", () => {
    const { location } = window;

    afterAll((): void => {
        (window as any).location = location;
    });

    it("isUrlWhitelisted() should return 'true' if URL is whitelisted", () => {
        for (const url of whitelistedUrls) {
            expect(isUrlWhitelisted(url)).toBe(true);
        }
    });

    it("isUrlWhitelisted() should return 'false' if URL is not whitelisted", () => {
        const url = "https://contoso.com";
        expect(isUrlWhitelisted(url)).toBe(false);
    });

    it("shouldUseFramedMode() should return 'false' if URL is whitelisted", () => {
        for (const url of whitelistedUrls) {
            delete (window as any).location;
            (window as any).location = {
                origin: url,
            };
            expect(shouldUseFramedMode(false)).toBe(false);
        }
    });

    it("shouldUseFramedMode() should return 'true' if whitelisted URLs check is disabled", () => {
        for (const url of whitelistedUrls) {
            delete (window as any).location;
            (window as any).location = {
                origin: url,
            };
            expect(shouldUseFramedMode(true)).toBe(true);
        }
    });

    it("shouldUseFramedMode() should return 'true' if URL is not whitelisted", () => {
        const url = "https://contoso.com";
        delete (window as any).location;
        (window as any).location = {
            origin: url,
        };
        expect(shouldUseFramedMode(false)).toBe(true);
    });

    it("shouldUseFramedMode() should still return 'true' if URL is not whitelisted & whitelisted URLs check is disabled", () => {
        const url = "https://contoso.com";
        delete (window as any).location;
        (window as any).location = {
            origin: url,
        };
        expect(shouldUseFramedMode(true)).toBe(true);
    });

    it("isRegionBasedUrlSupported() should return 'true' if URL is supported", () => {
        for (const url of regionBasedSupportedUrls) {
            const isSupported = isRegionBasedUrlSupported(url);
            expect(isSupported).toBe(true);
        }
    });

    it("isRegionBasedUrlSupported() should return 'false' if URL is not supported", () => {
        const unsupportedUrl = [
            "https://microsoft.com",
            "https://bing.com",
            "https://contoso.com"
        ];

        for (const url of unsupportedUrl) {
            const isSupported = isRegionBasedUrlSupported(url);
            expect(isSupported).toBe(false);
        }
    });

    it("retrieveRegionBasedUrl() with '' as widget snippet base url should return ''", () => {
        const widgetSnippetBaseUrl = "";
        const regionBasedUrl = retrieveRegionBasedUrl(widgetSnippetBaseUrl);
        expect(regionBasedUrl).toBe("");
    });

    it("retrieveRegionBasedUrl() should return region based url accordingly", () => {
        for (const url of regionBasedSupportedUrls) {
            const widgetSnippetBaseUrl = url;
            // Mock the version to be 1.10
            jest.mock('@microsoft/omnichannel-amsclient/package.json', () => ({
                version: '0.1.10'
            }));
            const regionBasedUrl = retrieveRegionBasedUrl(widgetSnippetBaseUrl);
            expect(regionBasedUrl).toBe(`${widgetSnippetBaseUrl}/livechatwidget/v2scripts/ams`);
        }
    });

    it("retrieveRegionBasedUrl() should return '' if widget snippet base url is not supported", () => {
        const unsupportedUrl = [
            "https://microsoft.com",
            "https://bing.com",
            "https://contoso.com"
        ];

        for (const url of unsupportedUrl) {
            const regionBasedUrl = retrieveRegionBasedUrl(url);
            expect(regionBasedUrl).toBe("");
        }
    });

    it("retrieveRegionBasedUrl() should NOT return '' if version is supported", () => {
        const url = regionBasedSupportedUrls[0];
        for (const version of regionBasedUrlSupportedVersions) {
            jest.replaceProperty(require('@microsoft/omnichannel-amsclient/package.json'), 'version', version);
            const regionBasedUrl = retrieveRegionBasedUrl(url);
            expect(regionBasedUrl).not.toBe("");
        }
    });

    it("retrieveRegionBasedUrl() should return '' if version is not supported", () => {
        const url = regionBasedSupportedUrls[0];
        const unsupportedVersions = [
            "0.1.5",
            "0.1.6",
            "0.1.7",
        ];

        for (const version of unsupportedVersions) {
            jest.replaceProperty(require('@microsoft/omnichannel-amsclient/package.json'), 'version', version);
            const regionBasedUrl = retrieveRegionBasedUrl(url);
            expect(regionBasedUrl).toBe("");
        }
    });
});