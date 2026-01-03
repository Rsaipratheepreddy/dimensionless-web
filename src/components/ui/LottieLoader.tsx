'use client';
import { DotLottiePlayer } from '@dotlottie/react-player';
import './LottieLoader.css';

interface LottieLoaderProps {
    size?: number;
    className?: string;
}

export default function LottieLoader({ size = 250, className = '' }: LottieLoaderProps) {
    return (
        <div className={`lottie-loader-container ${className}`}>
            <div className="lottie-loader-wrapper" style={{ width: size, height: size }}>
                <DotLottiePlayer
                    src="/animations/loader-lottie.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>
    );
}
