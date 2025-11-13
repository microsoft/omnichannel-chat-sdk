import { getOmnichannelChatSdkVersion } from "../../src/utils/version";

describe("version", () => {
    it("getOmnichannelChatSdkVersion() should return a valid version string", () => {
        const version = getOmnichannelChatSdkVersion();
        
        // Should not be empty, undefined, or the placeholder
        expect(version).toBeDefined();
        expect(version).not.toBe('');
        expect(version).not.toBe('__OMNICHANNEL_CHAT_SDK_VERSION__');
        
        // In dev environment, should match package.json version
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const packageVersion = require("../../package.json").version;
        expect(version).toBe(packageVersion);
    });

    it("getOmnichannelChatSdkVersion() should handle fallback scenarios gracefully", () => {
        // This test ensures the function doesn't throw errors
        expect(() => getOmnichannelChatSdkVersion()).not.toThrow();
    });
});