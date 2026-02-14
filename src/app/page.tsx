'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import Image from 'next/image';

interface Artwork {
    id: string;
    title: string;
    image_url?: string;
    price?: number;
}

interface Tattoo {
    id: string;
    name: string;
    image_url?: string;
    base_price?: number;
}

interface HomeData {
    artworks: Artwork[];
    tattoos: Tattoo[];
    piercings: any[];
    artClasses: any[];
}

export default function Home() {
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHomeData() {
            try {
                const response = await fetch('/api/home');
                const data = await response.json();
                setHomeData(data);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Welcome to Dimensionless
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover unique artworks, custom tattoo designs, professional piercings, and art classes
                    </p>
                </div>

                {/* Latest Artworks Section */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Latest Artworks</h2>
                        <Link
                            href="/shop"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homeData?.artworks && homeData.artworks.length > 0 ? (
                            homeData.artworks.map((artwork) => (
                                <Link
                                    key={artwork.id}
                                    href={`/shop/${artwork.id}`}
                                    className="group"
                                >
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🎨</div>
                                                <p className="text-gray-600 font-medium">{artwork.title}</p>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                {artwork.title}
                                            </h3>
                                            {artwork.price && (
                                                <p className="text-blue-600 font-bold">
                                                    ₹{Number(artwork.price).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <p className="text-gray-500">No artworks available</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Latest Tattoos Section */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Latest Tattoo Designs</h2>
                        <Link
                            href="/tattoos"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homeData?.tattoos && homeData.tattoos.length > 0 ? (
                            homeData.tattoos.map((tattoo) => (
                                <div
                                    key={tattoo.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">✨</div>
                                            <p className="text-gray-600 font-medium">{tattoo.name}</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                            {tattoo.name}
                                        </h3>
                                        {tattoo.base_price && (
                                            <p className="text-blue-600 font-bold">
                                                Starting at ₹{Number(tattoo.base_price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <p className="text-gray-500">No tattoo designs available</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Explore our collection or book a consultation today
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Browse Artworks
                        </Link>
                        <Link
                            href="/tattoos"
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            View Tattoos
                        </Link>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
