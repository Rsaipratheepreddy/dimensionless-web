'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IconRocket, IconX } from '@tabler/icons-react';
import './MigrationNotice.css';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const MigrationNotice: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const showPopup = useCallback(() => {
        setIsOpen(true);
    }, []);

    useEffect(() => {
        // Show on first load after a short delay
        const initialTimer = setTimeout(showPopup, 3000);

        // Then every 2 minutes if not already open
        const interval = setInterval(() => {
            setIsOpen((prev) => {
                if (!prev) return true;
                return prev;
            });
        }, INTERVAL_MS);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [showPopup]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
            <div className="modal-content migration-notice-modal" onClick={e => e.stopPropagation()}>
                <div className="migration-notice-icon">
                    <IconRocket size={36} />
                </div>
                <h2>We&apos;re Upgrading!</h2>
                <p>
                    We are migrating to a new infrastructure for better performance,
                    security, and ease of use. We will notify you once it&apos;s done.
                </p>
                <button className="migration-notice-btn" onClick={() => setIsOpen(false)}>
                    Got it
                </button>
                <button className="close-btn modal-top-right" onClick={() => setIsOpen(false)}>
                    <IconX size={20} />
                </button>
            </div>
        </div>
    );
};

export default MigrationNotice;
