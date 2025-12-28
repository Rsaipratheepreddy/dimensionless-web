'use client';

import AppLayout from '../components/AppLayout';
import DashboardHero from '../components/DashboardHero';
import StatsCards from '../components/StatsCards';
import ContinueSection, { CarouselItem } from '../components/ContinueSection';
import UpcomingSection from '../components/UpcomingSection';
import LessonList from '../components/LessonList';
import { HeroShimmer, CarouselShimmer } from '../components/ShimmerCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import LottieLoader from '@/components/LottieLoader';

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

            // Process CMS config
            const configMap = (data.cms || []).reduce((acc: any, curr: any) => {
                acc[curr.id] = curr;
                return acc;
            }, {});
            setCmsData(configMap);

            // Process trending items with fallback
            const processItems = (
                itemData: any[],
                configKey: string,
                mapFn: (item: any) => any
            ) => {
                const ids = configMap[configKey]?.items?.map((i: any) => i.id).filter(Boolean) || [];
                const items = itemData || [];

                if (ids.length > 0) {
                    // Filter and order by CMS config
                    return ids.map((id: string) => {
                        const item = items.find((d: any) => d.id === id);
                        return item ? mapFn(item) : null;
                    }).filter(Boolean);
                }
                // If no CMS config, return first few items
                return items.slice(0, 6).map(mapFn);
            };

            setTrendingItems({
                art: processItems(data.art, 'trending_art', (item) => ({
                    id: item.id,
                    title: item.title,
                    image: item.image_url,
                    price: item.price ? `₹${item.price.toLocaleString()}` : '',
                    artist: item.artist?.full_name,
                    artistAvatar: item.artist?.avatar_url,
                    selected_from: 'paintings'
                })),
                tattoos: processItems(data.tattoos, 'trending_tattoos', (item) => ({
                    id: item.id,
                    title: item.name,
                    image: item.image_url,
                    price: item.base_price ? `₹${item.base_price.toLocaleString()}` : '',
                    artist: 'Tattoo Art',
                    artistAvatar: '/member-names.png',
                    selected_from: 'tattoo_designs'
                })),
                leasing: processItems(data.leasing, 'art_leasing', (item) => ({
                    id: item.id,
                    title: item.title,
                    image: item.image_url,
                    price: item.monthly_rate ? `₹${item.monthly_rate}/mo` : '',
                    artist: item.artist_name,
                    artistAvatar: item.artist_avatar_url,
                    selected_from: 'leasable_paintings'
                }))
            });
        } catch (error) {
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
