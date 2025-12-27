'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
import LottieLoader from '@/components/LottieLoader';

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
    user_reaction?: string | null;
    comments_count?: number;
    user_vote_option_id?: string | null;
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
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

    // Create Post State
    const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    // Interaction State
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchPosts();
                fetchUpcomingEvents();
                fetchSuggestedUsers();
            } else {
                router.push('/login');
            }
        }
    }, [user, authLoading, router]);

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

            // Fetch interaction stats for each post
            const postsWithStats = await Promise.all((postsData || []).map(async (post) => {
                // Normalize polls to be an object instead of array
                const postPolls = Array.isArray(post.polls) ? post.polls[0] : post.polls;

                const { count: likesCount } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id);

                const { data: userLikeData } = await supabase
                    .from('likes')
                    .select('user_id, reaction_type')
                    .eq('post_id', post.id)
                    .eq('user_id', user?.id)
                    .maybeSingle();

                const { count: commentsCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id);

                // Fetch user poll votes
                let userVoteOptionId = null;
                if (user && post.type === 'poll' && postPolls) {
                    const options = postPolls.poll_options || [];

                    if (options.length > 0) {
                        const { data: voteData } = await supabase
                            .from('poll_votes')
                            .select('option_id')
                            .eq('user_id', user.id)
                            .in('option_id', options.map((opt: any) => opt.id))
                            .maybeSingle();
                        userVoteOptionId = voteData?.option_id;
                    }
                }

                return {
                    ...post,
                    polls: postPolls, // Store as object
                    likes_count: likesCount || 0,
                    user_has_liked: !!userLikeData,
                    user_reaction: userLikeData?.reaction_type || null,
                    comments_count: commentsCount || 0,
                    user_vote_option_id: userVoteOptionId
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

    const fetchUpcomingEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'published')
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(3);

            if (!error && data) {
                setUpcomingEvents(data);
            }
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
        }
    };

    const fetchSuggestedUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .neq('id', user?.id)
                .limit(4);

            if (!error && data) {
                setSuggestedUsers(data);
            }
        } catch (error) {
            console.error('Error fetching suggested users:', error);
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
            setMediaPreview(null);
            setPostType('text');
            fetchPosts();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        if (!user) return;

        try {
            // Optimistically update UI
            setPosts(posts.map(post => {
                const poll = post.polls;
                if (poll && poll.id === pollId) {
                    return {
                        ...post,
                        user_vote_option_id: optionId,
                        polls: {
                            ...poll,
                            poll_options: poll.poll_options.map((opt: any) => {
                                if (opt.id === optionId) {
                                    return { ...opt, votes_count: (opt.votes_count || 0) + 1 };
                                }
                                return opt;
                            })
                        }
                    };
                }
                return post;
            }));

            const { error } = await supabase
                .from('poll_votes')
                .insert([{ user_id: user.id, option_id: optionId }]);

            if (error) throw error;

            toast.success('Vote recorded!');
        } catch (error: any) {
            console.error('Error voting:', error);
            if (error.code === '23505') {
                toast.error('You have already voted in this poll.');
            } else {
                toast.error('Failed to record vote.');
            }
        }
    };

    const toggleLike = async (postId: string, reactionType: string = 'like') => {
        if (!user) return;

        const post = posts.find(p => p.id === postId);
        const alreadyLiked = post?.user_has_liked && post?.user_reaction === reactionType;
        const differentReaction = post?.user_has_liked && post?.user_reaction !== reactionType;

        // Optimistic UI update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                let newLikesCount = p.likes_count || 0;
                if (alreadyLiked) newLikesCount--;
                else if (!p.user_has_liked) newLikesCount++;

                return {
                    ...p,
                    user_has_liked: !alreadyLiked,
                    user_reaction: alreadyLiked ? null : reactionType,
                    likes_count: newLikesCount
                };
            }
            return p;
        }));

        try {
            if (alreadyLiked) {
                await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
            } else if (differentReaction) {
                await supabase.from('likes').update({ reaction_type: reactionType }).eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('likes').insert([{ post_id: postId, user_id: user.id, reaction_type: reactionType }]);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
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

                // Send website notification
                const post = posts.find(p => p.id === postId);
                if (post && post.user_id !== user.id) {
                    await supabase.from('notifications').insert([{
                        user_id: post.user_id,
                        actor_id: user.id,
                        type: 'comment',
                        post_id: postId,
                        content: `${profile?.full_name || 'Someone'} commented on your post: "${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}"`
                    }]);
                }
            }
        } catch (error: any) {
            toast.error('Failed to post comment');
        }
    };

    return (
        <AppLayout>
            <div className="feed-container">
                <div className="feed-grid">

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
                            {postType === 'poll' && (
                                <div className="poll-creation-area">
                                    <input
                                        type="text"
                                        placeholder="Poll Question"
                                        className="poll-question-input"
                                        value={pollQuestion}
                                        onChange={(e) => setPollQuestion(e.target.value)}
                                    />
                                    <div className="poll-options-inputs">
                                        {pollOptions.map((opt, idx) => (
                                            <div key={idx} className="poll-option-input-wrapper">
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${idx + 1}`}
                                                    className="poll-option-input"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...pollOptions];
                                                        newOpts[idx] = e.target.value;
                                                        setPollOptions(newOpts);
                                                    }}
                                                />
                                                {pollOptions.length > 2 && (
                                                    <button className="remove-opt-btn" onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}>
                                                        <IconPlus size={16} style={{ transform: 'rotate(45deg)' }} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {pollOptions.length < 5 && (
                                            <button className="add-opt-btn" onClick={() => setPollOptions([...pollOptions, ''])}>
                                                <IconPlus size={16} /> Add Option
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {postType === 'image' && mediaPreview && (
                                <div className="media-preview-area">
                                    <img src={mediaPreview} alt="Preview" />
                                    <button className="remove-media-btn" onClick={() => { setMediaFile(null); setMediaPreview(null); }}>
                                        <IconPlus size={20} style={{ transform: 'rotate(45deg)' }} />
                                    </button>
                                </div>
                            )}

                            <div className="create-post-actions">
                                <label className={`action-chip ${postType === 'image' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                                    <IconPhoto size={20} /> Photo/Video
                                    <input
                                        type="file"
                                        className="hidden-file-input"
                                        accept="image/*,video/*"
                                        onChange={(e) => {
                                            setPostType('image');
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setMediaFile(file);
                                                setMediaPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                                <button className={`action-chip ${postType === 'poll' ? 'active' : ''}`} onClick={() => setPostType('poll')}>
                                    <IconChartBar size={20} /> Poll
                                </button>
                                <div className="post-actions-right">
                                    <button className="post-submit-btn" disabled={submitting} onClick={handleCreatePost}>
                                        {submitting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && <LottieLoader />}

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

                                {post.type === 'image' && post.media_url && (
                                    <div className="post-media">
                                        {post.media_url.match(/\.(mp4|webm|ogg)$/i) || post.media_url.includes('video') ? (
                                            <video src={post.media_url} controls className="post-video" />
                                        ) : (
                                            <img src={post.media_url} alt="Post content" />
                                        )}
                                    </div>
                                )}

                                {post.type === 'poll' && post.polls && (
                                    <div className="post-poll-area">
                                        <h4 className="poll-question-text">{post.polls.question}</h4>
                                        <div className="poll-options-list">
                                            {(() => {
                                                const options = post.polls?.poll_options || [];
                                                const totalVotes = options.reduce((acc: number, opt: any) => acc + (opt.votes_count || 0), 0) || 1;
                                                const hasVoted = !!post.user_vote_option_id;

                                                return options.map((option: any) => {
                                                    const percentage = Math.round(((option.votes_count || 0) / totalVotes) * 100);
                                                    const isMyVote = post.user_vote_option_id === option.id;

                                                    return (
                                                        <button
                                                            key={option.id}
                                                            className={`poll-option-btn ${isMyVote ? 'my-vote' : ''} ${hasVoted ? 'voted' : ''}`}
                                                            onClick={() => !hasVoted && post.polls && handleVote(post.polls.id, option.id)}
                                                            disabled={hasVoted}
                                                        >
                                                            <div className="option-bg" style={{ width: hasVoted ? `${percentage}%` : '0%' }}></div>
                                                            <span className="option-text">{option.option_text}</span>
                                                            {hasVoted && <span className="option-percentage">{percentage}%</span>}
                                                        </button>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <div className="poll-footer">
                                            {post.polls?.poll_options.reduce((acc: number, opt: any) => acc + (opt.votes_count || 0), 0)} votes
                                        </div>
                                    </div>
                                )}

                                {post.type === 'painting' && post.paintings && (
                                    <div className="feed-painting-card">
                                        <img src={post.paintings.image_url} alt={post.paintings.title} className="feed-painting-img" />
                                        <div className="feed-painting-info">
                                            <div className="feed-painting-details">
                                                <div className="painting-title">{post.paintings.title}</div>
                                                <div className="painting-price">₹{post.paintings.price.toLocaleString()}</div>
                                            </div>
                                            <Link href={`/shop`} className="view-art-btn">View Art</Link>
                                        </div>
                                    </div>
                                )}

                                <div className="post-actions-bar">
                                    <div className="reaction-container">
                                        <button
                                            className={`interaction-btn ${post.user_has_liked ? 'liked' : ''}`}
                                            onClick={() => toggleLike(post.id, post.user_reaction || 'like')}
                                        >
                                            <div className="reaction-display">
                                                {post.user_has_liked ? (
                                                    <span className="reaction-emoji">
                                                        {post.user_reaction === 'love' ? '❤️' :
                                                            post.user_reaction === 'celebrate' ? '👏' :
                                                                post.user_reaction === 'insightful' ? '💡' :
                                                                    post.user_reaction === 'curious' ? '😮' : '👍'}
                                                    </span>
                                                ) : <IconHeart size={24} />}
                                                <span className="reaction-label desktop-only">
                                                    {post.user_has_liked ? (
                                                        (post.user_reaction || 'like').charAt(0).toUpperCase() + (post.user_reaction || 'like').slice(1)
                                                    ) : 'Like'}
                                                </span>
                                            </div>
                                        </button>
                                        <div className="reaction-picker">
                                            <button onClick={() => toggleLike(post.id, 'like')} title="Like">👍</button>
                                            <button onClick={() => toggleLike(post.id, 'love')} title="Love">❤️</button>
                                            <button onClick={() => toggleLike(post.id, 'celebrate')} title="Celebrate">👏</button>
                                            <button onClick={() => toggleLike(post.id, 'insightful')} title="Insightful">💡</button>
                                            <button onClick={() => toggleLike(post.id, 'curious')} title="Curious">😮</button>
                                        </div>
                                    </div>
                                    <button className="interaction-btn" onClick={() => toggleComments(post.id)}>
                                        <IconMessageCircle size={24} /> <span className="desktop-only">Comment</span>
                                    </button>
                                    <button className="interaction-btn">
                                        <IconShare size={24} /> <span className="desktop-only">Share</span>
                                    </button>
                                </div>

                                <div className="post-stats">
                                    <span className="likes-count">{post.likes_count} likes</span>
                                </div>

                                <div className="post-content">
                                    {post.content && (
                                        <p>
                                            <span className="caption-username">{post.profiles.full_name}</span> {post.content}
                                        </p>
                                    )}
                                </div>

                                <button className="view-comments-btn" onClick={() => toggleComments(post.id)}>
                                    View all {post.comments_count} comments
                                </button>

                                {/* Comments Section */}
                                {activeCommentPostId === post.id && (
                                    <div className="comments-section">
                                        <div className="comments-list">
                                            {comments[post.id]?.map(comment => (
                                                <div key={comment.id} className="comment-item">
                                                    <div className="comment-content">
                                                        <span className="comment-username">{comment.profiles.full_name}</span>
                                                        <span className="comment-text">{comment.content}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="comment-input-area">
                                            <input
                                                type="text"
                                                className="comment-input"
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                            />
                                            {newComment.trim() && (
                                                <button className="comment-post-btn" onClick={() => submitComment(post.id)}>Post</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))}
                    </main>

                    {/* RIGHT SIDEBAR - EVENTS & CONTACTS */}
                    < aside className="right-sidebar" >
                        <div className="sidebar-section">
                            <div className="section-header">
                                <span className="section-title">Upcoming Events</span>
                                <Link href="/events"><IconPlus size={18} color="#94a3b8" /></Link>
                            </div>
                            <div className="menu-list">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map(event => (
                                        <Link href={`/events/${event.id}`} key={event.id} className="event-item" style={{ textDecoration: 'none' }}>
                                            <IconCalendarEvent size={24} color={event.type === 'competition' ? "#ff7675" : "#a29bfe"} />
                                            <div className="event-info">
                                                <span className="event-title">{event.title}</span>
                                                <span className="event-time">
                                                    {new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="event-item">
                                        <div className="event-info">
                                            <span className="event-title" style={{ color: '#94a3b8', fontSize: '13px' }}>No upcoming events</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <div className="section-header">
                                <span className="section-title">Who to Follow</span>
                            </div>
                            <div className="menu-list">
                                {suggestedUsers.length > 0 ? (
                                    suggestedUsers.map(suggestedUser => (
                                        <Link href={`/profile/${suggestedUser.id}`} key={suggestedUser.id} className="contact-item" style={{ textDecoration: 'none' }}>
                                            <img
                                                src={suggestedUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedUser.full_name)}`}
                                                className="contact-avatar"
                                                alt={suggestedUser.full_name}
                                            />
                                            <div className="contact-info">
                                                <span className="contact-name">{suggestedUser.full_name}</span>
                                                <span className="contact-status">{suggestedUser.role || 'User'}</span>
                                            </div>
                                            <IconUser size={16} color="#94a3b8" />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="contact-item">
                                        <div className="contact-info">
                                            <span className="contact-name" style={{ color: '#94a3b8', fontSize: '13px' }}>No users to follow</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout >
    );
}
