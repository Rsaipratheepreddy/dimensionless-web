'use client';

import React from 'react';
import './DimenCoinCard.css';
import { IconArrowRight } from '@tabler/icons-react';

const DimenCoinCard: React.FC = () => {
    return (
        <div className="dimen-coin-card">
            <h3 className="coin-title">Dimens (DMN)</h3>

            <div className="coin-main">
                <img src="/dimen-coin.png" alt="Dimen Coin" className="coin-icon" />
                <div className="coin-price-large">
                    <div className="price-line">1 DMN</div>
                    <div className="price-line equals">=</div>
                    <div className="price-line inr">₹800</div>
                </div>
            </div>

            <p className="coin-subtitle">Digital token on Polygon</p>

            <button className="buy-dimens-btn">
                Coming Soon
            </button>
        </div>
    );
};

export default DimenCoinCard;
