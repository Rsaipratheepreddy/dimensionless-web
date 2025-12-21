'use client';
import Link from 'next/link';
import { IconHome, IconArrowLeft } from '@tabler/icons-react';
import './not-found.css';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-visual">
                    <h1 className="not-found-code">404</h1>
                    <div className="not-found-glow"></div>
                </div>

                <div className="not-found-text">
                    <h2>Lost in the Dimension?</h2>
                    <p>
                        The piece of art or page you're looking for seems to have
                        vanished into another reality.
                    </p>
                </div>

                <div className="not-found-actions">
                    <Link href="/" className="btn-primary-glow">
                        <IconHome size={20} /> Back to Studio
                    </Link>
                    <button onClick={() => window.history.back()} className="btn-secondary-outline">
                        <IconArrowLeft size={20} /> Previous Dimension
                    </button>
                </div>
            </div>

            <div className="not-found-footer">
                <p>© 2025 Dimensionless Studios. All Rights Reserved.</p>
            </div>
        </div>
    );
}
