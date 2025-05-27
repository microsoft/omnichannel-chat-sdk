/**
 * @jest-environment jsdom
 */

import { whitelistedUrls, isUrlWhitelisted, shouldUseFramedMode } from "../../src/utils/AMSClientUtils";

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
});