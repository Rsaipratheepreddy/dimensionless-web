'use client';
import './Sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
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
    IconX,
    IconBrush,
    IconWallet,
    IconShieldCheck,
    IconPackage,
    IconUser,
    IconCalendar,
    IconTrophy,
    IconPalette
} from '@tabler/icons-react';

interface SidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const { confirm } = useModal();

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to log out from Dimensionless?',
            confirmText: 'Logout',
            type: 'danger'
        });

        if (confirmed) {
            await signOut();
            toast.success('Logged out successfully');
            router.push('/login');
        }
    };

    const mainItems = [
        { icon: IconHome, label: 'Home', href: '/' },
        { icon: IconUser, label: 'My Profile', href: `/profile/${profile?.id}` },
        { icon: IconMail, label: 'Feed', href: '/feed' },
        { icon: IconTrophy, label: 'Events', href: '/events' },
        { icon: IconBrush, label: 'Buy Art', href: '/buy-art' },
        { icon: IconShoppingCart, label: 'Shop', href: '/shop' },
        { icon: IconPackage, label: 'My Orders', href: '/orders' },
        { icon: IconWallet, label: 'Wallet', href: '/wallet' },
        { icon: IconBuilding, label: 'Art Leasing', href: '/art-leasing' },
    ];


    const artSchoolItems = [
        { icon: IconSchool, label: 'Art Classes', href: '/art-classes' },
        { icon: IconPencil, label: 'Art Courses', href: '/art-courses' },
    ];

    const serviceItems = [
        { icon: IconBuilding, label: 'Tattoo Studio', href: '/tattoos' },
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
                {profile?.role !== 'admin' && (
                    <>
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
                            <div className="nav-section-title">Art School</div>
                            {artSchoolItems.map((item, index) => {
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
                    </>
                )}

                {profile?.role === 'admin' && (
                    <div className="nav-section">
                        <div className="nav-section-title">Admin</div>
                        <Link href="/admin" className="sidebar-item">
                            <IconShieldCheck size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Admin Portal</span>}
                        </Link>
                        <Link href="/admin/settings" className="sidebar-item">
                            <IconSettings size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Platform Settings</span>}
                        </Link>
                        <Link href="/admin/leasing" className="sidebar-item">
                            <IconPackage size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Leasing Management</span>}
                        </Link>
                        <Link href="/admin/tattoos" className="sidebar-item">
                            <IconBrush size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Tattoo Management</span>}
                        </Link>
                        <Link href="/admin/tattoo-slots" className="sidebar-item">
                            <IconCalendar size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Slot Management</span>}
                        </Link>
                        <Link href="/admin/categories" className="sidebar-item">
                            <IconSettings size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Category Management</span>}
                        </Link>
                        <Link href="/admin/bookings" className="sidebar-item">
                            <IconPackage size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">All Bookings</span>}
                        </Link>
                        <Link href="/admin/classes" className="sidebar-item">
                            <IconSchool size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Class Management</span>}
                        </Link>
                        <Link href="/admin/events" className="sidebar-item">
                            <IconCalendar size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Event Management</span>}
                        </Link>
                        <Link href="/admin/cms" className="sidebar-item">
                            <IconPalette size={20} className="item-icon" />
                            {!isCollapsed && <span className="item-label">Site CMS</span>}
                        </Link>
                    </div>
                )}

                <div className="sidebar-footer">
                    <div className="nav-section-title">Settings</div>
                    <Link href="/settings" className="sidebar-item">
                        <IconSettings size={20} className="item-icon" />
                        {!isCollapsed && <span className="item-label">Settings</span>}
                    </Link>
                    <button
                        className="sidebar-item logout-btn"
                        onClick={handleLogout}
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '0.875rem 1rem' }}
                    >
                        <IconLogout size={20} className="item-icon" style={{ color: '#ef4444' }} />
                        {!isCollapsed && <span className="item-label" style={{ color: '#ef4444' }}>Logout</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
