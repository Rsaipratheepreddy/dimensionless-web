'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { IconSearch, IconCalendar, IconClock } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { useAuth } from '@/contexts/AuthContext';
import MyBookings from '@/components/features/dashboard/MyBookings';

interface PiercingDesign {
    id: string;
    name: string;
    description: string;
    category_id: string;
    size: string;
    estimated_duration: number;
    base_price: number;
    image_url: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    payment_status: string;
    final_price: number;
    piercing_designs: {
        name: string;
        image_url: string;
    };
}

export default function PiercingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse');
    const [designs, setDesigns] = useState<PiercingDesign[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSize, setSelectedSize] = useState('all');

    useEffect(() => {
        fetchData();
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [designsRes, categoriesRes] = await Promise.all([
                fetch('/api/piercings'),
                fetch('/api/categories?type=piercing')
            ]);

            const designsData = await designsRes.json();
            const categoriesData = await categoriesRes.json();

            setDesigns(designsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const sizes = ['all', 'Small', 'Medium', 'Large'];

    const filteredDesigns = designs.filter(design => {
        const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || design.category_id === selectedCategory;
        const matchesSize = selectedSize === 'all' || design.size === selectedSize;
        return matchesSearch && matchesCategory && matchesSize;
    });

    if (loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="piercings-page">
                <div className="piercings-header">
                    <div className="header-text">
                        <h1>Piercing Studio</h1>
                        <p>Explore our collection of unique piercing designs and book your appointment</p>
                    </div>
                    <div className="header-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
                            onClick={() => setActiveTab('browse')}
                        >
                            Browse Designs
                        </button>
                        {user && (
                            <button
                                className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                My Bookings ({bookings.length})
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === 'browse' ? (
                    <>
                        <div className="header-tools">
                            <div className="search-bar-piercing">
                                <IconSearch size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search designs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="piercings-content">
                            <div className="content-filters">
                                <button
                                    className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    All Designs
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="size-filters">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size === 'all' ? 'All Sizes' : size}
                                    </button>
                                ))}
                            </div>

                            <div className="piercings-grid">
                                {filteredDesigns.map(design => {
                                    const category = categories.find(c => c.id === design.category_id);
                                    return (
                                        <div key={design.id} className="piercing-card">
                                            <div className="piercing-image">
                                                <img src={design.image_url || '/painting.png'} alt={design.name} />
                                            </div>
                                            <div className="piercing-info">
                                                <h3 className="piercing-title">{design.name}</h3>
                                                <p className="piercing-artist">{design.description}</p>
                                                <div className="piercing-meta">
                                                    {category && (
                                                        <span className="category-tag" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                                            {category.name}
                                                        </span>
                                                    )}
                                                    <span className="size-tag">{design.size}</span>
                                                    <span className="duration-tag">{design.estimated_duration} mins</span>
                                                </div>
                                                <div className="piercing-footer">
                                                    <div className="piercing-price">₹{design.base_price.toLocaleString()}</div>
                                                    <button
                                                        className="book-btn"
                                                        onClick={() => window.location.href = `/piercings/book/${design.id}`}
                                                    >
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredDesigns.length === 0 && (
                                <div className="empty-state">
                                    <p>No designs found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <MyBookings />
                )}
            </div>
        </AppLayout>
    );
}
