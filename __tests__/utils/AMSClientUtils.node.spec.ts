/**
 * @jest-environment node
 */

import { whitelistedUrls, isUrlWhitelisted, shouldUseFramedMode, retrieveRegionBasedUrl } from "../../src/utils/AMSClientUtils";

describe("AMSClientUtils", () => {
    it("isUrlWhitelisted() should return 'true' if URL is whitelisted", () => {
        for (const url of whitelistedUrls) {
            expect(isUrlWhitelisted(url)).toBe(true);
        }
    });

    it("isUrlWhitelisted() should return 'false' if URL is not whitelisted", () => {
        const url = "https://contoso.com";
        expect(isUrlWhitelisted(url)).toBe(false);
    });

    it("shouldUseFramedMode() should return 'false' on node platform", () => {
        expect(shouldUseFramedMode()).toBe(false);
    });

    it("shouldUseFramedMode() should return 'false' on React Native platform", () => {
        (global as any).window = undefined;
        
        (global as any).navigator = {};

        (global.navigator as any).product = 'ReactNative';

        expect(shouldUseFramedMode()).toBe(false);
    });

    it("retrieveRegionBasedUrl() should return '' on node platform", () => {
        for (const url of whitelistedUrls) {
            const widgetSnippetBaseUrl = url;
            const regionBasedUrl = retrieveRegionBasedUrl(widgetSnippetBaseUrl);
            expect(regionBasedUrl).toBe('');
        }
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});