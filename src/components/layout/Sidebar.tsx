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
    IconPalette,
    IconBook
} from '@tabler/icons-react';

interface SidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        overview: true,
        marketplace: false,
        mySpace: false,
        artSchool: false,
        studio: false,
        admin: false
    });

    const { user, profile, signOut, openAuthModal } = useAuth();
    const router = useRouter();
    const { confirm } = useModal();

    const toggleSection = (section: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedSections(prev => ({ ...prev, [section]: true }));
        } else {
            setExpandedSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

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
            router.push('/');
        }
    };

    const overviewItems = [
        { icon: IconHome, label: 'Home', href: '/', protected: false },
        { icon: IconMail, label: 'Feed', href: '/feed', protected: false },
        { icon: IconTrophy, label: 'Events', href: '/events', protected: false },
    ];

    const marketplaceItems = [
        { icon: IconBrush, label: 'Buy Art', href: '/buy-art', protected: false },
        { icon: IconShoppingCart, label: 'Art Gallery', href: '/shop', protected: false },
        { icon: IconBuilding, label: 'Art Leasing', href: '/art-leasing', protected: false },
    ];

    const mySpaceItems = [
        { icon: IconUser, label: 'My Profile', href: `/profile/${profile?.id}`, protected: true },
        { icon: IconPackage, label: 'My Orders', href: '/orders', protected: true },
        { icon: IconWallet, label: 'Wallet', href: '/wallet', protected: true },
    ];

    const artSchoolItems = [
        { icon: IconSchool, label: 'Art Classes', href: '/art-classes' },
        { icon: IconPencil, label: 'Art Courses', href: '/art-courses' },
    ];

    const studioItems = [
        { icon: IconBuilding, label: 'Tattoo Studio', href: '/tattoos' },
        { icon: IconDiamond, label: 'Piercings', href: '/piercings' },
        { icon: IconCoin, label: 'Dimen Token', href: '/dimen-token' },
    ];

    const handleNavClick = (e: React.MouseEvent, item: any) => {
        if (item.protected && !user) {
            e.preventDefault();
            openAuthModal('signin');
            onClose?.();
        }
    };

    const renderNavItems = (items: any[], sectionKey: string) => {
        const isExpanded = expandedSections[sectionKey];
        return (
            <div className={`nav-section-content ${isExpanded ? 'expanded' : ''}`}>
                <div>
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className="sidebar-item"
                                onClick={(e) => handleNavClick(e, item)}
                            >
                                <Icon size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

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
                            <button className="nav-section-header" onClick={() => toggleSection('overview')}>
                                <div className="header-title">
                                    <IconHome size={18} className="header-icon" />
                                    {!isCollapsed && <span>Overview</span>}
                                </div>
                                {!isCollapsed && (
                                    <IconChevronRight size={14} className={`chevron ${expandedSections.overview ? 'rotated' : ''}`} />
                                )}
                            </button>
                            {renderNavItems(overviewItems, 'overview')}
                        </div>

                        <div className="nav-section">
                            <button className="nav-section-header" onClick={() => toggleSection('marketplace')}>
                                <div className="header-title">
                                    <IconShoppingCart size={18} className="header-icon" />
                                    {!isCollapsed && <span>Marketplace</span>}
                                </div>
                                {!isCollapsed && (
                                    <IconChevronRight size={14} className={`chevron ${expandedSections.marketplace ? 'rotated' : ''}`} />
                                )}
                            </button>
                            {renderNavItems(marketplaceItems, 'marketplace')}
                        </div>

                        <div className="nav-section">
                            <button className="nav-section-header" onClick={() => toggleSection('mySpace')}>
                                <div className="header-title">
                                    <IconUser size={18} className="header-icon" />
                                    {!isCollapsed && <span>My Space</span>}
                                </div>
                                {!isCollapsed && (
                                    <IconChevronRight size={14} className={`chevron ${expandedSections.mySpace ? 'rotated' : ''}`} />
                                )}
                            </button>
                            {renderNavItems(mySpaceItems, 'mySpace')}
                        </div>

                        <div className="nav-section">
                            <button className="nav-section-header" onClick={() => toggleSection('artSchool')}>
                                <div className="header-title">
                                    <IconSchool size={18} className="header-icon" />
                                    {!isCollapsed && <span>Art School</span>}
                                </div>
                                {!isCollapsed && (
                                    <IconChevronRight size={14} className={`chevron ${expandedSections.artSchool ? 'rotated' : ''}`} />
                                )}
                            </button>
                            {renderNavItems(artSchoolItems, 'artSchool')}
                        </div>

                        <div className="nav-section">
                            <button className="nav-section-header" onClick={() => toggleSection('studio')}>
                                <div className="header-title">
                                    <IconBrush size={18} className="header-icon" />
                                    {!isCollapsed && <span>Studio & Services</span>}
                                </div>
                                {!isCollapsed && (
                                    <IconChevronRight size={14} className={`chevron ${expandedSections.studio ? 'rotated' : ''}`} />
                                )}
                            </button>
                            {renderNavItems(studioItems, 'studio')}
                        </div>
                    </>
                )}

                {profile?.role === 'admin' && (
                    <div className="nav-section">
                        <button className="nav-section-header" onClick={() => toggleSection('admin')}>
                            <div className="header-title">
                                <IconShieldCheck size={18} className="header-icon" />
                                {!isCollapsed && <span>Admin Management</span>}
                            </div>
                            {!isCollapsed && (
                                <IconChevronRight size={14} className={`chevron ${expandedSections.admin ? 'rotated' : ''}`} />
                            )}
                        </button>
                        <div className={`nav-section-content ${expandedSections.admin ? 'expanded' : ''}`}>
                            <Link href="/admin" className="sidebar-item">
                                <IconShieldCheck size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Admin Portal</span>}
                            </Link>
                            <Link href="/admin/docs" className="sidebar-item">
                                <IconBook size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Documentation</span>}
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
                                {!isCollapsed && <span className="item-label">Tattoo Slots</span>}
                            </Link>
                            <Link href="/admin/piercings" className="sidebar-item">
                                <IconDiamond size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Piercing Management</span>}
                            </Link>
                            <Link href="/admin/piercing-slots" className="sidebar-item">
                                <IconCalendar size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Piercing Slots</span>}
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
                            <Link href="/admin/tokens" className="sidebar-item">
                                <IconCoin size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Token Launch Mgmt</span>}
                            </Link>
                            <Link href="/admin/blue-chip" className="sidebar-item">
                                <IconBrush size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Blue Chip Mgmt</span>}
                            </Link>
                            <Link href="/admin/cms" className="sidebar-item">
                                <IconPalette size={20} className="item-icon" />
                                {!isCollapsed && <span className="item-label">Site CMS</span>}
                            </Link>
                        </div>
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
