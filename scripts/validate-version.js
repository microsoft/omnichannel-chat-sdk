#!/usr/bin/env node

// Version consistency validation script
// This script validates that package.json and settings.ts versions match

const fs = require('fs');
const path = require('path');

function validateVersions() {
    console.log('🔍 Validating version consistency...\n');

    try {
        // Read package.json version
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const packageVersion = packageJson.version;

        // Read settings.ts version
        const settingsPath = path.join(process.cwd(), 'src/config/settings.ts');
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');

        // Extract version from settings.ts using regex
        const versionMatch = settingsContent.match(/omnichannelChatSdkVersion\s*=\s*['"`]([^'"`]+)['"`]/);
        const settingsVersion = versionMatch ? versionMatch[1] : null;

        console.log(`📦 package.json version: ${packageVersion}`);
        console.log(`⚙️  settings.ts version: ${settingsVersion || 'NOT FOUND'}\n`);

        // Validate versions
        if (!settingsVersion) {
            const errorMessage = '❌ Could not find omnichannelChatSdkVersion in src/config/settings.ts';
            console.error(errorMessage);
            console.error('\n🔧 Please ensure the omnichannelChatSdkVersion variable is properly defined in settings.ts');
            process.exit(1);
        }

        if (packageVersion !== settingsVersion) {
            const errorMessage = 
                `❌ Version mismatch detected!\n\n` +
                `📦 package.json version: ${packageVersion}\n` +
                `⚙️  settings.ts version: ${settingsVersion}\n\n` +
                `🔧 To fix this:\n` +
                `1. Update omnichannelChatSdkVersion in src/config/settings.ts to "${packageVersion}"\n` +
                `2. Commit the change\n\n` +
                `This ensures bundled environments have the correct version information.`;
            
            console.error(errorMessage);
            process.exit(1);
        }

        console.log('✅ Version consistency check passed!');
        console.log('Both package.json and settings.ts have matching versions.\n');

    } catch (error) {
        console.error('❌ Error during version validation:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run validation
validateVersions();