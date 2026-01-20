const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../lib/version.ts');

try {
    let content = fs.readFileSync(versionFile, 'utf8');
    const versionRegex = /export const APP_VERSION = "(\d+\.\d+\.(\d+))";/;
    const match = content.match(versionRegex);

    if (match) {
        const fullVersion = match[1];
        const patchVersion = parseInt(match[2]);
        const newPatchVersion = patchVersion + 1;
        const newVersion = fullVersion.replace(/\.\d+$/, `.${newPatchVersion}`);

        content = content.replace(versionRegex, `export const APP_VERSION = "${newVersion}";`);
        fs.writeFileSync(versionFile, content);

        console.log(`\n\x1b[32m✅ BUMPED VERSION: ${fullVersion} -> ${newVersion}\x1b[0m\n`);
    } else {
        console.error('Could not find version string in lib/version.ts');
        process.exit(1);
    }
} catch (error) {
    console.error('Error bumping version:', error);
    process.exit(1);
}
