'use client';

import React from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import CreatorOnboarding from './steps/CreatorOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const CreatorUpgradeModal: React.FC = () => {
    const { showCreatorUpgrade, setShowCreatorUpgrade } = useAuth();

    const handleComplete = () => {
        setShowCreatorUpgrade(false);
        toast.success('Congratulations! You are now a creator on Dimensionless.');
        window.location.reload();
    };

    return (
        <BottomSheet
            isOpen={showCreatorUpgrade}
            onClose={() => setShowCreatorUpgrade(false)}
            title="Become a Creator"
        >
            <CreatorOnboarding
                onComplete={handleComplete}
                onBack={() => setShowCreatorUpgrade(false)}
            />
        </BottomSheet>
    );
};

export default CreatorUpgradeModal;
