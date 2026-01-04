'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase-client';
export type AuthMode = 'signin' | 'signup';

interface OTPVerificationProps {
    email: string;
    mode: AuthMode;
    onVerified: () => void;
    onBack: () => void;
}

export default function OTPVerification({ email, mode, onVerified, onBack }: OTPVerificationProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const supabase = createClient();

    useEffect(() => {
        // Send OTP on mount
        sendOTP();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const sendOTP = async () => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: mode === 'signup'
                }
            });

            if (error) throw error;
            setResendTimer(30);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        }
    };

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[0];
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (newOtp.every(digit => digit !== '') && index === 5) {
            verifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');

        setOtp(newOtp);

        if (pastedData.length === 6) {
            verifyOTP(pastedData);
        }
    };

    const verifyOTP = async (otpCode: string) => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'email'
            });

            if (error) throw error;

            onVerified();
        } catch (err: any) {
            setError(err.message || 'Invalid OTP code');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-step">
            <button className="auth-back-button" onClick={onBack}>
                ← Back
            </button>

            {error && <div className="auth-error">{error}</div>}

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="auth-input"
                        style={{
                            width: '48px',
                            height: '56px',
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}
                        disabled={loading}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                {resendTimer > 0 ? (
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                        Resend code in {resendTimer}s
                    </p>
                ) : (
                    <button
                        type="button"
                        className="auth-link"
                        onClick={sendOTP}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '14px' }}
                    >
                        Resend code
                    </button>
                )}
            </div>
        </div>
    );
}
