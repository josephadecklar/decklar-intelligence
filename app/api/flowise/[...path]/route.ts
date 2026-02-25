import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return handleRequest(req);
}

export async function GET(req: NextRequest) {
    return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
    const url = new URL(req.url);
    // The path is captured by [...path] and available in the URL
    // We want everything AFTER /api/flowise
    const path = url.pathname.split('/api/flowise')[1] || '';
    const searchParams = url.searchParams.toString();

    const targetUrl = `https://supplygraph-staging.decklar.com${path}${searchParams ? '?' + searchParams : ''}`;

    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${process.env.NEXT_PUBLIC_FLOWISE_API_KEY}`);
    headers.set('X-Api-Key', process.env.NEXT_PUBLIC_FLOWISE_API_KEY || '');
    headers.delete('host'); // Let fetch set the host

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.method === 'POST' ? await req.text() : undefined,
        });

        const data = await response.text();
        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('Flowise Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
    }
}
