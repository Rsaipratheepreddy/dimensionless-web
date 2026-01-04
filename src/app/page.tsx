'use client';

import AppLayout from '@/components/layout/AppLayout';
import HeroBanner from '@/components/features/dashboard/HeroBanner';
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
import CategorySidebar from '@/components/features/tattoos/CategorySidebar';

import DimenCoinCard from '@/components/features/dashboard/DimenCoinCard';
import BecomeArtistCTA from '@/components/features/dashboard/BecomeArtistCTA';
import ArtworkDiscovery from '@/components/features/dashboard/ArtworkDiscovery';

export default function Home() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && profile?.role === 'admin') {
            router.replace('/admin');
        }
    }, [profile, authLoading, router]);

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
                    <LottieLoader />
                ) : (
                    <>
                        <HeroBanner />
                        <BecomeArtistCTA />
                        <ArtworkDiscovery />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
