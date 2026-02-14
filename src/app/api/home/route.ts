import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 minutes

export async function GET() {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                artworks: [],
                tattoos: [],
                piercings: [],
                artClasses: [],
                error: 'Backend URL not configured'
            }, { status: 500 });
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/home`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(apiUrl, { 
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Backend returned error:', response.status);
                return NextResponse.json({
                    artworks: [],
                    tattoos: [],
                    piercings: [],
                    artClasses: [],
                    error: 'Failed to fetch home data'
                }, { status: response.status });
            }

            const data = await response.json();

            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout for home');
                return NextResponse.json({
                    artworks: [],
                    tattoos: [],
                    piercings: [],
                    artClasses: [],
                    error: 'Request timeout'
                }, { status: 504 });
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('Error in home API:', error);
        return NextResponse.json({
            artworks: [],
            tattoos: [],
            piercings: [],
            artClasses: [],
            error: 'Internal server error'
        }, { status: 500 });
    }
}
