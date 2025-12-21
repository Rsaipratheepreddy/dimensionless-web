'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    IconPhoto,
    IconChartBar,
    IconPencil,
    IconSend,
    IconLoader2,
    IconHeart,
    IconMessageCircle,
    IconShare,
    IconPlus,
    IconCheck,
    IconX,
    IconBrush
} from '@tabler/icons-react';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import './page.css';

interface Post {
    id: string;
    user_id: string;
    type: 'text' | 'image' | 'poll' | 'painting';
    content: string;
    media_url?: string;
    painting_id?: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
    paintings?: {
        title: string;
        image_url: string;
        price: number;
    };
    polls?: {
        id: string;
        question: string;
        poll_options: {
            id: string;
            option_text: string;
            votes_count: number;
        }[];
    };
}

export default function FeedPage() {
    const { user, profile } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

    // Create Post State
    const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user, activeTab]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    profiles(full_name, avatar_url),
                    paintings(title, image_url, price),
                    polls(
                        id, question,
                        poll_options(id, option_text, votes_count)
                    )
                `)
                .order('created_at', { ascending: false });

            // If "following" tab, filter by follower_id (future implementation)

            const { data, error } = await query;
            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) {
            toast.error('Failed to load feed.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && postType === 'text') return;

        try {
            setSubmitting(true);
            let mediaUrl = '';

            // Handle Image Upload
            if (postType === 'image' && mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const filePath = `posts/${user?.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, mediaFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                mediaUrl = publicUrl;
            }

            // Insert Post
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .insert([{
                    user_id: user?.id,
                    type: postType,
                    content: content,
                    media_url: mediaUrl,
                }])
                .select()
                .single();

            if (postError) throw postError;

            // Handle Poll
            if (postType === 'poll' && postData) {
                const { data: pollData, error: pollError } = await supabase
                    .from('polls')
                    .insert([{ post_id: postData.id, question: pollQuestion }])
                    .select()
                    .single();

                if (pollError) throw pollError;

                const optionsToInsert = pollOptions
                    .filter(opt => opt.trim())
                    .map(opt => ({ poll_id: pollData.id, option_text: opt }));

                const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);
                if (optionsError) throw optionsError;
            }

            toast.success('Post created!');
            setContent('');
            setPollQuestion('');
            setPollOptions(['', '']);
            setMediaFile(null);
            fetchPosts();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="feed-container">
                <div className="feed-main">
                    <div className="feed-tabs">
                        <button
                            className={`feed-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            Explore
                        </button>
                        <button
                            className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
                            onClick={() => setActiveTab('following')}
                        >
                            Following
                        </button>
                    </div>

                    {/* Create Post Card */}
                    <div className="create-post-card">
                        <div className="create-post-header">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                                alt="Me"
                                className="creator-avatarSmall"
                            />
                            <div className="create-post-types">
                                <button onClick={() => setPostType('text')} className={postType === 'text' ? 'active' : ''}>
                                    <IconPencil size={18} /> <span>Text</span>
                                </button>
                                <button onClick={() => setPostType('image')} className={postType === 'image' ? 'active' : ''}>
                                    <IconPhoto size={18} /> <span>Image</span>
                                </button>
                                <button onClick={() => setPostType('poll')} className={postType === 'poll' ? 'active' : ''} disabled>
                                    <IconChartBar size={18} /> <span>Poll</span>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreatePost} className="create-post-form">
                            <textarea
                                placeholder={postType === 'text' ? "What's on your mind?" : "Title for your post..."}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={3}
                            />

                            {postType === 'image' && (
                                <div className="media-upload-zone">
                                    <input type="file" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
                                    {mediaFile && <p>Selected: {mediaFile.name}</p>}
                                </div>
                            )}

                            <div className="create-post-footer">
                                <button type="submit" className="post-send-btn" disabled={submitting}>
                                    {submitting ? <IconLoader2 className="animate-spin" size={20} /> : <IconSend size={20} />}
                                    <span>Post</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feed Posts */}
                    <div className="posts-list">
                        {loading ? (
                            <div className="feed-loading">
                                <IconLoader2 className="animate-spin" size={40} />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="empty-feed">
                                <p>No posts yet. Be the first to start the conversation!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className={`post-card type-${post.type}`}>
                                    <div className="post-header">
                                        <div className="post-user-info">
                                            <Link href={`/profile/${post.user_id}`}>
                                                <img
                                                    src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles.full_name)}&background=5b4fe8&color=fff`}
                                                    alt={post.profiles.full_name}
                                                    className="poster-avatar"
                                                />
                                            </Link>
                                            <div className="poster-meta">
                                                <Link href={`/profile/${post.user_id}`} className="poster-name">
                                                    {post.profiles.full_name}
                                                </Link>
                                                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {post.type === 'painting' && <div className="post-category-badge"><IconBrush size={14} /> New Artwork</div>}
                                    </div>

                                    <div className="post-content">
                                        {post.content && <p className="post-text">{post.content}</p>}

                                        {post.type === 'image' && post.media_url && (
                                            <div className="post-media">
                                                <img src={post.media_url} alt="Post content" />
                                            </div>
                                        )}

                                        {post.type === 'painting' && post.paintings && (
                                            <div className="post-painting-card">
                                                <div className="painting-img-container">
                                                    <img src={post.paintings.image_url} alt={post.paintings.title} />
                                                </div>
                                                <div className="painting-details">
                                                    <h3>{post.paintings.title}</h3>
                                                    <p className="painting-price">₹{post.paintings.price.toLocaleString()}</p>
                                                    <button className="view-artwork-btn">View Artwork</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="post-actions">
                                        <button className="action-btn"><IconHeart size={20} /> <span>Like</span></button>
                                        <button className="action-btn"><IconMessageCircle size={20} /> <span>Comment</span></button>
                                        <button className="action-btn"><IconShare size={20} /> <span>Share</span></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Feed Sidebar (Social Recommendations) */}
                <div className="feed-sidebar desktop-only">
                    <div className="trending-card">
                        <h3>Who to Follow</h3>
                        <div className="follow-suggestions">
                            <div className="suggested-user">
                                <img src="/founder1.png" alt="User" />
                                <div className="user-info">
                                    <span>Ajay Singh</span>
                                    <p>Surrealist Artist</p>
                                </div>
                                <button className="follow-mini-btn">Follow</button>
                            </div>
                            <div className="suggested-user">
                                <img src="/founder2.png" alt="User" />
                                <div className="user-info">
                                    <span>Priya Das</span>
                                    <p>Digital Creator</p>
                                </div>
                                <button className="follow-mini-btn">Follow</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
