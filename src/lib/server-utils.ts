
import fs from 'fs';
import path from 'path';
import { XeoConfig } from './types';

// Helper to determine if we are running in a serverless/edge environment where FS is restricted
const isEdge = process.env.NEXT_RUNTIME === 'edge';

export function getContentPath() {
    return path.join(process.cwd(), 'content');
}

/**
 * Tries to fetch content from the public URL.
 * Useful for Edge/Serverless deployments where 'fs' access to project root is restricted.
 */
async function fetchPublicContent(relativePath: string): Promise<string | null> {
    try {
        // In most Cloudflare/Vercel environments, we can fetch relative to the deployment origin
        // Or we might need a configured base URL.
        // For static demo purposes, the content is in '/content/' public path.

        // This is a "best effort" fallback using a heuristic base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = new URL(`/content/${relativePath}`, baseUrl).toString();

        console.log(`[Fallback] Fetching logic content from: ${url}`);
        const res = await fetch(url, { next: { revalidate: 60 } });

        if (res.ok) {
            return await res.text();
        }
    } catch (e) {
        console.error("Fetch fallback failed:", e);
    }
    return null;
}

export async function getServerConfig(): Promise<XeoConfig | null> {
    // 1. Try Filesystem (Preferred for Docker/Local)
    try {
        const configPath = path.join(getContentPath(), 'xeocontext.config.json');
        if (fs.existsSync(configPath)) {
            const fileContent = await fs.promises.readFile(configPath, 'utf-8');
            return JSON.parse(fileContent);
        }
    } catch (error) {
        // ignore fs errors
    }

    // 2. Fallback to HTTP Fetch (For Edge/Cloudflare Demos)
    const fetched = await fetchPublicContent('xeocontext.config.json');
    if (fetched) {
        try {
            return JSON.parse(fetched);
        } catch (e) {
            console.error("Failed to parse fetched config", e);
        }
    }

    console.error("Failed to load server config from both FS and Fetch.");
    return null;
}

export async function getServerContent(relativePath: string): Promise<string | null> {
    const basePath = getContentPath();
    const cleanPath = relativePath.replace(/^(\.\.(\/|\\|$))+/, ''); // Security

    // 1. Try Filesystem
    const variations = [
        path.join(basePath, cleanPath),
        path.join(basePath, `${cleanPath}.md`),
        path.join(basePath, cleanPath, 'README.md'),
        path.join(basePath, cleanPath, 'readme.md'),
        path.join(basePath, cleanPath, 'index.md')
    ];

    for (const p of variations) {
        try {
            if (fs.existsSync(p)) {
                const stats = await fs.promises.stat(p);
                if (stats.isFile()) {
                    return await fs.promises.readFile(p, 'utf-8');
                }
            }
        } catch (e) {
            // ignore
        }
    }

    // 2. Fallback to HTTP Fetch
    // Note: This heuristic is simpler, it tries the exact path and .md extension
    const fetchVariations = [
        cleanPath,
        `${cleanPath}.md`
    ];

    for (const p of fetchVariations) {
        const content = await fetchPublicContent(p);
        if (content) return content;
    }

    return null;
}
