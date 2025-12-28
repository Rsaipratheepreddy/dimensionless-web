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
                {/* Main Footer Content */}
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo-black.png" alt="Dimensionless Studio" />
                        </div>
                        <p className="footer-description">
                            Dimensionless Studio empowers artists and entrepreneurs to transform
                            creative visions into compelling realities — making art more accessible,
                            understandable, and actionable.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Twitter">
                                <IconBrandTwitter size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <IconBrandInstagram size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <IconBrandLinkedin size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <IconBrandGithub size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="footer-column">
                        <h3 className="footer-column-title">Services</h3>
                        <ul className="footer-links">
                            <li><a href="#services">Creative Strategy</a></li>
                            <li><a href="#services">Brand Identity</a></li>
                            <li><a href="#services">Digital Art</a></li>
                            <li><a href="#services">Art Classes</a></li>
                            <li><a href="#services">Consulting</a></li>
                        </ul>
                    </div>

                    {/* Resources Section */}
                    <div className="footer-column">
                        <h3 className="footer-column-title">Resources</h3>
                        <ul className="footer-links">
                            <li><a href="#portfolio">Portfolio</a></li>
                            <li><a href="#tutorials">Tutorials</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#community">Community</a></li>
                            <li><a href="#support">Support</a></li>
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div className="footer-column">
                        <h3 className="footer-column-title">Company</h3>
                        <ul className="footer-links">
                            <li><a href="#about">About</a></li>
                            <li><a href="#team">Team</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#partners">Partners</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="footer-column">
                        <h3 className="footer-column-title">Contact</h3>
                        <div className="footer-contact">
                            <div className="contact-item">
                                <IconMail size={16} />
                                <span>hello@dimensionless.studio</span>
                            </div>
                            <div className="contact-item">
                                <IconPhone size={16} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="contact-item">
                                <IconMapPin size={16} />
                                <span>New York, NY</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <span className="footer-copyright">
                            © {currentYear} Dimensionless Studio. All rights reserved.
                        </span>
                    </div>
                    <div className="footer-bottom-right">
                        <a href="#privacy" className="footer-legal-link">Privacy Policy</a>
                        <a href="#terms" className="footer-legal-link">Terms of Service</a>
                        <a href="#cookies" className="footer-legal-link">Cookie Settings</a>
                    </div>
                </div>

                {/* DIMEN Brand Mark */}
                <div className="footer-brand-mark">
                    <span className="brand-mark">DIMEN</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 