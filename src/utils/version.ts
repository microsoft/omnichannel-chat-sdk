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
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const packageJson = require('../../package.json');
        console.log('LOPEZ :: Debug packageJson:', packageJson);

        if (packageJson && packageJson.version && packageJson.version !== "0.0.0-0") {
            return packageJson.version;
        }

        console.log('LOPEZ :: Debug - packageJson version is invalid, using fallback');
    } catch (error) {
        console.log('LOPEZ :: Debug - require failed, using fallback:', error);
    }

    // Fallback to settings version
    console.log('LOPEZ :: Debug - using settings version:', omnichannelChatSdkVersion);
    return omnichannelChatSdkVersion;
};

export { getOmnichannelChatSdkVersion };