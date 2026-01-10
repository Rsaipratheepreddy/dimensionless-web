'use client';
import React, { useState } from 'react';
import { getURL } from '@/utils/auth-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

export type AuthMode = 'signin' | 'signup';

interface EmailEntryProps {
    onSubmit: (email: string, mode: AuthMode) => void;
    onAuthenticated: () => void;
    initialMode: AuthMode;
}

export default function EmailEntry({ onSubmit, onAuthenticated, initialMode }: EmailEntryProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getURL('/auth/callback')
                }
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!password) {
            setError('Please enter your password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await signUp(email, password);
                if (error) throw error;
                onSubmit(email, mode);
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                onAuthenticated();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-step">
            <form onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="email"
                        className="auth-input"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="password"
                        className="auth-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="auth-button auth-button-primary" disabled={loading}>
                    {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>

                <div className="auth-divider">
                    <span className="auth-divider-text">or</span>
                </div>

                <button
                    type="button"
                    className="auth-button auth-button-secondary"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            disabled={loading}
                        >
                            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </span>
                </div>
            </form>
        </div>
    );
}
