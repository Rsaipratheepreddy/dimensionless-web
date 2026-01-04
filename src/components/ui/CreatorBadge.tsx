import React from 'react';
import { IconCircleCheckFilled } from '@tabler/icons-react';

interface CreatorBadgeProps {
    isVerified?: boolean;
    name: string;
    className?: string;
    size?: number;
}

export default function CreatorBadge({
    isVerified = false,
    name,
    className = "",
    size = 20
}: CreatorBadgeProps) {
    return (
        <div className={`creator-name-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="name">{name}</span>
            {isVerified && (
                <IconCircleCheckFilled
                    size={size}
                    style={{ color: '#3b82f6' }}
                />
            )}
        </div>
    );
}
