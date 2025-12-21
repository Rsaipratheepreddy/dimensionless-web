'use client';
import './AppLayout.css';
import Sidebar from './Sidebar';
import Header from './Header';
import CategorySidebar from './CategorySidebar';
import { useState, useEffect } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

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
                <div className="content-wrapper">
                    <main className="main-content">
                        {children}
                    </main>
                    <aside className="right-sidebar">
                        <CategorySidebar />
                    </aside>
                </div>
            </div>
            {isMobileSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
            )}
        </div>
    );
};

export default AppLayout;
