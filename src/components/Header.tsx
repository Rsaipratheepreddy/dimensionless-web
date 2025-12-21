'use client';
import './Header.css';
import { IconSearch, IconBell, IconMail, IconMenu2, IconShoppingCart } from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { itemCount } = useCart();
    const { profile } = useAuth();

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
                                <button className="header-btn notification-btn" aria-label="Notifications">
                                    <IconBell size={20} stroke={1.5} />
                                </button>
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
