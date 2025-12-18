import type { NextConfig } from "next";

import path from 'path';

const nextConfig: NextConfig = {

    // @ts-expect-error - turbo is a valid option in Next.js 16 (moved from experimental)
    turbo: {
        resolveAlias: {
            // Mock Node.js modules for client-side using an empty module
            fs: path.join(process.cwd(), 'src/empty-module.ts'),
            path: path.join(process.cwd(), 'src/empty-module.ts'),
            os: path.join(process.cwd(), 'src/empty-module.ts'),
            buffer: path.join(process.cwd(), 'src/empty-module.ts'),
            util: path.join(process.cwd(), 'src/empty-module.ts'),
        },
    },
};

export default nextConfig;
