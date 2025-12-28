'use client';

import AppLayout from '@/components/layout/AppLayout';
import DashboardHero from '@/components/features/dashboard/DashboardHero';
import StatsCards from '@/components/features/dashboard/StatsCards';
import ContinueSection, { CarouselItem } from '@/components/features/dashboard/ContinueSection';
import UpcomingSection from '@/components/features/dashboard/UpcomingSection';
import LessonList from '@/components/features/art-classes/LessonList';
import { HeroShimmer, CarouselShimmer } from '@/components/ui/ShimmerCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import LottieLoader from '@/components/ui/LottieLoader';

export default function Home() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [cmsData, setCmsData] = useState<{ [key: string]: any }>({});
    const [trendingItems, setTrendingItems] = useState<{ [key: string]: any[] }>({
        art: [],
        tattoos: [],
        leasing: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && profile?.role === 'admin') {
            router.replace('/admin');
        } else {
            fetchCMSData();
        }
    }, [profile, authLoading, router]);

    const fetchCMSData = async () => {
        try {
            const response = await fetch('/api/home-data');
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch home data');

            // Process CMS config (Mainly for Banner now)
            const configMap = (data.cms || []).reduce((acc: any, curr: any) => {
                acc[curr.id] = curr;
                return acc;
            }, {});
            setCmsData(configMap);

            // Directly map data from API bypassing CMS filtering
            setTrendingItems({
                art: (data.art || []).map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    image: item.image_url,
                    price: item.price ? `₹${item.price.toLocaleString()}` : '',
                    artist: item.artist?.full_name,
                    artistAvatar: item.artist?.avatar_url,
                    status: item.status,
                    selected_from: 'paintings'
                })),
                tattoos: (data.tattoos || []).map((item: any) => ({
                    id: item.id,
                    title: item.name,
                    image: item.image_url,
                    price: item.base_price ? `₹${item.base_price.toLocaleString()}` : '',
                    artist: 'Tattoo Art',
                    artistAvatar: '/member-names.png',
                    selected_from: 'tattoo_designs'
                })),
                leasing: (data.leasing || []).map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    image: item.image_url,
                    price: item.monthly_rate ? `₹${item.monthly_rate}/mo` : '',
                    artist: item.artist_name,
                    artistAvatar: item.artist_avatar_url,
                    selected_from: 'leasable_paintings'
                }))
            });
        } catch (error: any) {
            console.error('Unexpected error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || profile?.role === 'admin') {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="dashboard-content">
                {loading ? (
                    <>
                        <HeroShimmer />
                        <div style={{ marginBottom: '2rem' }} />
                        <CarouselShimmer />
                        <CarouselShimmer />
                        <CarouselShimmer />
                    </>
                ) : (
                    <>
                        <DashboardHero
                            slides={cmsData['home_banner']?.items}
                        />

                        <UpcomingSection />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '2rem' }}>
                            {trendingItems.art.length > 0 && (
                                <ContinueSection
                                    title={cmsData['trending_art']?.title || "Trending Art"}
                                    items={trendingItems.art}
                                    buttonText="Buy Now"
                                />
                            )}

                            {trendingItems.tattoos.length > 0 && (
                                <ContinueSection
                                    title={cmsData['trending_tattoos']?.title || "Trending Tattoos"}
                                    items={trendingItems.tattoos}
                                    showPrice={false}
                                    showAvatar={true}
                                    buttonText="Book Slot"
                                />
                            )}

                            {trendingItems.leasing.length > 0 && (
                                <ContinueSection
                                    title={cmsData['art_leasing']?.title || "Art Leasing"}
                                    items={trendingItems.leasing}
                                    buttonText="Lease"
                                />
                            )}
                        </div>

                        <LessonList />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
