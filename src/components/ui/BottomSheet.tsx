import React, { useEffect, useRef } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showProgress?: boolean;
    currentStep?: number;
    totalSteps?: number;
}

export default function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    showProgress = false,
    currentStep = 1,
    totalSteps = 1
}: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        if (diff > 0 && sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${diff}px)`;
        }
    };

    const handleTouchEnd = () => {
        const diff = currentY.current - startY.current;

        if (diff > 100) {
            onClose();
        }

        if (sheetRef.current) {
            sheetRef.current.style.transform = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="bottom-sheet-overlay" onClick={onClose}>
            <div
                ref={sheetRef}
                className="bottom-sheet"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="bottom-sheet-handle" />

                {title && (
                    <div className="bottom-sheet-header">
                        <h2 className="bottom-sheet-title">{title}</h2>
                        {showProgress && (
                            <div className="bottom-sheet-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    />
                                </div>
                                <span className="progress-text">
                                    Step {currentStep} of {totalSteps}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="bottom-sheet-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
