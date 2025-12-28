'use client';
import './AppLayout.css';
import Sidebar from './Sidebar';
import Header from './Header';

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
    const pathname = usePathname();
    const { profile } = useAuth();

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const isHomePage = pathname === '/';
    const showRightSidebar = isHomePage && profile?.role !== 'admin';

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
            <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
            <div className="main-wrapper">
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
            {isMobileSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
            )}
            <InstallPWA />
        </div>
    );
};

export default AppLayout;
