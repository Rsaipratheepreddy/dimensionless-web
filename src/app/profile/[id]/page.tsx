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
    IconEdit
} from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import './page.css';

interface ProfileData {
    id: string;
    full_name: string;
    avatar_url: string;
    background_image?: string;
    bio: string;
    created_at: string;
}

interface Post {
    id: string;
    user_id: string;
    type: 'text' | 'image' | 'poll' | 'painting';
    content: string;
    media_url?: string;
    painting_id?: string;
    created_at: string;
    paintings?: {
        title: string;
        image_url: string;
        price: number;
    };
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: profileId } = use(params);
    const { user, profile: myProfile } = useAuth();
    const [viewProfile, setViewProfile] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = user?.id === profileId;

    useEffect(() => {
        if (profileId) {
            fetchProfileData();
            fetchUserPosts();
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

    const fetchUserPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, paintings(*)')
                .eq('user_id', profileId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
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
                            <img
                                src={viewProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewProfile.full_name || 'User')}&background=5b4fe8&color=fff`}
                                alt={viewProfile.full_name || 'User'}
                                className="main-avatar"
                            />
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
                            <h1 className="profile-name">{viewProfile.full_name || 'Dimen Member'}</h1>
                            {viewProfile.bio && <p className="profile-bio-text">{viewProfile.bio}</p>}

                            <div className="profile-stats-row">
                                <div className="stat-pill">
                                    <strong>{posts.length}</strong> <span>Posts</span>
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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-feed-section">
                    <div className="section-title">Latest Activities</div>
                    <div className="posts-grid-profile">
                        {posts.length === 0 ? (
                            <div className="empty-profile-feed">
                                <p>No posts yet.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="post-card">
                                    <div className="post-header">
                                        <div className="post-user-info">
                                            <div className="poster-meta">
                                                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-content">
                                        {post.content && <p className="post-text">{post.content}</p>}
                                        {post.type === 'painting' && post.paintings && (
                                            <div className="post-painting-card">
                                                <img src={post.paintings.image_url} alt={post.paintings.title} />
                                                <div className="painting-details">
                                                    <h3>{post.paintings.title}</h3>
                                                    <p className="painting-price">₹{post.paintings.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="post-actions">
                                        <button className="action-btn"><IconHeart size={18} /> <span>Like</span></button>
                                        <button className="action-btn"><IconMessageCircle size={18} /> <span>Comment</span></button>
                                        <button className="action-btn"><IconShare size={18} /> <span>Share</span></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
