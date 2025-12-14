'use client';
import './Header.css';
import { IconSearch, IconWallet, IconSun, IconMoon, IconUser } from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const handleWalletConnect = () => {
        console.log('Connect wallet clicked');
        // Wallet connection logic will go here
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="search-container">
                    <IconSearch size={20} stroke={1.5} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search DIMENSIONLESS"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-shortcut">/</span>
                </div>

                <div className="header-actions">
                    <button
                        className="header-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <IconSun size={20} stroke={1.5} />
                        ) : (
                            <IconMoon size={20} stroke={1.5} />
                        )}
                    </button>

                    <button className="wallet-btn" onClick={handleWalletConnect}>
                        <IconWallet size={20} stroke={1.5} />
                        <span>Connect Wallet</span>
                    </button>

                    <button className="header-btn profile-btn" aria-label="Profile">
                        <IconUser size={20} stroke={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
