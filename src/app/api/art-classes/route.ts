import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/utils/redis';

// Enable static generation with revalidation
export const revalidate = 180; // 3 minutes

// GET /api/art-classes - Fetch published classes for users with pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const pricing = searchParams.get('pricing');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        console.log('Fetching art classes with params:', { category, pricing, limit, offset });

        // Create cache key
        const cacheKey = `art-classes:${category || 'all'}:${pricing || 'all'}:${limit}:${offset}`;

        // Try cache first
        const cached = await getCached(cacheKey);
        if (cached) {
            console.log('✅ Cache hit for', cacheKey);
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
                },
            });
        }

        // Use NestJS backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                classes: [],
                total: 0,
                limit,
                offset,
                hasMore: false
            }, { status: 500 });
        }

        const queryParams = new URLSearchParams({
            category: category || 'all',
            pricing: pricing || 'all',
            limit: limit.toString(),
            offset: offset.toString()
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/art-classes?${queryParams.toString()}`;

        // Fetch with 30s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Backend returned error for art-classes:', response.status);
                return NextResponse.json({
                    classes: [],
                    total: 0,
                    limit,
                    offset,
                    hasMore: false
                }, { status: response.status });
            }

            const data = await response.json();

            // Cache for 3 minutes
            await setCache(cacheKey, data, 180);
            console.log('✅ Cached', cacheKey);

            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
                },
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout for art-classes');
                return NextResponse.json({
                    classes: [],
                    total: 0,
                    limit,
                    offset,
                    hasMore: false,
                    error: 'Request timeout'
                }, { status: 504 });
            }
            throw fetchError;
        }

    } catch (error: any) {
        console.error('Unexpected error in art-classes API:', error);
        return NextResponse.json({
            classes: [],
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false
        }, { status: 500 });
    }
}
