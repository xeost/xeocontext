
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const slug = (await params).slug;
    const filePath = slug.join('/');

    // Security: Check for directory traversal attempts
    if (filePath.includes('..')) {
        return new NextResponse('Invalid path', { status: 400 });
    }

    try {
        const contentDir = path.join(process.cwd(), 'content');
        const fileAbsolutePath = path.join(contentDir, filePath);

        // Check if file exists
        if (!fs.existsSync(fileAbsolutePath)) {
            return new NextResponse('Not found', { status: 404 });
        }

        const stats = fs.statSync(fileAbsolutePath);
        if (!stats.isFile()) {
            return new NextResponse('Not a file', { status: 400 });
        }

        const fileBuffer = fs.readFileSync(fileAbsolutePath);

        // Determine content type
        let contentType = 'text/plain';
        if (filePath.endsWith('.json')) contentType = 'application/json';
        else if (filePath.endsWith('.md')) contentType = 'text/markdown';
        else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) contentType = 'text/yaml';
        else if (filePath.endsWith('.png')) contentType = 'image/png';
        else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=0, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Error serving content:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
