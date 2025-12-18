import { promises as fs } from 'fs';
import path from 'path';
import { OpenAPIViewer } from '@/components/OpenAPIViewer';
import { notFound } from 'next/navigation';

import SwaggerParser from '@apidevtools/swagger-parser';

export const metadata = {
    title: 'OpenAPI Specification - XeoContext',
    description: 'Interactive API documentation',
};

export default async function OpenAPIPage() {
    const configPath = path.join(process.cwd(), 'content/xeocontext.config.json');
    let config;
    try {
        const fileContent = await fs.readFile(configPath, 'utf-8');
        config = JSON.parse(fileContent);
    } catch (error) {
        console.error('Failed to read config', error);
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold">Error Loading Configuration</h2>
                    <p className="text-muted-foreground">Could not read xeocontext.config.json</p>
                </div>
            </div>
        );
    }

    if (!config.openapi) {
        notFound();
    }

    // Resolve absolute path for server-side parsing
    // The config paths are relative to the content directory (content)
    const contentPath = path.join(process.cwd(), 'content');
    // config.openapi typically starts with / like /global/gateway/openapi.yaml
    const relativePath = config.openapi.startsWith('/') ? config.openapi.slice(1) : config.openapi;
    const openApiFilePath = path.join(contentPath, relativePath);

    let bundledSpec = null;
    let errorMsg = null;

    try {
        // Bundle the API definition (resolves external $refs to other files)
        bundledSpec = await SwaggerParser.bundle(openApiFilePath);
    } catch (err: any) {
        console.error("Error bundling OpenAPI spec:", err);
        errorMsg = err.message || "Unknown error bundling API specification";
    }

    if (errorMsg) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
                <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-md">
                    <h3 className="font-semibold mb-2">Failed to load OpenAPI Definition</h3>
                    <p>{errorMsg}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                    OpenAPI Specification
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Explore and test the RESTful API endpoints defined in the system architecture.
                </p>
            </div>
            <OpenAPIViewer spec={bundledSpec as Record<string, any>} />
        </div>
    );
}
