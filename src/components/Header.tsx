'use client';
import './Header.css';
import { IconSearch, IconBell, IconMail, IconMenu2 } from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle Menu">
                        <IconMenu2 size={24} />
                    </button>
                    <div className="search-container">
                        <IconSearch size={20} stroke={1.5} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search your course...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="header-right-mobile">
                    <div className="header-actions">
                        <button className="header-btn" aria-label="Messages">
                            <IconMail size={20} stroke={1.5} />
                        </button>
                        <button className="header-btn" aria-label="Notifications">
                            <IconBell size={20} stroke={1.5} />
                        </button>

                        <div className="user-profile desktop-only">
                            <img src="/founder1.png" alt="User Avatar" className="user-avatar" />
                            <div className="user-info">
                                <span className="user-name">Jason Ranti</span>
                            </div>
                        </div>
                    </div>

                    <Link href="/" className="mobile-logo mobile-only">
                        <Image
                            src="/logo-black.png"
                            alt="Dimensionless"
                            width={32}
                            height={32}
                            className="logo-image"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
