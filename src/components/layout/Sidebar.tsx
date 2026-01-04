'use client';
import './Sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import {
    IconHome,
    IconWallet,
    IconHeart,
    IconSettings,
    IconPlus,
    IconChevronRight,
} from '@tabler/icons-react';

interface SidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
    const { user, profile, openAuthModal } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { icon: IconHome, label: 'Home', href: '/', protected: false },
        { icon: IconWallet, label: 'Wallet', href: '/wallet', protected: true },
        { icon: IconHeart, label: 'Favorites', href: '/favorites', protected: true },
        { icon: IconSettings, label: 'Card Settings', href: '/settings', protected: true },
    ];

    const handleNavClick = (e: React.MouseEvent, item: any) => {
        if (item.protected && !user) {
            e.preventDefault();
            openAuthModal('signin');
            onClose?.();
        }
    };

    return (
        <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <Link href="/">
                    <Image
                        src="/logo-black.png"
                        alt="Dimensionless"
                        width={60}
                        height={60}
                        className="logo-image"
                    />
                </Link>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-items-container">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                onClick={(e) => handleNavClick(e, item)}
                                title={item.label}
                            >
                                <Icon size={24} className="item-icon" />
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
