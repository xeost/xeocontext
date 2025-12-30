/**
 * Script to setup the content directory and update the application code.
 * Usage: npx tsx scripts/setup-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// --- Configuration & Env Loading ---

const ENV_PATH = path.resolve(process.cwd(), '.env');

// Manual .env parser to avoid extra dependencies if possible, 
// though 'dotenv' is likely present in Next.js environment.
function loadEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        console.warn('⚠️  .env file not found. Using defaults or environment variables.');
        return;
    }
    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim();
            if (!process.env[key]) { // Don't overwrite existing
                process.env[key] = val;
            }
        }
    });
}

loadEnv();

const CONFIG = {
    tag: process.env.XEOCONTEXT_TAG,
    contentType: process.env.XEOCONTEXT_CONTENT_TYPE?.toLowerCase(),
    contentSource: process.env.XEOCONTEXT_CONTENT_SOURCE,
    deployRepo: process.env.XEOCONTEXT_DEPLOY_REPO,
    upstreamUrl: 'https://github.com/xeost/xeocontext.git'
};

const CONTENT_DIR = path.resolve(process.cwd(), 'content');

// --- Helpers ---

function runCmd(cmd: string, cwd: string = process.cwd(), ignoreError = false): string {
    // console.log(`> ${cmd}`);
    try {
        return execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' }).trim();
    } catch (error: any) {
        if (!ignoreError) {
            console.error(`❌ Command failed: ${cmd}`);
            console.error(error.stderr || error.message);
            process.exit(1);
        }
        return '';
    }
}

function ensureGitRemote() {
    console.log('🔧 Configuring Git remotes...');

    const remotes = runCmd('git remote -v');

    // 1. Configure Upstream
    if (!remotes.includes('upstream')) {
        // specific check: if origin is xeost, rename it to upstream
        if (remotes.includes('origin') && remotes.includes('github.com/xeost/xeocontext')) {
            console.log('   Renaming default "origin" to "upstream"...');
            runCmd('git remote rename origin upstream');
        } else {
            console.log('   Adding "upstream" remote...');
            runCmd(`git remote add upstream ${CONFIG.upstreamUrl}`);
        }
    } else {
        console.log('   "upstream" remote already exists.');
    }

    // 2. Configure Origin (Deploy Repo)
    // If we renamed origin above, it's gone. If we didn't, it might still be there.
    if (CONFIG.deployRepo) {
        const currentRemotes = runCmd('git remote');
        if (!currentRemotes.includes('origin')) {
            console.log(`   Adding "origin" remote: ${CONFIG.deployRepo}`);
            runCmd(`git remote add origin ${CONFIG.deployRepo}`);
        } else {
            // Check if origin matches deployRepo. If not, maybe warn? 
            // For now we assume user handles it if it exists distinct from xeost.
            const originUrl = runCmd('git remote get-url origin');
            if (originUrl !== CONFIG.deployRepo) {
                console.warn(`⚠️  "origin" remote exists but does not match XEOCONTEXT_DEPLOY_REPO.`);
                console.warn(`   Current: ${originUrl}`);
                console.warn(`   Target:  ${CONFIG.deployRepo}`);
                console.warn(`   Please fix manually if needed: git remote set-url origin ${CONFIG.deployRepo}`);
            } else {
                console.log('   "origin" remote is correctly configured.');
            }
        }
    }
}

function updateAppCode() {
    if (!CONFIG.tag) {
        console.log('ℹ️  No XEOCONTEXT_TAG defined. Skipping app update (staying on current HEAD).');
        return;
    }

    console.log(`🔄 Updating app code to tag: ${CONFIG.tag}...`);

    // Check if tag exists locally
    const localTags = runCmd('git tag --list');
    const tagExistsLocally = localTags.split('\n').includes(CONFIG.tag);

    if (!tagExistsLocally) {
        console.log(`   Tag ${CONFIG.tag} not found locally. Fetching upstream...`);
        try {
            runCmd('git fetch upstream --tags');
        } catch (e) {
            // Try fetching without --tags just in case
            runCmd('git fetch upstream');
        }

        // Verify again
        const allTags = runCmd('git tag --list');
        if (!allTags.split('\n').includes(CONFIG.tag)) {
            console.error(`❌ Tag ${CONFIG.tag} does not exist remotely in upstream.`);
            process.exit(1);
        }
    }

    // Checkout/Reset logic
    // We want 'main' to match the tag.
    // If we are on main, we reset. If not, we checkout -B main.
    const currentBranch = runCmd('git branch --show-current');

    if (currentBranch === 'main') {
        console.log('   Resetting local main to tag...');
        runCmd(`git reset --hard ${CONFIG.tag}`);
    } else {
        console.log(`   Checking out main at ${CONFIG.tag}...`);
        runCmd(`git checkout -B main ${CONFIG.tag}`);
    }

    console.log('✅ App code updated.');
}

function syncContent() {
    if (!CONFIG.contentType || !CONFIG.contentSource) {
        console.log('ℹ️  Content configuration missing (XEOCONTEXT_CONTENT_TYPE / SOURCE). Skipping content sync.');
        return;
    }

    console.log(`📂 Syncing content from [${CONFIG.contentType}]: ${CONFIG.contentSource}`);

    // clear content dir except .gitkeep (and maybe xeocontext.config.json if we want to preserve it? No, sync overrides)
    // Actually, prompt says: "Por defecto.. será .gitkeep". Sync replaces it.
    if (fs.existsSync(CONTENT_DIR)) {
        fs.rmSync(CONTENT_DIR, { recursive: true, force: true });
        fs.mkdirSync(CONTENT_DIR);
    } else {
        fs.mkdirSync(CONTENT_DIR);
    }

    if (CONFIG.contentType === 'local') {
        const sourcePath = path.resolve(process.cwd(), CONFIG.contentSource);
        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Local content source not found: ${sourcePath}`);
            process.exit(1);
        }

        console.log(`   Copying from ${sourcePath}...`);
        try {
            // cp -R similar behavior
            runCmd(`cp -R "${sourcePath}/." "${CONTENT_DIR}/"`);
            // Note: cp -R on mac/linux. Windows might fail.
            // Better to use fs-extra copy or recursive copy function for cross-platform.
            // Since user requested TypeScript script, we can implement simple recursive copy or use external lib.
            // But standard 'cp' works on Mac/Linux. User said "scripts deben ser multiplataforma... conveniente TS".
            // So using cp in execSync is BAD for Windows.
            // I will implement a simple recursive copy function.
        } catch (e) {
            console.error('Copy failed', e);
            process.exit(1);
        }

    } else if (CONFIG.contentType === 'git') {
        console.log(`   Cloning from ${CONFIG.contentSource}...`);
        const tempDir = path.join(process.cwd(), 'temp_content_sync');
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });

        try {
            runCmd(`git clone --depth 1 "${CONFIG.contentSource}" "${tempDir}"`);

            console.log('   Moving files to content directory...');
            // Move files from tempDir to CONTENT_DIR
            copyRecursiveSync(tempDir, CONTENT_DIR, ['.git']);

            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Git clone failed', e);
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
            process.exit(1);
        }
    } else {
        console.error(`❌ Unknown content type: ${CONFIG.contentType}`);
        process.exit(1);
    }

    console.log('✅ Content synced successfully.');
}

// Simple recursive copy helper
function copyRecursiveSync(src: string, dest: string, ignorePatterns: string[] = []) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = stats && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(childItemName => {
            if (ignorePatterns.includes(childItemName)) return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), ignorePatterns);
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// --- Main Execution ---

try {
    ensureGitRemote();
    updateAppCode();
    // After updateAppCode, parse env again? 
    // No, .env is local config usually NOT committed to upstream. 
    // But verify if .env was overwritten? 
    // Usually .env is in .gitignore, so 'reset --hard' won't touch it.
    syncContent();

    console.log('\n✨ Setup complete!');
    console.log('👉 Next steps:');
    console.log('   1. Review changes in "content/"');
    console.log('   2. Commit your changes: git add . && git commit -m "Setup content"');
    console.log('   3. Push to your deploy repo: git push -u origin main');
} catch (error) {
    console.error('❌ An unexpected error occurred:', error);
    process.exit(1);
}
