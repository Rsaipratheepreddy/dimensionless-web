'use client';
import ConfirmModal from '@/components/ui/ConfirmModal';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'primary';
}

interface ModalContextType {
    confirm: (options: ModalOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => { });

    const confirm = useCallback((modalOptions: ModalOptions) => {
        setOptions(modalOptions);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolvePromise(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolvePromise(false);
    };

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}
            {isOpen && options && (
                <ConfirmModal
                    {...options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
