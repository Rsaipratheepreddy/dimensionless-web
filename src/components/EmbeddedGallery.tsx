'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './EmbeddedGallery.css';

const EmbeddedGallery: React.FC = () => {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Simulate loading time for better UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleIframeLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <section className={`embedded-gallery-section theme-${theme}`}>
            <div className="gallery-container">
                <div className="gallery-header">
                    <h2 className="gallery-title">
                        <span className="title-icon">🎨</span>
                        Virtual Art Gallery
                    </h2>
                    <p className="gallery-subtitle">
                        Explore our immersive 3D gallery space and discover the artistic journey of Dimensionless Studios
                    </p>
                </div>

                <div className="gallery-embed-container">
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner">
                                <div className="spinner-ring"></div>
                                <div className="spinner-ring"></div>
                                <div className="spinner-ring"></div>
                            </div>
                            <p className="loading-text">Loading Virtual Gallery...</p>
                        </div>
                    )}

                    {hasError ? (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <h3>Unable to Load Gallery</h3>
                            <p>The virtual gallery is currently unavailable. Please try again later.</p>
                            <button
                                className="retry-btn"
                                onClick={() => {
                                    setHasError(false);
                                    setIsLoading(true);
                                    window.location.reload();
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <iframe
                            src="https://visit.virtualartgallery.com/dimensionless"
                            title="Dimensionless Studios Virtual Gallery"
                            className="gallery-iframe"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            allow="fullscreen; camera; microphone"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    )}
                </div>

                <div className="gallery-info">
                    <div className="info-card">
                        <h4>🎯 Interactive Experience</h4>
                        <p>Navigate through our 3D gallery space using your mouse and keyboard controls</p>
                    </div>
                    <div className="info-card">
                        <h4>🖼️ Curated Collection</h4>
                        <p>Discover our latest artworks and creative projects in an immersive environment</p>
                    </div>
                    <div className="info-card">
                        <h4>🌐 Virtual Reality Ready</h4>
                        <p>Experience the gallery in VR for the ultimate immersive art viewing experience</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmbeddedGallery;
