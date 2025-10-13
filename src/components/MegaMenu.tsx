'use client';
import Link from 'next/link';
import Image from 'next/image';
import './MegaMenu.css';
import { useState, useEffect } from 'react';
import { cmsData } from '../data/cmsData';
import { useTheme } from '../contexts/ThemeContext';
import {
    IconBrush,
    IconDiamond,
    IconPalette,
    IconSchool,
    IconVideo,
    IconWall,
    IconBuildingStore,
    IconBuilding,
    IconHandFinger,
    IconHeart,
    IconPhoto,
    IconShirt,
    IconToolsKitchen2,
    IconFrame,
    IconCoin,
    IconBrandApple,
    IconPencil,
    IconRobot,
    IconTool,
    IconDeviceDesktop,
    IconBulb,
    IconWorld,
    IconCpu,
    IconShoppingCart,
    IconDeviceTablet,
    IconDeviceMobile,
    IconTemplate,
    IconBook,
    IconMessage,
    IconPlayerPlay,
    IconFileText,
    IconInfoCircle,
    IconNews,
    IconBriefcase,
    IconMail,
    IconSun,
    IconMoon,
    IconChevronDown,
    IconArrowRight,
    IconSettings,
    IconPackage,
    IconMenu2,
    IconX,
    IconChevronRight,
    IconWallet
} from '@tabler/icons-react';

export interface MegaMenuProps {
    className?: string;
    onCTAClick?: () => void;
}

interface MenuItem {
    label: string;
    type: 'link' | 'dropdown';
    link?: string;
    tabs?: Tab[];
    featured?: {
        title: string;
        description: string;
        features?: string[];
        version?: string;
    };
}

interface Tab {
    id: string;
    label: string;
    sections: Section[];
}

interface Section {
    title: string;
    items: Item[];
}

interface Item {
    name: string;
    description: string;
    link: string;
    icon?: string;
    badge?: string;
}

const iconMap: { [key: string]: React.ComponentType<{ size?: number; className?: string; stroke?: number }> } = {
    IconBrush,
    IconDiamond,
    IconPalette,
    IconSchool,
    IconVideo,
    IconWall,
    IconBuildingStore,
    IconBuilding,
    IconHandFinger,
    IconHeart,
    IconPhoto,
    IconShirt,
    IconToolsKitchen2,
    IconFrame,
    IconCoin,
    IconBrandApple,
    IconPencil,
    IconRobot,
    IconTool,
    IconDeviceDesktop,
    IconBulb,
    IconWorld,
    IconCpu,
    IconShoppingCart,
    IconDeviceTablet,
    IconDeviceMobile,
    IconTemplate,
    IconBook,
    IconMessage,
    IconPlayerPlay,
    IconFileText,
    IconInfoCircle,
    IconNews,
    IconBriefcase,
    IconMail
};

const tabIconMap: { [key: string]: React.ComponentType<{ size?: number; className?: string; stroke?: number }> } = {
    'Services': IconSettings,
    'Products': IconPackage
};

