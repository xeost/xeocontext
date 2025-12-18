import { SystemPageClient } from "./client";
import { getServerConfig } from "@/lib/server-utils"; // Import helper

export async function generateStaticParams() {
    try {
        const config = await getServerConfig();
        if (!config) return [{ slug: [] }];


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
