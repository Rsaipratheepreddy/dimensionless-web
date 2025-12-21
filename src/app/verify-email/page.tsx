'use client';
import { useSearchParams } from 'next/navigation';
import { IconMail, IconCircleCheck } from '@tabler/icons-react';
import './page.css';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    return (
        <div className="verify-page">
            <div className="verify-container">
                <div className="verify-icon">
                    <IconCircleCheck size={64} className="success-icon" />
                </div>

                <h1 className="verify-title">Check Your Email</h1>

                <div className="verify-content">
                    <div className="email-icon-wrapper">
                        <IconMail size={24} />
                    </div>
                    <p className="verify-message">
                        We&apos;ve sent a verification email to:
                    </p>
                    <p className="verify-email">{email}</p>
                    <p className="verify-instructions">
                        Click the link in the email to verify your account and complete your signup.
                    </p>
                </div>

                <div className="verify-actions">
                    <a href="/login" className="login-link">
                        Go to Login
                    </a>
                    <p className="resend-text">
                        Didn&apos;t receive the email? Check your spam folder or{' '}
                        <button className="resend-button">resend verification email</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
