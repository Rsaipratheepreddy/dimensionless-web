'use client';
import './AppLayout.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Image from 'next/image';
import AuthBottomSheet from '../auth/AuthBottomSheet';
// import MaintenanceMode from './MaintenanceMode';
import Footer from './Footer';
import CreatorUpgradeModal from '../auth/CreatorUpgradeModal';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import InstallPWA from '../ui/InstallPWA';
import CategorySidebar from '../features/tattoos/CategorySidebar';
import { IconArrowLeft, IconLogout, IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import './AdminLayout.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // const [isUnlocked, setIsUnlocked] = useState(true); // Maintenance mode disabled
    // const [isHydrated, setIsHydrated] = useState(false);
    const pathname = usePathname();
    const { profile, showAuthModal, authModalTab, closeAuthModal, signOut } = useAuth();

    // useEffect(() => {
    //     // Check if maintenance is bypassed
    //     const maintenanceBypassed = localStorage.getItem('dimen_maintenance_v1') === 'true';
    //     setIsUnlocked(maintenanceBypassed);
    //     setIsHydrated(true);
    // }, []);

    // const handleUnlock = () => {
    //     setIsUnlocked(true);
    //     localStorage.setItem('dimen_maintenance_v1', 'true');
    // };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const isHomePage = pathname === '/';
    const showRightSidebar = false; // Moved to page-specific grid for better layout control

    // Close sidebar on window resize if it's open
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMobileSidebarOpen) {
                setIsMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileSidebarOpen]);

    const isAdminPage = pathname.startsWith('/admin');
    const isAdmin = profile?.role === 'admin';
    const isEmployee = profile?.role === 'employee';
    const isStaff = isAdmin || isEmployee;
    const router = useRouter();

    // STRICT: Only allow staff to see relevant portals
    useEffect(() => {
        if (isStaff && !isAdminPage && pathname !== '/auth') {
            router.push(isAdmin ? '/admin' : '/admin/employee');
        }
    }, [isAdmin, isEmployee, isAdminPage, pathname, router]);

    // Simplify layout for staff on admin pages
    if (isStaff) {
        if (isAdminPage) {
            return (
                <div className="admin-layout-wrapper">
                    <header className="admin-nav-header">
                        <div className="admin-nav-left">
                            <Image
                                src="/logo-black.png"
                                alt="Dimen"
                                className="admin-logo"
                                width={100}
                                height={30}
                                priority
                            />
                            <div className="admin-nav-content">
                                <div className="admin-breadcrumb">
                                    <span>Platform</span>
                                    <IconSettings size={14} />
                                    <span className="current">
                                        {pathname.includes('/admin/leasing')
                                            ? 'ART SELL / LEASE'
                                            : pathname.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'DASHBOARD'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-nav-right">
                            <button onClick={() => window.location.href = '/'} className="nav-action-btn">
                                <IconArrowLeft size={18} />
                                View Site
                            </button>
                            <button onClick={() => profile ? signOut() : null} className="nav-action-btn logout">
                                <IconLogout size={18} />
                                Logout
                            </button>
                        </div>
                    </header>
                    <main className="admin-main">
                        {children}
                    </main>
                    <InstallPWA />
                </div>
            );
        } else if (pathname !== '/auth') {
            // Already redirecting via useEffect, so block rendering of customer UI
            return null;
        }
    }

    return (
        <div className={`app-layout ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
            {/* Maintenance mode disabled */}
            {/* {isHydrated && !isUnlocked && <MaintenanceMode onUnlock={handleUnlock} />} */}

            <div className="main-wrapper">
                <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
                <div className="main-container">
                    <Header onMenuClick={toggleMobileSidebar} />
                    <div className={`content-wrapper ${!showRightSidebar ? 'hide-right-sidebar' : ''}`}>
                        <main className="main-content">
                            {children}
                        </main>
                        {showRightSidebar && (
                            <aside className="right-sidebar">
                                <CategorySidebar />
                            </aside>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
            {isMobileSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
            )}
            <AuthBottomSheet
                isOpen={showAuthModal}
                onClose={closeAuthModal}
                initialMode={authModalTab}
            />
            <InstallPWA />
            <CreatorUpgradeModal />
        </div>
    );
};

export default AppLayout;