const MegaMenu: React.FC<MegaMenuProps> = ({
    className = '',
    onCTAClick
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});
    const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [menuCloseTimeout, setMenuCloseTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isClickingInMenu, setIsClickingInMenu] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Initialize default tabs (Services selected by default)
        const defaultTabs: { [key: string]: string } = {};
        cmsData.navigation.menu.forEach(menuItem => {
            if (menuItem.tabs && menuItem.tabs.length > 0) {
                defaultTabs[menuItem.label.toLowerCase().replace(/\s+/g, '-')] = menuItem.tabs[0].id;
            }
        });
        setActiveTab(defaultTabs);

        // Cleanup timeout on unmount
        return () => {
            if (menuCloseTimeout) {
                clearTimeout(menuCloseTimeout);
            }
        };
    }, [menuCloseTimeout]);

    const toggleMobileMenu = () => {
        console.log('Toggle mobile menu clicked', !isMobileMenuOpen);
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setActiveMobileMenu(null);
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = iconMap[iconName];
        return IconComponent ? <IconComponent size={20} stroke={1.5} /> : <IconBrush size={20} stroke={1.5} />;
    };

    const renderTabIcon = (tabLabel: string) => {
        const IconComponent = tabIconMap[tabLabel];
        return IconComponent ? <IconComponent size={20} stroke={1.5} /> : <IconSettings size={20} stroke={1.5} />;
    };

    const handleMenuEnter = (menuLabel: string) => {
        // Clear any pending close timeout
        if (menuCloseTimeout) {
            clearTimeout(menuCloseTimeout);
            setMenuCloseTimeout(null);
        }
        setActiveMenu(menuLabel.toLowerCase().replace(/\s+/g, '-'));
    };

    const handleMenuLeave = () => {
        // Don't close menu if user is actively clicking
        if (isClickingInMenu) {
            return;
        }

        // Set a timeout to close the menu after a delay
        const timeout = setTimeout(() => {
            if (!isClickingInMenu) {
                setActiveMenu(null);
            }
        }, 300); // Increased delay for better UX
        setMenuCloseTimeout(timeout);
    };

    const handleDropdownEnter = (menuKey: string) => {
        // Clear any pending close timeout when entering dropdown
        if (menuCloseTimeout) {
            clearTimeout(menuCloseTimeout);
            setMenuCloseTimeout(null);
        }
        setActiveMenu(menuKey);
    };

    const handleMenuItemClick = () => {
        // Set flag to prevent menu closing during click
        setIsClickingInMenu(true);

        // Reset flag after a short delay
        setTimeout(() => {
            setIsClickingInMenu(false);
        }, 500);
    };

    const handleTabClick = (menuKey: string, tabId: string) => {
        setActiveTab(prev => ({
            ...prev,
            [menuKey]: tabId
        }));
    };

    const handleMobileMenuClick = (menuLabel: string) => {
        const menuKey = menuLabel.toLowerCase().replace(/\s+/g, '-');
        setActiveMobileMenu(activeMobileMenu === menuKey ? null : menuKey);
    };

    const handleMobileTabClick = (menuKey: string, tabId: string) => {
        setActiveTab(prev => ({
            ...prev,
            [menuKey]: tabId
        }));
    };

    const renderMegaDropdown = (menuItem: MenuItem) => {
        if (!menuItem.tabs) return null;

        const menuKey = menuItem.label.toLowerCase().replace(/\s+/g, '-');
        const currentTabId = activeTab[menuKey] || menuItem.tabs[0]?.id;
        const currentTab = menuItem.tabs.find((tab: Tab) => tab.id === currentTabId);

        return (
            <div
                className="mega-dropdown"
                onMouseEnter={() => handleDropdownEnter(menuKey)}
                onMouseLeave={handleMenuLeave}
            >
                <div className="mega-content">
                    {/* Vertical Tab Navigation */}
                    {menuItem.tabs.length > 1 && (
                        <div className="mega-tabs">
                            {menuItem.tabs.map((tab: Tab) => (
                                <button
                                    key={tab.id}
                                    className={`mega-tab ${currentTabId === tab.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTabClick(menuKey, tab.id);
                                    }}
                                    onMouseEnter={(e) => e.stopPropagation()}
                                >
                                    <div className="mega-tab-icon">
                                        {renderTabIcon(tab.label)}
                                    </div>
                                    <div className="mega-tab-content">
                                        <div className="mega-tab-label">{tab.label}</div>
                                        <div className="mega-tab-description">
                                            {tab.label === 'Services' ? 'Professional services and solutions' : 'Digital products and tools'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mega-tab-content">
                        <div className="mega-sections">
                            {currentTab?.sections.map((section: Section, sectionIndex: number) => (
                                <div key={sectionIndex} className="mega-section">
                                    <h3 className="section-title">{section.title}</h3>
                                    <div className="section-items">
                                        {section.items.map((item: Item, itemIndex: number) => (
                                            <Link
                                                key={itemIndex}
                                                href={item.link}
                                                className="mega-item"
                                                onClick={handleMenuItemClick}
                                                onMouseEnter={(e) => e.stopPropagation()}
                                                onMouseDown={() => setIsClickingInMenu(true)}
                                                onMouseUp={() => setIsClickingInMenu(false)}
                                            >
                                                <div className="item-icon">
                                                    {renderIcon(item.icon || 'IconBrush')}
                                                </div>
                                                <div className="item-content">
                                                    <div className="item-header">
                                                        <span className="item-name">{item.name}</span>
                                                        {item.badge && (
                                                            <span className="item-badge">{item.badge}</span>
                                                        )}
                                                    </div>
                                                    <p className="item-description">{item.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {menuItem.featured && (
                        <div className="mega-featured-wrapper">
                            <div className="mega-featured">
                                <div className="featured-content">
                                    <h4 className="featured-title">{menuItem.featured.title}</h4>
                                    <p className="featured-description">{menuItem.featured.description}</p>
                                    {menuItem.featured.features && (
                                        <ul className="featured-list">
                                            {menuItem.featured.features.map((feature: string, index: number) => (
                                                <li key={index} className="featured-item">
                                                    <IconArrowRight size={14} stroke={1.5} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {menuItem.featured.version && (
                                        <div className="featured-version">
                                            <span className="version-text">{menuItem.featured.version}</span>
                                            <IconArrowRight size={16} stroke={1.5} className="version-arrow" />
                                        </div>
                                    )}
                                </div>
                                <div className="featured-image">
                                    <div className="video-placeholder">
                                        <IconPlayerPlay size={32} stroke={1.5} className="play-icon" />
                                        <div className="video-time">4:27</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMobileMenu = () => {
        console.log('Rendering mobile menu, isOpen:', isMobileMenuOpen);
        return (
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {cmsData.navigation.menu.map((menuItem, index) => {
                        const menuKey = menuItem.label.toLowerCase().replace(/\s+/g, '-');
                        const isActive = activeMobileMenu === menuKey;

                        return (
                            <div key={index} className="mobile-menu-item">
                                {menuItem.type === 'link' ? (
                                    <Link
                                        href={menuItem.link!}
                                        className="mobile-menu-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {menuItem.label}
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            className={`mobile-menu-trigger ${isActive ? 'active' : ''}`}
                                            onClick={() => handleMobileMenuClick(menuItem.label)}
                                        >
                                            {menuItem.label}
                                            <IconChevronRight
                                                size={16}
                                                stroke={1.5}
                                                className={`mobile-chevron ${isActive ? 'rotated' : ''}`}
                                            />
                                        </button>
                                        {isActive && menuItem.tabs && menuItem.tabs.length > 0 && (
                                            <div className="mobile-submenu">
                                                {menuItem.tabs!.map((tab: Tab) => {
                                                    const currentTabId = activeTab[menuKey] || menuItem.tabs![0]?.id;
                                                    const isTabActive = currentTabId === tab.id;

                                                    return (
                                                        <div key={tab.id} className="mobile-tab-section">
                                                            <button
                                                                className={`mobile-tab ${isTabActive ? 'active' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMobileTabClick(menuKey, tab.id);
                                                                }}
                                                            >
                                                                <div className="mobile-tab-icon">
                                                                    {renderTabIcon(tab.label)}
                                                                </div>
                                                                <div className="mobile-tab-content">
                                                                    <div className="mobile-tab-label">{tab.label}</div>
                                                                    <div className="mobile-tab-description">
                                                                        {tab.label === 'Services' ? 'Professional services and solutions' : 'Digital products and tools'}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                            {isTabActive && (
                                                                <div className="mobile-tab-items">
                                                                    {tab.sections.map((section: Section, sectionIndex: number) => (
                                                                        <div key={sectionIndex} className="mobile-section">
                                                                            <h4 className="mobile-section-title">{section.title}</h4>
                                                                            {section.items.map((item: Item, itemIndex: number) => (
                                                                                <Link
                                                                                    key={itemIndex}
                                                                                    href={item.link}
                                                                                    className="mobile-item"
                                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                                >
                                                                                    <div className="mobile-item-icon">
                                                                                        {renderIcon(item.icon || 'IconBrush')}
                                                                                    </div>
                                                                                    <div className="mobile-item-content">
                                                                                        <span className="mobile-item-name">{item.name}</span>
                                                                                        {item.badge && (
                                                                                            <span className="mobile-item-badge">{item.badge}</span>
                                                                                        )}
                                                                                        <p className="mobile-item-description">{item.description}</p>
                                                                                    </div>
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}

                    <div className="mobile-menu-actions">
                        <button className="mobile-contact-button" onClick={() => {
                            handleCTAClick();
                            setIsMobileMenuOpen(false);
                        }}>
                            <span className="button-text">{cmsData.navigation.cta.label}</span>
                            <IconArrowRight size={16} stroke={1.5} className="arrow-icon" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleCTAClick = () => {
        if (onCTAClick) {
            onCTAClick();
        } else {
            console.log(`CTA Action: ${cmsData.navigation.cta.action}`);
        }
    };

    const handleWalletConnect = () => {
        setIsWalletModalOpen(true);
    };

    const handleWalletModalClose = () => {
        setIsWalletModalOpen(false);
    };

    const handleWalletSelection = (walletType: string) => {
        console.log(`Connecting to ${walletType} wallet`);
        // Here you would integrate with actual wallet connection logic
        setIsWalletModalOpen(false);
        // Show a success message or update UI to show connected state
    };

    if (!mounted) {
        return null;
    }

    return (
        <nav className={`mega-menu theme-${theme} ${className}`}>
            <div className="mega-menu-container">
                <div className="brand-section">
                    <Link href={cmsData.navigation.brand.link} className="brand-link">
                        <div className="logo-container">
                            <Image
                                src={theme === 'dark' ? cmsData.navigation.brand.logo.dark : cmsData.navigation.brand.logo.light}
                                alt={cmsData.navigation.brand.name}
                                width={32}
                                height={32}
                                className="brand-logo"
                            />
                        </div>
                        <span className="brand-name">
                            <span className="brand-name-line">Dimensionless</span>
                            <span className="brand-name-line">Studios</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <ul className="menu-items">
                    {cmsData.navigation.menu.map((menuItem, index) => {
                        const menuKey = menuItem.label.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <li
                                key={index}
                                className={`menu-item ${menuItem.type === 'dropdown' ? 'has-dropdown' : ''}`}
                                onMouseEnter={() => menuItem.type === 'dropdown' && handleMenuEnter(menuItem.label)}
                                onMouseLeave={() => menuItem.type === 'dropdown' && handleMenuLeave()}
                            >
                                {menuItem.type === 'link' ? (
                                    <Link href={menuItem.link!} className="menu-link">
                                        {menuItem.label}
                                    </Link>
                                ) : (
                                    <>
                                        <span className="menu-trigger">
                                            {menuItem.label}
                                            <IconChevronDown size={16} stroke={1.5} className="dropdown-icon" />
                                        </span>
                                        {activeMenu === menuKey && renderMegaDropdown(menuItem)}
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="menu-actions">
                    <button
                        className="wallet-connect-button"
                        onClick={handleWalletConnect}
                        aria-label="Connect wallet"
                    >
                        <IconWallet size={20} stroke={1.5} />
                    </button>

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <IconSun size={20} stroke={1.5} />
                        ) : (
                            <IconMoon size={20} stroke={1.5} />
                        )}
                    </button>

                    {/* Desktop Contact Button */}
                    <button className="contact-button desktop-only" onClick={handleCTAClick}>
                        <span className="button-text">{cmsData.navigation.cta.label}</span>
                        <div className="button-animation">
                            <IconArrowRight size={16} stroke={1.5} className="arrow-icon" />
                        </div>
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <IconX size={24} stroke={1.5} />
                        ) : (
                            <IconMenu2 size={24} stroke={1.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {renderMobileMenu()}

            {/* Wallet Connect Modal */}
            {isWalletModalOpen && (
                <div className="wallet-modal-overlay" onClick={handleWalletModalClose}>
                    <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wallet-modal-header">
                            <h3 className="wallet-modal-title">Connect Wallet</h3>
                            <button
                                className="wallet-modal-close"
                                onClick={handleWalletModalClose}
                                aria-label="Close wallet modal"
                            >
                                <IconX size={20} stroke={1.5} />
                            </button>
                        </div>
                        <div className="wallet-modal-content">
                            <div className="wallet-options">
                                <button
                                    className="wallet-option"
                                    onClick={() => handleWalletSelection('MetaMask')}
                                >
                                    <div className="wallet-icon metamask-icon">
                                        <svg width="24" height="24" viewBox="0 0 318.6 318.6" fill="none">
                                            <path d="m274.1 35.5-99.5 73.9L193 65.8z" fill="#e2761b" stroke="#e2761b" />
                                            <path d="m44.4 35.5 98.7 74.6-17.5-44.3z" fill="#e4761b" stroke="#e4761b" />
                                            <path d="m238.3 206.8-26.5 40.6 56.7 15.6 16.3-55.3z" fill="#e4761b" stroke="#e4761b" />
                                            <path d="m33.9 207.7 16.2 55.3 56.7-15.6-26.5-40.6z" fill="#e4761b" stroke="#e4761b" />
                                        </svg>
                                    </div>
                                    <span className="wallet-name">MetaMask</span>
                                </button>
                                <button
                                    className="wallet-option"
                                    onClick={() => handleWalletSelection('Coinbase Wallet')}
                                >
                                    <div className="wallet-icon coinbase-icon">
                                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                                            <circle cx="14" cy="14" r="14" fill="#0052FF" />
                                            <path d="M14 23c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" fill="#0052FF" />
                                            <path d="M11.5 12.5h5v3h-5z" fill="white" />
                                        </svg>
                                    </div>
                                    <span className="wallet-name">Coinbase Wallet</span>
                                </button>
                                <button
                                    className="wallet-option"
                                    onClick={() => handleWalletSelection('Abstract')}
                                >
                                    <div className="wallet-icon abstract-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <rect width="24" height="24" rx="4" fill="#00FF94" />
                                            <path d="M8 8h8v8H8z" fill="white" opacity="0.8" />
                                            <path d="M10 10h4v4h-4z" fill="#00FF94" />
                                        </svg>
                                    </div>
                                    <span className="wallet-name">Abstract</span>
                                </button>
                                <button
                                    className="wallet-option"
                                    onClick={() => handleWalletSelection('WalletConnect')}
                                >
                                    <div className="wallet-icon walletconnect-icon">
                                        <svg width="24" height="24" viewBox="0 0 480 332" fill="none">
                                            <path d="M126.613 93.9842C181.563 38.6454 270.637 38.6454 325.588 93.9842L331.308 99.7568C334.074 102.548 334.074 107.006 331.308 109.797L304.632 136.667C303.249 138.063 301.056 138.063 299.673 136.667L291.696 128.647C261.069 97.7618 211.132 97.7618 180.505 128.647L172.009 137.196C170.626 138.592 168.433 138.592 167.05 137.196L140.374 110.326C137.608 107.535 137.608 103.077 140.374 100.286L126.613 93.9842ZM367.969 147.633L391.009 170.878C393.775 173.669 393.775 178.127 391.009 180.918L299.673 273.085C296.907 275.876 292.484 275.876 289.718 273.085L226.204 208.898C225.513 208.2 224.291 208.2 223.6 208.898L160.086 273.085C157.32 275.876 152.897 275.876 150.131 273.085L58.7944 180.918C56.0284 178.127 56.0284 173.669 58.7944 170.878L81.8346 147.633C84.6006 144.842 89.0238 144.842 91.7898 147.633L155.304 211.82C155.995 212.518 157.217 212.518 157.908 211.82L221.422 147.633C224.188 144.842 228.611 144.842 231.377 147.633L294.891 211.82C295.582 212.518 296.804 212.518 297.495 211.82L361.009 147.633C363.775 144.842 368.198 144.842 370.964 147.633H367.969Z" fill="#3B99FC" />
                                        </svg>
                                    </div>
                                    <span className="wallet-name">WalletConnect</span>
                                </button>
                            </div>
                            <div className="wallet-more-options">
                                <span className="more-options-text">More Wallet Options</span>
                            </div>
                            <div className="wallet-email-section">
                                <div className="email-divider">
                                    <div className="divider-line"></div>
                                    <span className="divider-text">or continue with email</span>
                                    <div className="divider-line"></div>
                                </div>
                                <button className="email-connect-button">
                                    <div className="email-button-content">
                                        <IconMail size={20} stroke={1.5} className="email-icon" />
                                        <span>Continue with email</span>
                                    </div>
                                    <IconArrowRight size={16} stroke={1.5} className="email-arrow" />
                                </button>
                            </div>
                            <p className="wallet-terms">
                                By connecting your wallet and using OpenSea, you agree to our Terms of Service & Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default MegaMenu; 