'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IconBrandGoogle, IconEye, IconEyeOff, IconX } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import './AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'signin' | 'signup';
    onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin', onSuccess }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
    const [view, setView] = useState<'auth' | 'forgot-password'>('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, resetPassword } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (view === 'forgot-password') {
                const { error } = await resetPassword(email);
                if (error) {
                    toast.error(error.message);
                } else {
                    toast.success('Password reset link sent! Please check your email.');
                    setView('auth');
                }
                return;
            }

            if (activeTab === 'signin') {
                const { error } = await signIn(email, password);
                if (error) {
                    toast.error(error.message);
                } else {
                    toast.success('Welcome back!');
                    onClose();
                    onSuccess?.();
                }
            } else {
                const { error } = await signUp(email, password, fullName);
                if (error) {
                    toast.error(error.message);
                } else {
                    toast.success('Account created! Please check your email to verify.');
                    onClose();
                    onSuccess?.();
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setShowPassword(false);
    };

    const handleTabChange = (tab: 'signin' | 'signup') => {
        setActiveTab(tab);
        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="auth-modal-overlay" onClick={handleClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={handleClose}>
                    <IconX size={24} />
                </button>

                <div className="auth-modal-header">
                    <div className="auth-modal-logo">
                        <img src="/logo-black.png" alt="Dimensionless" />
                        <span>Dimensionless</span>
                    </div>
                </div>

                <div className="auth-modal-tabs">
                    {view === 'auth' ? (
                        <>
                            <button
                                className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                                onClick={() => handleTabChange('signin')}
                            >
                                Sign In
                            </button>
                            <button
                                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                                onClick={() => handleTabChange('signup')}
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <div className="auth-tab active">Reset Password</div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="auth-modal-form">
                    {view === 'forgot-password' ? (
                        <>
                            <p className="auth-modal-description">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <div className="auth-input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Sending link...' : 'Send Reset Link'}
                            </button>
                            <div className="auth-modal-footer">
                                <button type="button" className="auth-link-btn" onClick={() => setView('auth')}>
                                    Back to Sign In
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {activeTab === 'signup' && (
                                <div className="auth-input-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="auth-input-group">
                                <label htmlFor="password">Password</label>
                                <div className="auth-password-input">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? (activeTab === 'signin' ? 'Signing in...' : 'Creating account...') : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
                            </button>
                        </>
                    )}
                </form>

                <div className="auth-modal-divider">
                    <span>OR</span>
                </div>

                <button className="auth-social-btn" disabled>
                    <IconBrandGoogle size={20} />
                    <span>Continue with Google</span>
                </button>

                {view === 'auth' && activeTab === 'signin' && (
                    <div className="auth-modal-footer">
                        <button type="button" className="auth-link-btn" onClick={() => setView('forgot-password')}>
                            Forgot Password?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
