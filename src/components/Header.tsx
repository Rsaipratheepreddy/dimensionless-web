'use client';
import './Header.css';
import { IconSearch, IconBell, IconMail, IconMenu2, IconShoppingCart } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { itemCount } = useCart();
    const { user, profile } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Subscribe to new notifications
            const channel = supabase
                .channel('notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    fetchNotifications();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*, actor:profiles!notifications_actor_id_fkey(full_name, avatar_url)')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setNotifications(data);
    };

    const markAsRead = async () => {
        if (!user) return;
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle Menu">
                        <IconMenu2 size={24} />
                    </button>

                    <Link href="/" className="mobile-logo mobile-only">
                        <Image
                            src="/logo-black.png"
                            alt="Dimensionless"
                            width={32}
                            height={32}
                            className="logo-image"
                        />
                    </Link>

                    {profile?.role !== 'admin' && (
                        <div className="search-container">
                            <IconSearch size={20} stroke={1.5} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <div className="header-actions">
                        {profile?.role !== 'admin' && (
                            <>
                                <Link href="/cart" className="header-btn cart-btn" aria-label="Cart">
                                    <IconShoppingCart size={20} stroke={1.5} />
                                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                                </Link>
                                <button className="header-btn" aria-label="Messages">
                                    <IconMail size={20} stroke={1.5} />
                                </button>
                                <button className="header-btn notification-btn" aria-label="Notifications" onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications && unreadCount > 0) markAsRead();
                                }}>
                                    <IconBell size={20} stroke={1.5} />
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </button>

                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        <div className="dropdown-header">
                                            Notifications
                                        </div>
                                        <div className="notifications-list">
                                            {notifications.length === 0 ? (
                                                <div className="empty-notifications">No new notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
                                                        <img
                                                            src={n.actor?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.actor?.full_name || 'U')}`}
                                                            className="notification-avatar"
                                                            alt=""
                                                        />
                                                        <div className="notification-content">
                                                            <p className="notification-text">{n.content}</p>
                                                            <span className="notification-time">{new Date(n.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <Link href={`/profile/${profile?.id}`} className="user-profile">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                                alt="User Avatar"
                                className="user-avatar"
                            />
                            <div className="user-info desktop-only">
                                <span className="user-name">{profile?.full_name || "User"}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
