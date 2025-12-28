import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/home-data - Aggregate data for the home page
export async function GET() {
    try {
        const supabase = await createClient();

        console.log('Fetching consolidated home page data...');

        // Fetch everything in parallel for maximum performance
        const [
            cmsResult,
            artResult,
            tattooResult,
            leasingResult
        ] = await Promise.all([
            supabase.from('home_config').select('*'),
            supabase.from('paintings').select('id, title, image_url, price, artist:profiles(full_name, avatar_url)').limit(10),
            supabase.from('tattoo_designs').select('id, name, image_url, base_price').limit(10),
            supabase.from('leasable_paintings').select('id, title, image_url, artist_name, monthly_rate, artist_avatar_url').limit(10)
        ]);

        if (cmsResult.error) throw cmsResult.error;

        const data = {
            cms: cmsResult.data || [],
            art: artResult.data || [],
            tattoos: tattooResult.data || [],
            leasing: leasingResult.data || []
        };

        console.log(`Successfully fetched home data. CMS records: ${data.cms.length}`);

        // Return with 60s cache headers for public CDN/browser caching
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error: any) {
        console.error('Error fetching home data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
