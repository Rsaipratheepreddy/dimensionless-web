'use client';
import React, { useState, useEffect } from 'react';
import { IconX, IconShare, IconDeviceMobile } from '@tabler/icons-react';
import './InstallPWA.css';

const InstallPWA: React.FC = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);

        // Check platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Listen for beforeinstallprompt
        const handler = (e: any) => {
            e.preventDefault();
            console.log('PWA: beforeinstallprompt event fired');
            setSupportsPWA(true);
            setPromptInstall(e);

            // Show prompt after a delay if not dismissed before
            const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
            if (!isDismissed && !isStandaloneMode) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Fallback: If after 10 seconds we haven't received the event, 
        // and we aren't standalone, show the banner anyway with manual instructions 
        // to help users find the Chrome menu option.
        const fallbackTimer = setTimeout(() => {
            const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
            if (!isDismissed && !isStandaloneMode && !supportsPWA) {
                setIsVisible(true);
            }
        }, 10000);

        // For iOS, show if not standalone and not dismissed
        if (ios && !isStandaloneMode) {
            const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
            if (!isDismissed) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearTimeout(fallbackTimer);
        };
    }, []);

    const onClickInstall = async () => {
        if (!promptInstall) return;
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setPromptInstall(null);
    };

    const onDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="install-pwa-banner">
            <img src="/logo-black.png" alt="App Icon" className="install-pwa-icon" />
            <div className="install-pwa-content">
                <h4>Install Dimensionless</h4>
                <p>Install our app for a better, faster experience.</p>

                {isIOS && (
                    <div className="ios-guide-container">
                        <p className="ios-safari-note">Requires Safari browser</p>
                        <div className="ios-guide">
                            Tap <IconShare size={18} className="share-icon-pulse" /> then <strong>"Add to Home Screen"</strong>
                        </div>
                    </div>
                )}

                {!isIOS && !supportsPWA && (
                    <div className="ios-guide">
                        Tap the 3 dots (⋮) then <strong>"Install App"</strong>
                    </div>
                )}
            </div>
            <div className="install-pwa-actions">
                {!isIOS && supportsPWA && (
                    <button className="install-btn" onClick={onClickInstall}>
                        Install Now
                    </button>
                )}
                <button className="dismiss-btn" onClick={onDismiss}>
                    <IconX size={20} />
                </button>
            </div>
        </div>
    );
};

export default InstallPWA;
