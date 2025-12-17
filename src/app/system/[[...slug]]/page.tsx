import { SystemPageClient } from "./client";
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
    try {
        const configPath = path.join(process.cwd(), 'public/content/xeocontext.config.json');
        const configStr = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configStr);

        const paths = config.files.systemDesign.map((file: any) => ({
            slug: [file.slug]
        }));

        return [
            { slug: [] }, // Root /system
            ...paths
        ];
    } catch (e) {
        console.error("Error generating static params", e);
        return [{ slug: [] }];
    }
}

export default function Page() {
    return <SystemPageClient />;
}
