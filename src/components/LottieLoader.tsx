'use client';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/animations/loading circle.json';
import './LottieLoader.css';

interface LottieLoaderProps {
    size?: number;
    className?: string;
}

export default function LottieLoader({ size = 150, className = '' }: LottieLoaderProps) {
    return (
        <div className={`lottie-loader-container ${className}`}>
            <div className="lottie-loader-wrapper" style={{ width: size, height: size }}>
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    autoplay={true}
                />
            </div>
        </div>
    );
}
