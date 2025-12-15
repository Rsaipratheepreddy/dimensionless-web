'use client';

import AppLayout from '@/components/AppLayout';
import TopCarousel from '@/components/TopCarousel';
import UpcomingSection from '@/components/UpcomingSection';
import FeaturedCollections from '@/components/FeaturedCollections';

export default function MainPage() {
    return (
        <AppLayout>
            <TopCarousel />
            <UpcomingSection />
            <FeaturedCollections />
        </AppLayout>
    );
}
