'use client';
import './Sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
    IconCompass,
    IconShoppingCart,
    IconBook,
    IconBuilding,
    IconCoin,
    IconUsers,
    IconPencil,
    IconDiamond,
    IconPalette,
    IconCode,
    IconSettings,
    IconHelp,
    IconBuildingStore,
    IconChevronLeft,
    IconChevronRight,
    IconCalendar
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme } = useTheme();

    const menuItems = [
        { icon: IconCompass, label: 'Discover', href: '/main' },
        { icon: IconShoppingCart, label: 'Buy Art', href: '/buy-art' },
        { icon: IconCalendar, label: 'Calendar', href: '/calendar' },
        { icon: IconBook, label: 'Learn Art', href: '/learn-art' },
        { icon: IconBuilding, label: 'Art Exhibitions', href: '/exhibitions' },
        { icon: IconCoin, label: 'Dimen Token', href: '/token' },
        { icon: IconUsers, label: 'Community', href: '/community' },
        { icon: IconPencil, label: 'Tattoos', href: '/tattoos' },
        { icon: IconDiamond, label: 'Piercings', href: '/piercings' },
        { icon: IconPalette, label: 'Graphics Design', href: '/graphics' },
        { icon: IconCode, label: 'Web-App Dev', href: '/web-dev' },
        { icon: IconSettings, label: 'Settings', href: '/settings' },
        { icon: IconHelp, label: 'Support', href: '/support' },
        { icon: IconBuildingStore, label: 'Studios', href: '/studios' },
        { icon: IconBook, label: 'Resources', href: '/resources' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && (
                    <Link href="/main" className="sidebar-logo">
                        <Image
                            src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"}
                            alt="Dimensionless"
                            width={48}
                            height={48}
                            className="logo-image"
                        />
                        <span className="logo-text">DIMENSIONLESS</span>
                    </Link>
                )}
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <IconChevronRight size={20} stroke={1.5} />
                    ) : (
                        <IconChevronLeft size={20} stroke={1.5} />
                    )}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = index === 0; // Discover is active by default
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={20} stroke={1.5} className="item-icon" />
                            {!isCollapsed && <span className="item-label">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
