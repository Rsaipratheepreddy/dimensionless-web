'use client';
import './AppLayout.css';
import Sidebar from './Sidebar';
import Header from './Header';
import CategorySidebar from './CategorySidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Header />
                <div className="content-wrapper">
                    <main className="main-content">
                        {children}
                    </main>
                    <aside className="right-sidebar">
                        <CategorySidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
