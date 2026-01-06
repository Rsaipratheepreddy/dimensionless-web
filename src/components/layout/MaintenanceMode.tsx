'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IconLock, IconArrowRight, IconAlertCircle, IconSettings } from '@tabler/icons-react';
import './MaintenanceMode.css';

interface MaintenanceModeProps {
    onUnlock: () => void;
}

export default function MaintenanceMode({ onUnlock }: MaintenanceModeProps) {
    const [error, setError] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [code, setCode] = useState('');

    const TARGET_CODE = 'ajay@2818';

    const handleDismiss = () => {
        setIsClosing(true);
        setTimeout(() => {
            onUnlock();
        }, 800); // Match CSS transition time
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setError(false);

        // Simulate a small delay for premium feel
        setTimeout(() => {
            if (code === TARGET_CODE) {
                handleDismiss();
            } else {
                setError(true);
                setIsChecking(false);
                setCode('');
            }
        }, 600);
    };

    return (
        <div className={`launch-overlay ${isClosing ? 'closing' : ''}`}>
            <div className="launch-bg-blur"></div>

            <div className="launch-content">
                <div className="launch-branding">
                    <div className="maintenance-icon-badge">
                        <IconSettings size={32} stroke={1.5} className="maintenance-spin" />
                    </div>
                    <Image
                        src="/logo-black.png"
                        alt="Dimensionless"
                        width={60}
                        height={60}
                        className="launch-logo"
                    />
                    <h1 className="launch-title">SYSTEM MAINTENANCE</h1>
                    <p className="launch-subtitle">We're performing scheduled maintenance to improve your experience. We'll be back shortly.</p>
                </div>

                <div className="launch-lockbox">
                    <div className="lock-icon-wrapper">
                        <IconLock size={24} stroke={1.5} />
                    </div>
                    <h3>Developer Access</h3>
                    <form onSubmit={handleSubmit} className="launch-form">
                        <div className={`input-wrapper ${error ? 'error' : ''}`}>
                            <input
                                type="password"
                                placeholder="Enter developer code..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={isChecking}
                                autoFocus
                            />
                            <button type="submit" disabled={isChecking || !code}>
                                {isChecking ? <div className="spinner"></div> : <IconArrowRight size={20} />}
                            </button>
                        </div>
                        {error && (
                            <div className="error-msg">
                                <IconAlertCircle size={16} />
                                <span>Invalid developer code. Access denied.</span>
                            </div>
                        )}
                    </form>
                </div>

                <div className="launch-footer">
                    <span>© {new Date().getFullYear()} Dimensionless Labs • System Status: Partial Outage</span>
                </div>
            </div>
        </div>
    );
}
