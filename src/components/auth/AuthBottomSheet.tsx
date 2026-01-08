'use client';

import React, { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import EmailEntry from './steps/EmailEntry';
import ProfileSetup from './steps/ProfileSetup';
import InterestSelection from './steps/InterestSelection';
import CreatorOnboarding from './steps/CreatorOnboarding';
import './AuthBottomSheet.css';

type AuthView = 'email' | 'profile' | 'interests' | 'creator_onboarding';
type AuthMode = 'signin' | 'signup';

interface AuthBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

export default function AuthBottomSheet({
    isOpen,
    onClose,
    initialMode = 'signup'
}: AuthBottomSheetProps) {
    const [currentView, setCurrentView] = useState<AuthView>('email');
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
    const [email, setEmail] = useState('');

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setCurrentView('email');
            setAuthMode(initialMode);
        }
    }, [isOpen, initialMode]);

    const stepTitles: Record<AuthView, string> = {
        'email': authMode === 'signin' ? 'Welcome back!' : 'Welcome to Dimensionless',
        'profile': 'Complete your profile',
        'interests': 'What interests you?',
        'creator_onboarding': 'Professional Artist Profile'
    };

    const getStepNumber = () => {
        if (authMode === 'signin') return { current: 1, total: 1 };

        const steps: AuthView[] = ['email', 'profile', 'interests', 'creator_onboarding'];
        return {
            current: steps.indexOf(currentView) + 1,
            total: steps.length
        };
    };

    const handleEmailSubmit = (submittedEmail: string, mode: AuthMode) => {
        setEmail(submittedEmail);
        setAuthMode(mode);
        // For signup, go to profile setup
        setCurrentView('profile');
    };

    const handleAuthenticated = () => {
        // For signin, authentication is complete
        onClose();
        window.location.reload();
    };

    const handleProfileComplete = () => {
        setCurrentView('interests');
    };

    const handleInterestsComplete = (isCreator: boolean) => {
        if (isCreator) {
            setCurrentView('creator_onboarding');
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        onClose();
        window.location.reload();
    };

    const { current, total } = getStepNumber();

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={stepTitles[currentView]}
            showProgress={authMode === 'signup'}
            currentStep={current}
            totalSteps={total}
        >
            {currentView === 'email' && (
                <EmailEntry
                    onSubmit={handleEmailSubmit}
                    onAuthenticated={handleAuthenticated}
                    initialMode={authMode}
                />
            )}

            {currentView === 'profile' && (
                <ProfileSetup
                    onComplete={handleProfileComplete}
                    onSkip={handleProfileComplete}
                />
            )}

            {currentView === 'interests' && (
                <InterestSelection
                    onComplete={handleInterestsComplete}
                    onSkip={handleComplete}
                />
            )}

            {currentView === 'creator_onboarding' && (
                <CreatorOnboarding
                    onComplete={handleComplete}
                    onBack={() => setCurrentView('interests')}
                />
            )}
        </BottomSheet>
    );
}
