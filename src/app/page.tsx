'use client';

import AppLayout from '../components/AppLayout';
import DashboardHero from '../components/DashboardHero';
import StatsCards from '../components/StatsCards';
import ContinueSection, { CarouselItem } from '../components/ContinueSection';
import UpcomingSection from '../components/UpcomingSection';
import LessonList from '../components/LessonList';
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
            const { data, error } = await supabase.from('home_config').select('*');
            if (error) {
                console.warn('CMS data fetch notice:', error.message || error);
                setLoading(false);
                return;
            }
            const configMap = (data || []).reduce((acc: any, curr: any) => {
                acc[curr.id] = curr;
                return acc;
            }, {});

            setCmsData(configMap);
            await fetchTrendingItems(configMap);
        } catch (error) {
            console.error('Unexpected error fetching CMS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrendingItems = async (configMap: any) => {
        const fetchSection = async (id: string, table: string, select: string, mapFn: (item: any) => any) => {
            const ids = configMap[id]?.items?.map((i: any) => i.id).filter(Boolean) || [];
            if (ids.length === 0) return [];

            const { data, error } = await supabase.from(table).select(select).in('id', ids);
            if (error) {
                console.error(`Error fetching ${id}:`, error);
                return configMap[id]?.items || []; // Fallback to snapshot
            }

            const itemsData = (data as any[]) || [];

            // Maintain order of IDs as stored in CMS
            return ids.map((id: string) => {
                const item = itemsData.find(d => d.id === id);
                return item ? mapFn(item) : configMap[id]?.items?.find((i: any) => i.id === id);
            }).filter(Boolean);
        };

        const [artItems, tattooItems, leasingItems] = await Promise.all([
            fetchSection('trending_art', 'paintings', 'id, title, image_url, price, artist:profiles(full_name, avatar_url)', (item) => ({
                id: item.id,
                title: item.title,
                image: item.image_url,
                price: item.price ? `₹${item.price.toLocaleString()}` : '',
                artist: item.artist?.full_name,
                artistAvatar: item.artist?.avatar_url,
                selected_from: 'paintings'
            })),
            fetchSection('trending_tattoos', 'tattoo_designs', 'id, name, image_url, base_price', (item) => ({
                id: item.id,
                title: item.name,
                image: item.image_url,
                price: item.base_price ? `₹${item.base_price.toLocaleString()}` : '',
                artist: 'Tattoo Art', // Simplified for now as artisan join is uncertain
                artistAvatar: '/member-names.png',
                selected_from: 'tattoo_designs'
            })),
            fetchSection('art_leasing', 'leasable_paintings', 'id, title, image_url, artist_name, monthly_rate, artist_avatar_url', (item) => ({
                id: item.id,
                title: item.title,
                image: item.image_url,
                price: item.monthly_rate ? `₹${item.monthly_rate}/mo` : '',
                artist: item.artist_name,
                artistAvatar: item.artist_avatar_url,
                selected_from: 'leasable_paintings'
            }))
        ]);

        setTrendingItems({
            art: artItems,
            tattoos: tattooItems,
            leasing: leasingItems
        });
    };

    if (authLoading || profile?.role === 'admin') {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="dashboard-content">
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
            </div>
        </AppLayout>
    );
}
