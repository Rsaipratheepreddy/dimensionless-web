'use client';
import Lottie from 'lottie-react';
import loadingAnimation from '@/../public/animations/animation.json';
import './LottieLoader.css';

interface LottieLoaderProps {
    size?: number;
    className?: string;
}

export default function LottieLoader({ size = 150, className = '' }: LottieLoaderProps) {
    return (
        <div className={`lottie-loader-container ${className}`}>
            <div className="lottie-loader-wrapper" style={{ width: 60, height: 60 }}>
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    autoplay={true}
                />
                <div className="lottie-center-image" style={{ zIndex: 100000, top: '51%' }}>
                    <img
                        src="/imgoverlay.png"
                        alt="Loading..."
                        width={60}
                        height={60}
                    />
                </div>
                <div className="lottie-center-image">
                    <img
                        src="/alienimg.png"
                        alt="Loading..."
                        width={60}
                        height={60}
                    />
                </div>

            </div>
        </div>
    );
}
