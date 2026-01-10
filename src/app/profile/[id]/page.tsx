'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconMapPin,
    IconCalendar,
    IconLink,
    IconLoader2,
    IconHeart,
    IconMessageCircle,
    IconShare,
    IconUserPlus,
    IconUserCheck,
    IconBrush,
    IconDiamond,
    IconCertificate,
    IconEdit,
    IconCircleCheckFilled
} from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArtCard from '@/components/features/tattoos/ArtCard';
import './page.css';

interface ProfileData {
    id: string;
    full_name: string;
    avatar_url: string;
    background_image?: string;
    bio: string;
    created_at: string;
    role?: 'user' | 'member' | 'creator' | 'employee' | 'admin';
    awards?: any[];
    certifications?: any[];
    is_pro?: boolean;
    gallery_name?: string;
    gallery_description?: string;
    is_verified?: boolean;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: profileId } = use(params);
    const router = useRouter();
    const { user, profile: myProfile } = useAuth();
    const [viewProfile, setViewProfile] = useState<ProfileData | null>(null);
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 12;
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = user?.id === profileId;

    useEffect(() => {
        if (profileId) {
            fetchProfileData();
            fetchArtworks(true);
            checkFollowStatus();
            fetchFollowCounts();
        }
    }, [profileId, user]);

    const fetchProfileData = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();
            if (error) throw error;
            setViewProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchArtworks = async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
                setPage(0);
            } else {
                setLoadingMore(true);
            }

            const currentPage = isInitial ? 0 : page + 1;
            const from = currentPage * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('artworks')
                .select('*, artwork_images(*)')
                .eq('artist_id', profileId)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (isInitial) {
                setArtworks(data || []);
            } else {
                setArtworks(prev => [...prev, ...(data || [])]);
            }

            setHasMore((data || []).length === ITEMS_PER_PAGE);
            setPage(currentPage);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const checkFollowStatus = async () => {
        if (!user || isOwnProfile) return;
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileId)
            .single();
        setIsFollowing(!!data);
    };

    const fetchFollowCounts = async () => {
        const { count: followers } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profileId);

        const { count: following } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profileId);

        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
        setLoading(false);
    };

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error('Please sign in to follow.');
            return;
        }
        try {
            setFollowLoading(true);
            if (isFollowing) {
                await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', profileId);
                setIsFollowing(false);
                setFollowerCount(prev => prev - 1);
                toast.success('Unfollowed');
            } else {
                await supabase
                    .from('follows')
                    .insert([{ follower_id: user.id, following_id: profileId }]);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
                toast.success('Following');
            }
        } catch (error: any) {
            toast.error('Operation failed.');
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;
    if (!viewProfile) return <AppLayout><div className="error-center">Profile not found.</div></AppLayout>;

    return (
        <AppLayout>
            <div className="profile-container">
                <div className="profile-header-card">
                    <div
                        className="profile-cover"
                        style={viewProfile.background_image ? { backgroundImage: `url(${viewProfile.background_image})` } : {}}
                    ></div>
                    <div className="profile-main-info">
                        <div className="profile-avatar-row">
                            <div className="avatar-wrapper">
                                <img
                                    src={viewProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewProfile.full_name || 'User')}&background=5b4fe8&color=fff`}
                                    alt={viewProfile.full_name || 'User'}
                                    className="main-avatar"
                                />
                                {viewProfile.role === 'admin' && (
                                    <div className="verified-overlay-badge">
                                        <IconCircleCheckFilled size={28} />
                                    </div>
                                )}
                            </div>
                            <div className="profile-action-btns">
                                {isOwnProfile ? (
                                    <Link href="/settings/profile" className="edit-profile-btn">
                                        <IconEdit size={18} />
                                        <span>Edit Profile</span>
                                    </Link>
                                ) : (
                                    <button
                                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                    >
                                        {followLoading ? <IconLoader2 className="animate-spin" size={20} /> : isFollowing ? <IconUserCheck size={20} /> : <IconUserPlus size={20} />}
                                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="profile-meta-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h1 className="profile-name">{viewProfile.full_name || 'Dimen Member'}</h1>
                            </div>

                            {viewProfile.bio && <p className="profile-bio-text">{viewProfile.bio}</p>}

                            {viewProfile.role === 'creator' && (
                                <div className="creator-quick-info">
                                    {viewProfile.gallery_name && (
                                        <div className="gallery-link-info">
                                            <IconBrush size={16} />
                                            <span>Gallery: <strong>{viewProfile.gallery_name}</strong></span>
                                        </div>
                                    )}
                                    <Link href={`/gallery`} className="view-gallery-link">
                                        View Full Gallery →
                                    </Link>
                                </div>
                            )}

                            <div className="profile-stats-row">
                                <div className="stat-pill">
                                    <strong>{artworks.length}</strong> <span>Artworks</span>
                                </div>
                                <div className="stat-pill">
                                    <strong>{followerCount}</strong> <span>Followers</span>
                                </div>
                                <div className="stat-pill">
                                    <strong>{followingCount}</strong> <span>Following</span>
                                </div>
                            </div>

                            <div className="profile-details-list">
                                <div className="detail-item">
                                    <IconCalendar size={18} />
                                    <span>Joined {viewProfile.created_at ? new Date(viewProfile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                                </div>
                                {viewProfile.role === 'creator' && viewProfile.is_pro && (
                                    <div className="detail-item pro-member">
                                        <IconDiamond size={18} color="#5b4fe8" />
                                        <span style={{ color: '#5b4fe8', fontWeight: 700 }}>Pro Creator</span>
                                    </div>
                                )}
                            </div>

                            {viewProfile.role === 'creator' && (viewProfile.awards || []).length > 0 && (
                                <div className="profile-awards-section">
                                    <h3 className="section-subtitle">Awards & Recognition</h3>
                                    <div className="awards-list">
                                        {viewProfile.awards?.map((award: any, i: number) => (
                                            <div key={i} className="award-pill">
                                                <span className="award-year">{award.year}</span>
                                                <span className="award-title">{award.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewProfile.role === 'creator' && (viewProfile.certifications || []).length > 0 && (
                                <div className="profile-awards-section" style={{ marginTop: '16px' }}>
                                    <h3 className="section-subtitle">Certifications</h3>
                                    <div className="awards-list">
                                        {viewProfile.certifications?.map((cert: any, i: number) => (
                                            <div key={i} className="award-pill">
                                                <IconCertificate size={18} color="#36454F" />
                                                <div className="cert-meta">
                                                    <span className="award-title">{cert.title}</span>
                                                    <span className="cert-issuer" style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                                                        {cert.issuer} • {cert.date}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {artworks.length > 0 ? (
                    <div className="profile-catalog-section">
                        <div className="section-header">
                            <h2 className="section-title">Artwork Catalog</h2>
                            <span className="item-count">{artworks.length} items</span>
                        </div>
                        <div className="artworks-grid">
                            {artworks.map(art => (
                                <ArtCard
                                    key={art.id}
                                    id={art.id}
                                    title={art.title}
                                    image={art.artwork_images?.[0]?.image_url || '/placeholder-art.png'}
                                    price={art.purchase_price || 0}
                                    artistName={viewProfile.full_name}
                                    artistAvatar={viewProfile.avatar_url}
                                    isVerified={viewProfile.role === 'admin'}
                                    allowPurchase={!!art.purchase_price}
                                    allowLease={!!art.lease_monthly_rate}
                                    status={art.status === 'sold' ? 'sold' : 'available'}
                                    onClick={() => router.push(`/artworks/${art.id}`)}
                                />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="load-more-section">
                                <button
                                    className="load-more-btn"
                                    onClick={() => fetchArtworks()}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? <IconLoader2 className="animate-spin" size={20} /> : 'Load More Artworks'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="empty-profile-feed">
                        <p>No artworks uploaded yet.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
