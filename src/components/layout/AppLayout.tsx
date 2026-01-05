'use client';
import './AppLayout.css';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthBottomSheet from '../auth/AuthBottomSheet';
import LaunchOverlay from './LaunchOverlay';
import Footer from './Footer';
import CreatorUpgradeModal from '../auth/CreatorUpgradeModal';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import InstallPWA from '../ui/InstallPWA';
import CategorySidebar from '../features/tattoos/CategorySidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(true); // Default true to prevent flicker on first SSR
    const [isHydrated, setIsHydrated] = useState(false);
    const pathname = usePathname();
    const { profile, showAuthModal, authModalTab, closeAuthModal } = useAuth();

    useEffect(() => {
        // Initialization on client side
        const unlockedStatus = localStorage.getItem('dimen_unlocked') === 'true';
        setIsUnlocked(unlockedStatus);
        setIsHydrated(true);
    }, []);

    const handleUnlock = () => {
        setIsUnlocked(true);
        localStorage.setItem('dimen_unlocked', 'true');
    };

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

    return (
        <div className={`app-layout ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
            {isHydrated && !isUnlocked && <LaunchOverlay onUnlock={handleUnlock} />}

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
