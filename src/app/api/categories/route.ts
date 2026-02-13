import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/utils/redis';

// Enable static generation with revalidation
export const revalidate = 600; // 10 minutes

// GET /api/categories - Get all categories (public)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'tattoo' or 'piercing'

        // Create cache key
        const cacheKey = `categories:${type || 'all'}`;

        // Try cache first
        const cached = await getCached(cacheKey);
        if (cached) {
            console.log('✅ Cache hit for', cacheKey);
            return NextResponse.json(cached);
        }

        // Use AWS backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json(
                { error: 'Backend URL not configured' },
                { status: 500 }
            );
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories${type ? `?type=${type}` : ''}`;

        // Fetch with 30s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Backend returned error for categories:', response.status);
                return NextResponse.json(
                    { error: 'Failed to fetch categories' },
                    { status: response.status }
                );
            }

            const data = await response.json();

            // Cache for 10 minutes
            await setCache(cacheKey, data, 600);
            console.log('✅ Cached', cacheKey);

            return NextResponse.json(data);
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout for categories');
                return NextResponse.json(
                    { error: 'Request timeout' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('Error in categories API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
