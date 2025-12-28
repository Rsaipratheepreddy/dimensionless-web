'use client';
import React from 'react';
import { IconAlertTriangle, IconCircleCheck, IconX } from '@tabler/icons-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'primary',
    onConfirm,
    onCancel
}) => {
    return (
        <div className="modal-overlay">
            <div className="confirm-modal">
                <div className="modal-body">
                    <div className={`modal-icon ${type}`}>
                        {type === 'danger' ? <IconAlertTriangle size={32} /> : <IconCircleCheck size={32} />}
                    </div>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-cancel-btn" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`modal-confirm-btn ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
                <button className="modal-close-x" onClick={onCancel}>
                    <IconX size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
