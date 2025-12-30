'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IconLock, IconArrowRight, IconAlertCircle } from '@tabler/icons-react';
import './LaunchOverlay.css';

interface LaunchOverlayProps {
    onUnlock: () => void;
}

export default function LaunchOverlay({ onUnlock }: LaunchOverlayProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const TARGET_CODE = 'dimen2818--2020';
    // Dec 30, 2025 at 20:30 (8:30 PM)
    const TARGET_TIME = new Date('2025-12-30T20:30:00+05:30').getTime();

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = TARGET_TIME - now;

            if (difference <= 0) {
                onUnlock();
                return;
            }

            setTimeLeft({
                hours: Math.floor((difference / (1000 * 60 * 60))),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [onUnlock]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setError(false);

        // Simulate a small delay for "fancy" feel
        setTimeout(() => {
            if (code === TARGET_CODE) {
                onUnlock();
            } else {
                setError(true);
                setIsChecking(false);
            }
        }, 600);
    };

    return (
        <div className="launch-overlay">
            <div className="launch-bg-blur"></div>

            <div className="launch-content">
                <div className="launch-branding">
                    <Image
                        src="/logo-black.png"
                        alt="Dimensionless"
                        width={60}
                        height={60}
                        className="launch-logo"
                    />
                    <h1 className="launch-title">DIMENSIONLESS</h1>
                    <p className="launch-subtitle">The future of art is arriving soon.</p>
                </div>

                <div className="launch-timer">
                    <div className="timer-block">
                        <span className="timer-value">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span className="timer-label">HOURS</span>
                    </div>
                    <div className="timer-separator">:</div>
                    <div className="timer-block">
                        <span className="timer-value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span className="timer-label">MINUTES</span>
                    </div>
                    <div className="timer-separator">:</div>
                    <div className="timer-block">
                        <span className="timer-value">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span className="timer-label">SECONDS</span>
                    </div>
                </div>

                <div className="launch-lockbox">
                    <div className="lock-icon-wrapper">
                        <IconLock size={24} stroke={1.5} />
                    </div>
                    <h3>Early Access Code</h3>
                    <form onSubmit={handleSubmit} className="launch-form">
                        <div className={`input-wrapper ${error ? 'error' : ''}`}>
                            <input
                                type="text"
                                placeholder="Enter secret code..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={isChecking}
                            />
                            <button type="submit" disabled={isChecking || !code}>
                                {isChecking ? <div className="spinner"></div> : <IconArrowRight size={20} />}
                            </button>
                        </div>
                        {error && (
                            <div className="error-msg">
                                <IconAlertCircle size={16} />
                                <span>Invalid access code. Please try again.</span>
                            </div>
                        )}
                    </form>
                </div>

                <div className="launch-footer">
                    <span>Launching Dec 30, 2025 • 8:30 PM</span>
                </div>
            </div>
        </div>
    );
}
