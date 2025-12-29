'use client';

import React from 'react';
import { IconCheck, IconDownload, IconShare, IconCurrencyRupee } from '@tabler/icons-react';
import './InvestmentProof.css';

interface InvestmentProofProps {
    investmentId: string;
    userName: string;
    amountInr: number;
    tokenAmount: number;
    date: string;
    onClose: () => void;
}

export default function InvestmentProof({ investmentId, userName, amountInr, tokenAmount, date, onClose }: InvestmentProofProps) {
    return (
        <div className="proof-overlay">
            <div className="proof-card">
                <div className="proof-header">
                    <div className="success-badge">
                        <IconCheck size={24} />
                    </div>
                    <h3>Contribution Received!</h3>
                    <p>Transaction Receipt</p>
                </div>

                <div className="proof-body">
                    <div className="token-visual">
                        <div className="coin-glow"></div>
                        <img src="/dimen-coin.png" alt="Dimen Coin" className="coin-img" />
                        <div className="token-count">
                            <span className="amount">{tokenAmount.toLocaleString()}</span>
                            <span className="symbol">$DIMEN</span>
                        </div>
                    </div>

                    <div className="details-list">
                        <div className="detail-item">
                            <span className="label">Contributor</span>
                            <span className="value">{userName}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Amount Allocated</span>
                            <span className="value"><IconCurrencyRupee size={14} />{amountInr.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Transaction Date</span>
                            <span className="value">{date}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Contribution ID</span>
                            <span className="value code">{investmentId}</span>
                        </div>
                    </div>

                    <div className="proof-footer-note">
                        This document serves as initial confirmation of your participation in the Dimen Token Launch.
                        Tokens will be accessible within the ecosystem upon Genesis completion.
                    </div>
                </div>

                <div className="proof-actions">
                    <button className="action-btn secondary" onClick={() => window.print()}>
                        <IconDownload size={18} />
                        Download PDF
                    </button>
                    <button className="action-btn primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
