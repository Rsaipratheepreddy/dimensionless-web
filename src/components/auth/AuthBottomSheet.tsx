'use client';

import React, { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import EmailEntry from './steps/EmailEntry';
import OTPVerification from './steps/OTPVerification';
import ProfileSetup from './steps/ProfileSetup';
import InterestSelection from './steps/InterestSelection';
import CreatorOnboarding from './steps/CreatorOnboarding';
import './AuthBottomSheet.css';

type AuthView = 'email' | 'otp' | 'profile' | 'interests' | 'creator_onboarding';
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

    const stepTitles: Record<AuthView, string> = {
        'email': authMode === 'signin' ? 'Welcome back!' : 'Welcome to Dimensionless',
        'otp': 'Verify your email',
        'profile': 'Complete your profile',
        'interests': 'What interests you?',
        'creator_onboarding': 'Professional Artist Profile'
    };

    const getStepNumber = () => {
        if (authMode === 'signin') return { current: 1, total: 1 };

        const steps: AuthView[] = ['email', 'otp', 'profile', 'interests', 'creator_onboarding'];
        return {
            current: steps.indexOf(currentView) + 1,
            total: steps.length
        };
    };

    const handleEmailSubmit = (submittedEmail: string, mode: AuthMode) => {
        setEmail(submittedEmail);
        setAuthMode(mode);
        setCurrentView('otp');
    };

    const handleOTPVerified = () => {
        if (authMode === 'signin') {
            onClose();
            window.location.reload();
        } else {
            setCurrentView('profile');
        }
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
                    initialMode={authMode}
                />
            )}

            {currentView === 'otp' && (
                <OTPVerification
                    email={email}
                    mode={authMode}
                    onVerified={handleOTPVerified}
                    onBack={() => setCurrentView('email')}
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
