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
    const isDragging = useRef(false);
    const scrollPos = useRef(0);

    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            scrollPos.current = window.scrollY;

            // Apply styles to lock body and prevent rubber-banding
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPos.current}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            // Restore scroll position
            const top = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';

            if (top) {
                window.scrollTo(0, parseInt(top || '0') * -1);
            }
        }

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        startY.current = touch.clientY;
        currentY.current = touch.clientY;
        isDragging.current = true;

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;

        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        // Only allow dragging down
        if (diff > 0 && sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${diff}px)`;
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const diff = currentY.current - startY.current;

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';

            if (diff > 120) {
                onClose();
            } else {
                sheetRef.current.style.transform = 'translateY(0)';
            }
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
