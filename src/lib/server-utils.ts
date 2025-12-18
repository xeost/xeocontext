
import fs from 'fs';
import path from 'path';
import { XeoConfig } from './types';

export function getContentPath() {
    return path.join(process.cwd(), 'content');
}

export async function getServerConfig(): Promise<XeoConfig | null> {
    try {
        const configPath = path.join(getContentPath(), 'xeocontext.config.json');
        const fileContent = await fs.promises.readFile(configPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Failed to load server config:", error);
        return null;
    }
}

export async function getServerContent(relativePath: string): Promise<string | null> {
    const basePath = getContentPath();
    // Prevent directory traversal
    const cleanPath = relativePath.replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(basePath, cleanPath);

    // Heuristic: try exact, then with extensions
    const variations = [
        fullPath,
        `${fullPath}.md`,
        // If it's a directory, try readme/index
        path.join(fullPath, 'README.md'),
        path.join(fullPath, 'readme.md'),
        path.join(fullPath, 'index.md')
    ];

    for (const p of variations) {
        try {
            // Check if exists and is file
            const stats = await fs.promises.stat(p);
            if (stats.isFile()) {
                return await fs.promises.readFile(p, 'utf-8');
            }
        } catch (e) {
            // ignore
        }
    }

    return null;
}
