'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IconBrandGoogle, IconBrandMeta, IconEye, IconEyeOff } from '@tabler/icons-react';
import './page.css';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signUp, user } = useAuth();

    // Grid images from public folder - organized in columns
    const gridColumns = [
        ['/painting.png', '/founder1.png', '/dmn-token.png', '/painting.png', '/founder1.png'],
        ['/studio.png', '/founder2.png', '/ajay-founder.png', '/studio.png', '/founder2.png'],
        ['/abtimg.png', '/dmn-token.png', '/member-names.png', '/abtimg.png', '/dmn-token.png'],
        ['/founder1.png', '/painting.png', '/studio.png', '/founder1.png', '/painting.png'],
    ];

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect to verification page with email
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
    };

    return (
        <div className="auth-page">
            {/* Left side - Image Grid */}
            <div className="auth-grid">
                <div className="grid-container">
                    {gridColumns.map((column, colIndex) => (
                        <div key={colIndex} className="grid-column">
                            {column.map((image, imgIndex) => (
                                <div
                                    key={imgIndex}
                                    className="grid-item"
                                    style={{ backgroundImage: `url(${image})` }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side - Signup Form */}
            <div className="auth-content">
                <div className="auth-header-logo">
                    <img src="/logo-black.png" alt="Dimensionless" className="header-logo-img" />
                    <span className="header-logo-text">Dimensionless</span>
                </div>

                <div className="auth-box">
                    <div className="auth-form-section">
                        <h2 className="form-title">Sign Up</h2>

                        <form onSubmit={handleSubmit} className="form">
                            {error && (
                                <div className="error-alert">
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
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

                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-input">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Creating account...' : 'Submit'}
                            </button>
                        </form>

                        <div className="form-footer">
                            <a href="/login" className="link">Already a member? Sign In</a>
                        </div>

                        <div className="social-divider">
                            <span>OR</span>
                        </div>

                        <div className="social-buttons">
                            <button className="social-button" disabled>
                                <IconBrandMeta size={20} />
                                <span>Sign up with Meta</span>
                            </button>
                            <button className="social-button" disabled>
                                <IconBrandGoogle size={20} />
                                <span>Sign up with Google</span>
                            </button>
                        </div>

                        <p className="terms-notice">
                            By signing up you agree to Dimensionless&apos;s{' '}
                            <a href="#" className="link">Terms of Service</a> and{' '}
                            <a href="#" className="link">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
