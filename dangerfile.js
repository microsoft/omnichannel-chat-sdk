// Version consistency check

import { readFileSync } from 'fs';

// Read package.json version
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const packageVersion = packageJson.version;

// Read settings.ts version
const settingsPath = 'src/config/settings.ts';
const settingsContent = readFileSync(settingsPath, 'utf8');

// Extract version from settings.ts using regex
const versionMatch = settingsContent.match(/omnichannelChatSdkVersion\s*=\s*['"`]([^'"`]+)['"`]/);
const settingsVersion = versionMatch ? versionMatch[1] : null;

// Check if versions match
if (!settingsVersion) {
    warn('❌ Could not find omnichannelChatSdkVersion in src/config/settings.ts');
} else if (packageVersion !== settingsVersion) {
    warn(
        `❌ Version mismatch detected!\n\n` +
        `📦 package.json version: ${packageVersion}\n` +
        `⚙️  settings.ts version: ${settingsVersion}\n\n` +
        `🔧 To fix this:\n` +
        `1. Update omnichannelChatSdkVersion in src/config/settings.ts to "${packageVersion}"\n` +
        `2. Commit the change\n\n` +
        `This ensures bundled environments have the correct version information.`
    );
}