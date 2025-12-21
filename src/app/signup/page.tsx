'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IconBrandGoogle, IconBrandMeta, IconEye, IconEyeOff } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import './page.css';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signUp } = useAuth();

    // Grid images from public folder - organized in columns
    const gridColumns = [
        ['/painting.png', '/founder1.png', '/dmn-token.png', '/painting.png', '/founder1.png'],
        ['/studio.png', '/founder2.png', '/ajay-founder.png', '/studio.png', '/founder2.png'],
        ['/abtimg.png', '/dmn-token.png', '/member-names.png', '/abtimg.png', '/dmn-token.png'],
        ['/founder1.png', '/painting.png', '/studio.png', '/founder1.png', '/painting.png'],
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await signUp(email, password, fullName);

            if (signUpError) {
                setError(signUpError.message);
                toast.error(signUpError.message);
                setLoading(false);
            } else {
                toast.success('Account created successfully!');
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup');
            toast.error(err.message || 'An error occurred during signup');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
