'use client';
import './Header.css';
import {
    IconChevronDown,
    IconPalette,
    IconBallpen,
    IconDiamond,
    IconCertificate,
    IconShoppingBag,
    IconShoppingCart,
    IconBell,
    IconCalendar,
    IconCalendarEvent,
    IconPhoto
} from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import AuthBottomSheet from '@/components/auth/AuthBottomSheet';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { profile, signOut } = useAuth();
    const { itemCount } = useCart();
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAuthSheet, setShowAuthSheet] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

    return (
        <>
            <header className="app-header">
                <div className="header-left">
                    <div className="header-logo">
                        <img src="/logo-black.png" alt="Logo" className="logo-img" />
                    </div>
                    <nav className="header-nav-bar">
                        <Link href="/" className={`header-nav-link ${pathname === '/' ? 'active' : ''}`}>
                            <IconPalette size={20} />
                            <span>Art</span>
                        </Link>
                        <Link href="/tattoos" className={`header-nav-link ${pathname === '/tattoos' ? 'active' : ''}`}>
                            <IconBallpen size={20} />
                            <span>Tattoo</span>
                        </Link>
                        <Link href="/piercings" className={`header-nav-link ${pathname === '/piercings' ? 'active' : ''}`}>
                            <IconDiamond size={20} />
                            <span>Piercings</span>
                        </Link>
                        <Link href="/art-classes" className={`header-nav-link ${pathname === '/art-classes' ? 'active' : ''}`}>
                            <IconCertificate size={20} />
                            <span>Class & Courses</span>
                        </Link>
                        {(profile?.role === 'creator' || profile?.role === 'admin') && (
                            <Link href="/gallery" className={`header-nav-link ${pathname === '/gallery' ? 'active' : ''}`}>
                                <IconPhoto size={20} />
                                <span>My Gallery</span>
                            </Link>
                        )}
                        <Link href="/events" className={`header-nav-link ${pathname === '/events' ? 'active' : ''}`}>
                            <IconCalendarEvent size={20} />
                            <span>Events</span>
                        </Link>
                        {profile && (
                            <Link href="/bookings" className={`header-nav-link ${pathname === '/bookings' ? 'active' : ''}`}>
                                <IconCalendar size={20} />
                                <span>My Bookings</span>
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="header-right">
                    {profile && (
                        <div className="header-actions">
                            <button className="action-btn">
                                <IconBell size={26} />
                            </button>
                            <Link href="/cart" className="action-btn cart-btn">
                                <IconShoppingCart size={26} />
                                {itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                )}
                            </Link>
                        </div>
                    )}

                    {profile ? (
                        <div className="user-profile-dropdown">
                            <button
                                className="profile-trigger"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <img
                                    src={profile.avatar_url || '/default-avatar.png'}
                                    alt={profile.full_name || 'User'}
                                    className="profile-avatar"
                                />
                                <span className="profile-name">{profile.full_name || 'User'}</span>
                                <IconChevronDown size={16} />
                            </button>
                            {showDropdown && (
                                <div className="profile-dropdown-menu">
                                    <button onClick={signOut} className="dropdown-item">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button
                                onClick={() => {
                                    setAuthMode('signin');
                                    setShowAuthSheet(true);
                                }}
                                className="sign-in-btn"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setAuthMode('signup');
                                    setShowAuthSheet(true);
                                }}
                                className="sign-up-btn"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <AuthBottomSheet
                isOpen={showAuthSheet}
                onClose={() => setShowAuthSheet(false)}
                initialMode={authMode}
            />
        </>
    );
};

export default Header;
