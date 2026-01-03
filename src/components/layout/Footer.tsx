'use client';

import React from 'react';
import {
    IconBrandTwitter,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandGithub,
    IconMail,
    IconPhone,
    IconMapPin
} from '@tabler/icons-react';
import { useTheme } from '@/contexts/ThemeContext';
import './Footer.css';

export interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();
    const [mounted, setMounted] = React.useState(false);
    const { theme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <footer className={`footer-section theme-${theme} ${className}`}>
            <div className="footer-container">
                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <span className="footer-copyright">
                            © {currentYear} Dimensionless Studio. All rights reserved.
                        </span>
                    </div>
                    <div className="footer-bottom-right">
                        <a href="/terms" className="footer-legal-link">Terms & Conditions</a>
                        <a href="/refund-policy" className="footer-legal-link">Refund Policy</a>
                        <a href="/shipping-policy" className="footer-legal-link">Shipping Policy</a>
                        <a href="/privacy-policy" className="footer-legal-link">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>

    );
};

export default Footer; 