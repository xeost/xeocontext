/**
 * Script to list available releases (tags) from the upstream repository.
 * Usage: npx tsx scripts/list-releases.ts
 */

import { execSync } from 'child_process';

const UPSTREAM_URL = 'https://github.com/xeost/xeocontext.git';

function listReleases() {
    console.log(`\n🔍 Fetching tags from upstream: ${UPSTREAM_URL}...\n`);

    try {
        // Use git ls-remote to get tags without fetching objects
        const output = execSync(`git ls-remote --tags ${UPSTREAM_URL}`, { encoding: 'utf-8' });

        // Parse the output
        const tags = output
            .split('\n')
            .filter(line => line.includes('refs/tags/'))
            .map(line => {
                const parts = line.split('\t');
                const ref = parts[1];
                return ref.replace('refs/tags/', '');
            })
            .filter(tag => !tag.endsWith('^{}')) // Remove dereferenced tags (duplicates for annotated tags)
            .sort((a, b) => {
                // Try to sort semver-ish (descending)
                // This is a basic string sort for now, ideally use semver package if accuracy is critical for complex versions
                return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
            });

        if (tags.length === 0) {
            console.log('No tags found.');
            return;
        }

        console.log('📦 Available Releases:');
        console.log('======================');
        tags.forEach(tag => console.log(`  • ${tag}`));
        console.log('======================\n');
        console.log(`ℹ️  Set XEOCONTEXT_TAG in your .env file to one of these versions.\n`);

    } catch (error) {
        console.error('❌ Error fetching releases:');
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(String(error));
        }
        process.exit(1);
    }
}

listReleases();
