import { omnichannelChatSdkVersion } from "../config/settings";

/**
 * Gets the omnichannel-chat-sdk version.
 *
 * In most environments, this will successfully read from package.json.
 * In rare bundled environments where this fails, it falls back to the
 * version from settings (manually maintained).
 */
const getOmnichannelChatSdkVersion = (): string => {
    try {
        // Try dynamic loading - works in 99% of cases

        const packageJson = require('../../package.json');

        if (packageJson && packageJson.version && packageJson.version !== "0.0.0-0") {
            return packageJson.version;
        }
    } catch (error) {
        return omnichannelChatSdkVersion;
    }

    // Fallback to settings version
    return omnichannelChatSdkVersion;
};

export { getOmnichannelChatSdkVersion };