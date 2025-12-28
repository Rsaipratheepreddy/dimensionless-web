'use client';
import './ActionCards.css';
import { IconPalette, IconLayoutDashboard, IconArrowRight } from '@tabler/icons-react';

const ActionCards: React.FC = () => {
    return (
        <div className="action-cards-single">
            <div className="action-card-wide gallery-card">
                <div className="card-main-content">
                    <div className="card-icon-box">
                        <IconPalette size={24} />
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Create your own Art Gallery</h3>
                        <p className="card-desc">Set up your digital space and showcase your curated collection to the community.</p>
                    </div>
                </div>
                <button className="card-action-btn">
                    Create
                </button>
            </div>
        </div>
    );
};

export default ActionCards;
