import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/utils/redis';

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

// GET /api/tattoos - Get all active tattoo designs (public) with pagination
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Pagination parameters
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Create cache key
        const cacheKey = `tattoos:${limit}:${offset}`;

        // Try cache first
        const cached = await getCached(cacheKey);
        if (cached) {
            console.log('✅ Cache hit for', cacheKey);
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            });
        }

        // Use AWS backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                tattoos: [],
                total: 0,
                limit,
                offset,
                hasMore: false,
                error: 'Backend URL not configured'
            }, { status: 500 });
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tattoos?limit=${limit}&offset=${offset}`;

        // Fetch with 30s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Backend returned error:', response.status);
                return NextResponse.json({
                    tattoos: [],
                    total: 0,
                    limit,
                    offset,
                    hasMore: false,
                    error: 'Failed to fetch tattoos'
                }, { status: response.status });
            }

            const data = await response.json();

            // Cache for 5 minutes
            await setCache(cacheKey, data, 300);
            console.log('✅ Cached', cacheKey);

            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout for tattoos');
                return NextResponse.json({
                    tattoos: [],
                    total: 0,
                    limit,
                    offset,
                    hasMore: false,
                    error: 'Request timeout'
                }, { status: 504 });
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('Error in tattoos API:', error);
        return NextResponse.json({
            tattoos: [],
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
