'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    IconPhoto,
    IconChartBar,
    IconSend,
    IconLoader2,
    IconHeart,
    IconMessageCircle,
    IconShare,
    IconBrush,
    IconUser,
    IconUsers,
    IconCalendarEvent,
    IconDots,
    IconThumbUp,
    IconMessage,
    IconPlus
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
    // New fields for interactions
    likes_count?: number;
    user_has_liked?: boolean;
    comments_count?: number;
}

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

export default function FeedPage() {
    const { user, profile } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Create Post State
    const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    // Interaction State
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data: postsData, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:profiles!posts_user_id_fkey(full_name, avatar_url),
                    paintings(title, image_url, price),
                    polls(
                        id, question,
                        poll_options(id, option_text, votes_count)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch interaction stats for each post (could be optimized with a view or join counting)
            const postsWithStats = await Promise.all((postsData || []).map(async (post) => {
                const { count: likesCount } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id);

                const { data: userLike } = await supabase
                    .from('likes')
                    .select('user_id')
                    .eq('post_id', post.id)
                    .eq('user_id', user?.id)
                    .single();

                const { count: commentsCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id);

                return {
                    ...post,
                    likes_count: likesCount || 0,
                    user_has_liked: !!userLike,
                    comments_count: commentsCount || 0
                };
            }));

            setPosts(postsWithStats);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to load feed.');
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

            if (postType === 'image' && mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const filePath = `posts/${user?.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, mediaFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                mediaUrl = publicUrl;
            }

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

    const toggleLike = async (postId: string, currentLikeStatus: boolean) => {
        // Optimistic UI update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    user_has_liked: !currentLikeStatus,
                    likes_count: currentLikeStatus ? (p.likes_count || 1) - 1 : (p.likes_count || 0) + 1
                };
            }
            return p;
        }));

        try {
            if (currentLikeStatus) {
                await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user?.id);
            } else {
                await supabase.from('likes').insert([{ post_id: postId, user_id: user?.id }]);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error would be ideal here
        }
    };

    const toggleComments = async (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
            // Fetch comments
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    id, content, created_at, user_id,
                    profiles(full_name, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setComments(prev => ({ ...prev, [postId]: data as any }));
            }
        }
    };

    const submitComment = async (postId: string) => {
        if (!newComment.trim() || !user) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    user_id: user.id,
                    content: newComment
                }])
                .select(`
                    id, content, created_at, user_id,
                    profiles(full_name, avatar_url)
                `)
                .single();

            if (error) throw error;

            if (data) {
                setComments(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), data as any]
                }));
                setNewComment('');

                // Update post comment count
                setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
            }
        } catch (error: any) {
            toast.error('Failed to post comment');
        }
    };

    return (
        <AppLayout>
            <div className="feed-container">
                <div className="feed-grid">

                    {/* LEFT SIDEBAR - PROFILE & MENU */}
                    <aside className="left-sidebar">
                        <div className="profile-summary-card">
                            <div className="profile-card-header"></div>
                            <div className="profile-card-content">
                                <img
                                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                                    alt="User"
                                    className="profile-card-avatar"
                                />
                                <h3 className="profile-card-name">{profile?.full_name || 'User'}</h3>
                                <p className="profile-card-bio">{profile?.bio ? (profile.bio.length > 60 ? profile.bio.substring(0, 60) + '...' : profile.bio) : 'Welcome to Dimensionless'}</p>

                                <div className="profile-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{posts.filter(p => p.user_id === user?.id).length}</span>
                                        <span className="stat-label">Posts</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">--</span>
                                        <span className="stat-label">Following</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">--</span>
                                        <span className="stat-label">Followers</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <div className="menu-list">
                                <Link href="/feed" className="menu-item">
                                    <IconUsers size={20} /> Groups
                                </Link>
                                <Link href="/feed" className="menu-item">
                                    <IconCalendarEvent size={20} /> Events
                                </Link>
                                <Link href="/shop" className="menu-item">
                                    <IconBrush size={20} /> Marketplace
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN FEED CONTENT */}
                    <main className="feed-content">
                        {/* Create Post */}
                        <div className="create-post-card feed-card">
                            <div className="create-post-top">
                                <img
                                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                                    className="create-post-avatar"
                                    alt="Me"
                                />
                                <input
                                    type="text"
                                    placeholder={`What's on your mind, ${profile?.full_name?.split(' ')[0] || 'User'}?`}
                                    className="create-post-input"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                            <div className="create-post-actions">
                                <button className={`action-chip ${postType === 'image' ? 'active' : ''}`} onClick={() => setPostType('image')}>
                                    <IconPhoto size={20} /> Photo/Video
                                </button>
                                <button className={`action-chip ${postType === 'poll' ? 'active' : ''}`} onClick={() => setPostType('poll')} disabled>
                                    <IconChartBar size={20} /> Poll
                                </button>
                                <div className="post-actions-right">
                                    {postType === 'image' && <input type="file" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />}
                                    <button className="post-submit-btn" disabled={submitting} onClick={handleCreatePost}>
                                        {submitting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-center">
                                <IconLoader2 className="animate-spin" size={32} />
                            </div>
                        )}

                        {/* Posts List */}
                        {posts.map(post => (
                            <article key={post.id} className="post-card">
                                <div className="post-header">
                                    <div className="post-user-info">
                                        <Link href={`/profile/${post.user_id}`}>
                                            <img
                                                src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles.full_name)}&background=5b4fe8&color=fff`}
                                                alt={post.profiles.full_name}
                                                className="poster-avatar"
                                            />
                                        </Link>
                                        <div className="poster-details">
                                            <Link href={`/profile/${post.user_id}`} className="poster-name">
                                                {post.profiles.full_name}
                                            </Link>
                                            <span className="post-time">{new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <button className="more-options">
                                        <IconDots size={20} color="#94a3b8" />
                                    </button>
                                </div>

                                <div className="post-content">
                                    {post.content && <p>{post.content}</p>}
                                </div>

                                {post.type === 'image' && post.media_url && (
                                    <div className="post-media">
                                        <img src={post.media_url} alt="Post content" />
                                    </div>
                                )}

                                {post.type === 'painting' && post.paintings && (
                                    <div className="feed-painting-card">
                                        <img src={post.paintings.image_url} alt={post.paintings.title} className="feed-painting-img" />
                                        <div className="feed-painting-info">
                                            <div>
                                                <div className="painting-title">{post.paintings.title}</div>
                                                <div className="painting-price">₹{post.paintings.price.toLocaleString()}</div>
                                            </div>
                                            <Link href="/shop" className="post-submit-btn" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>View Art</Link>
                                        </div>
                                    </div>
                                )}

                                <div className="post-stats">
                                    <span>{post.likes_count} Likes</span>
                                    <span>{post.comments_count} Comments</span>
                                </div>

                                <div className="post-actions-bar">
                                    <button
                                        className={`interaction-btn ${post.user_has_liked ? 'liked' : ''}`}
                                        onClick={() => toggleLike(post.id, !!post.user_has_liked)}
                                    >
                                        <IconThumbUp size={20} /> Like
                                    </button>
                                    <button className="interaction-btn" onClick={() => toggleComments(post.id)}>
                                        <IconMessage size={20} /> Comment
                                    </button>
                                    <button className="interaction-btn">
                                        <IconShare size={20} /> Share
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPostId === post.id && (
                                    <div className="comments-section">
                                        <div className="comment-input-area">
                                            <img
                                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                                                className="comment-avatar"
                                                alt="Me"
                                            />
                                            <div className="comment-input-wrapper">
                                                <input
                                                    type="text"
                                                    className="comment-input"
                                                    placeholder="Write a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                                />
                                            </div>
                                        </div>

                                        <div className="comments-list">
                                            {comments[post.id]?.map(comment => (
                                                <div key={comment.id} className="comment-item">
                                                    <img
                                                        src={comment.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles.full_name)}&background=5b4fe8&color=fff`}
                                                        className="comment-avatar"
                                                        alt="User"
                                                    />
                                                    <div className="comment-bubble">
                                                        <Link href={`/profile/${comment.user_id}`} className="comment-author">
                                                            {comment.profiles.full_name}
                                                        </Link>
                                                        <p className="comment-text">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))}
                    </main>

                    {/* RIGHT SIDEBAR - EVENTS & CONTACTS */}
                    <aside className="right-sidebar">
                        <div className="sidebar-section">
                            <div className="section-header">
                                <span className="section-title">Upcoming Events</span>
                                <IconPlus size={18} color="#94a3b8" />
                            </div>
                            <div className="menu-list">
                                <div className="event-item">
                                    <IconCalendarEvent size={24} color="#a29bfe" />
                                    <div className="event-info">
                                        <span className="event-title">Digital Art Expo</span>
                                        <span className="event-time">Mon, Oct 24, 10:00 AM</span>
                                    </div>
                                </div>
                                <div className="event-item">
                                    <IconCalendarEvent size={24} color="#ff7675" />
                                    <div className="event-info">
                                        <span className="event-title">Live Painting</span>
                                        <span className="event-time">Fri, Oct 28, 6:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <div className="section-header">
                                <span className="section-title">Who to Follow</span>
                            </div>
                            <div className="menu-list">
                                <div className="contact-item">
                                    <img src="/founder1.png" className="contact-avatar" alt="U" onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=Ajay+S'} />
                                    <div className="contact-info">
                                        <span className="contact-name">Ajay Singh</span>
                                        <span className="contact-status">Artist</span>
                                    </div>
                                    <IconUser size={16} color="#94a3b8" />
                                </div>
                                <div className="contact-item">
                                    <img src="/founder2.png" className="contact-avatar" alt="U" onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=Priya+D'} />
                                    <div className="contact-info">
                                        <span className="contact-name">Priya Das</span>
                                        <span className="contact-status">Collector</span>
                                    </div>
                                    <IconUser size={16} color="#94a3b8" />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
