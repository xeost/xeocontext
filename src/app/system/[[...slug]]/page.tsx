import { SystemPageClient } from "./client";
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
    try {
        const configPath = path.join(process.cwd(), 'content/xeocontext.config.json');
        const configStr = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configStr);

        const paths: { slug: string[] }[] = [];

        if (config.navigation && Array.isArray(config.navigation)) {
            config.navigation.forEach((group: any) => {
                if (group.items && Array.isArray(group.items)) {
                    group.items.forEach((item: any) => {
                        const href = item.href;
                        if (href === '/') {
                            paths.push({ slug: [] });
                        } else {
                            // Remove leading slash and split
                            const slug = href.startsWith('/') ? href.slice(1).split('/') : href.split('/');
                            paths.push({ slug });
                        }
                    });
                }
            });
        }

        return paths.length > 0 ? paths : [{ slug: [] }];
    } catch (e) {
        console.error("Error generating static params", e);
        return [{ slug: [] }];
    }
}

export default function Page() {
    return <SystemPageClient />;
}
