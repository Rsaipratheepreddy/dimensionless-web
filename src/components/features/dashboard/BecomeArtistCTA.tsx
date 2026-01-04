'use client';

import React from 'react';
import './BecomeArtistCTA.css';
import { IconPalette, IconArrowRight } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

const BecomeArtistCTA: React.FC = () => {
    const { user, profile, setShowCreatorUpgrade, openAuthModal } = useAuth();

    if (profile?.role === 'creator') return null;

    const handleAction = () => {
        if (!user) {
            openAuthModal('signup');
        } else {
            setShowCreatorUpgrade(true);
        }
    };

    return (
        <div className="become-artist-cta">
            <div className="cta-left">
                <div className="cta-icon-wrapper">
                    <IconPalette size={32} />
                </div>
                <div className="cta-content">
                    <h2 className="cta-title">Become an Artist on Dimensionless</h2>
                    <p className="cta-description">
                        Join our community of elite creators. List your masterpieces, sell to collectors,
                        and offer flexible leasing options to art lovers worldwide.
                    </p>
                </div>
            </div>
            <div className="cta-right">
                <button className="cta-button" onClick={handleAction}>
                    Start Listing Now <IconArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default BecomeArtistCTA;
