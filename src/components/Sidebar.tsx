'use client';
import './Sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
    IconHome,
    IconShoppingCart,
    IconSchool,
    IconBuilding,
    IconPencil,
    IconDiamond,
    IconSettings,
    IconInfoCircle,
    IconCoin,
    IconChevronLeft,
    IconChevronRight,
    IconLogout,
    IconMail,
    IconUsers,
    IconX
} from '@tabler/icons-react';

interface SidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mainItems = [
        { icon: IconHome, label: 'Dashboard', href: '/' },
        { icon: IconMail, label: 'Inbox', href: '/inbox' },
        { icon: IconSchool, label: 'Learning', href: '/art-classes' },
        { icon: IconShoppingCart, label: 'Shop', href: '/buy-sell-art' },
        { icon: IconUsers, label: 'Group', href: '/community' },
    ];

    const serviceItems = [
        { icon: IconBuilding, label: 'Art Leasing', href: '/art-leasing' },
        { icon: IconPencil, label: 'Tattoo Studio', href: '/tattoo-studio' },
        { icon: IconDiamond, label: 'Piercings', href: '/piercings' },
        { icon: IconCoin, label: 'Dimen Token', href: '/token' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && (
                    <Link href="/" className="sidebar-logo">
                        <Image
                            src="/logo-black.png"
                            alt="Dimensionless"
                            width={32}
                            height={32}
                            className="logo-image"
                        />
                        <span className="logo-text">Dimensionless</span>
                    </Link>
                )}
                <div className="sidebar-actions">
                    <button
                        className="collapse-btn desktop-only"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <IconChevronRight size={18} />
                        ) : (
                            <IconChevronLeft size={18} />
                        )}
                    </button>
                    <button
                        className="close-btn mobile-only"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <IconX size={20} />
                    </button>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Overview</div>
                    {mainItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/';
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Services</div>
                    {serviceItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className="sidebar-item"
                            >
                                <Icon size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="sidebar-footer">
                    <div className="nav-section-title">Settings</div>
                    <Link href="/settings" className="sidebar-item">
                        <IconSettings size={20} className="item-icon" />
                        {!isCollapsed && <span className="item-label">Settings</span>}
                    </Link>
                    <button className="sidebar-item logout-btn" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '0.875rem 1rem' }}>
                        <IconLogout size={20} className="item-icon" style={{ color: '#ef4444' }} />
                        {!isCollapsed && <span className="item-label" style={{ color: '#ef4444' }}>Logout</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
