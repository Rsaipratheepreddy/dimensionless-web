'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase';

interface ProfileSetupProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName.trim(),
                    email: user.email,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-step">
            <form onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                    Help us personalize your experience
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoFocus
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className="auth-button auth-button-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Continue'}
                </button>

                <button
                    type="button"
                    onClick={onSkip}
                    className="auth-button auth-button-secondary"
                    style={{ marginTop: '12px' }}
                    disabled={loading}
                >
                    Skip for now
                </button>
            </form>
        </div>
    );
}
