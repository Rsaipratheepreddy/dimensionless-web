'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconCurrencyRupee,
    IconChartBar,
    IconBuildingStore,
    IconWallet,
    IconShieldCheck,
    IconArrowRight,
    IconTrendingUp,
    IconLock,
    IconUsers,
    IconInfoCircle
} from '@tabler/icons-react';
import './dimen-token.css';
import InvestmentProof from '@/components/features/tokens/InvestmentProof';
import GrowthChart from '@/components/features/tokens/GrowthChart';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';
import { useRazorpay } from '@/hooks/useRazorpay';

export default function DimenTokenPage() {
    const { user, profile, openAuthModal } = useAuth();
    const router = useRouter();
    const { isLoaded, openCheckout } = useRazorpay();
    const [amount, setAmount] = useState<number>(5000);
    const [config, setConfig] = useState<any>(null);
    const [blueChipArt, setBlueChipArt] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [investing, setInvesting] = useState(false);
    const [showProof, setShowProof] = useState(false);
    const [investmentData, setInvestmentData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/tokens/config');
            const data = await res.json();
            if (res.ok) {
                setConfig(data.config);
                setBlueChipArt(data.blueChip);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvest = async () => {
        if (!user) {
            toast.error('Please login to participate');
            openAuthModal('signin');
            return;
        }

        if (!isLoaded) {
            toast.error('Payment gateway is loading, please wait...');
            return;
        }

        setInvesting(true);
        try {
            // 1. Create Order
            const orderRes = await fetch('/api/tokens/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

            // 2. Open Razorpay
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Dimensionless",
                description: "Dimen Token Launch Contribution",
                order_id: orderData.orderId,
                prefill: {
                    name: profile?.full_name || '',
                    email: user.email || '',
                },
                theme: { color: "#111827" },
                handler: async (response: any) => {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch('/api/tokens/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                amountInr: amount,
                                tokenAmount: amount / (config?.current_price || 0.5)
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            setInvestmentData({
                                id: verifyData.investmentId,
                                userName: profile?.full_name || user.email || 'Contributor',
                                amountInr: amount,
                                tokenAmount: amount / (config?.current_price || 0.5),
                                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            });
                            setShowProof(true);
                            toast.success('Contribution successful!');
                        } else {
                            toast.error(verifyData.error || 'Verification failed');
                        }
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                }
            };

            openCheckout(options);
        } catch (error: any) {
            toast.error(error.message || 'Payment initialization failed');
        } finally {
            setInvesting(false);
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="dimen-token-platform">
                {/* Header Section */}
                <header className="platform-header">
                    <div className="header-main">
                        <img src="/dimen-coin.png" alt="Dimen Coin" className="main-logo" />
                        <div className="header-text">
                            <h1>Dimen Token Launch</h1>
                            <div className="tags">
                                <span className="tag blue">Utility Asset</span>
                                <span className="tag green">Ecosystem Growth</span>
                                <span className="tag grey"><IconLock size={12} /> 1Y Genesis Lock</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Growth & Stats Row */}
                <div className="stats-container">
                    <div className="stat-box">
                        <span className="label">Current Price</span>
                        <span className="value">₹{(config?.current_price || 0.5)}</span>
                        <span className="sub-label">Min. Contribution: ₹500</span>
                    </div>
                    <div className="stat-box">
                        <span className="label">Contribution Total</span>
                        <span className="value">₹{((config?.raised_amount || 0) / 10000000).toFixed(2)} Cr</span>
                        <span className="sub-label">Launch Target: ₹{((config?.target_amount || 0) / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="stat-box">
                        <span className="label">Contributors</span>
                        <span className="value">{(config?.investors_count || 0).toLocaleString()}</span>
                        <span className="sub-label">Strategic Alliance</span>
                    </div>
                </div>

                <div className="main-layout-grid">
                    <div className="dashboard-content">
                        {/* Projection Graph */}
                        <section className="dashboard-section chart-section">
                            <GrowthChart data={config?.growth_projection || [0.5, 0.6, 0.8, 1.2, 1.5, 1.8, 2.2]} />
                        </section>

                        {/* Blue Chip Trading */}
                        <section className="dashboard-section">
                            <div className="section-header">
                                <h3>Blue Chip Art Trading</h3>
                                <p>Premium artworks listed for trading with $DIMEN</p>
                            </div>
                            <div className="blue-chip-grid">
                                {blueChipArt.length > 0 ? blueChipArt.map(art => (
                                    <div key={art.id} className="art-trade-card">
                                        <div className="art-img-box">
                                            <img src={art.image_url || '/painting.png'} alt={art.title} />
                                        </div>
                                        <div className="art-details">
                                            <h4>{art.title}</h4>
                                            <p className="artist">by {art.artist}</p>
                                            <div className="valuation">
                                                <span>Valuation: ₹{art.valuation.toLocaleString()}</span>
                                                <button className="trade-btn">Trade</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <IconBuildingStore size={48} />
                                        <p>New Blue Chip listings coming soon.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Allocation Section */}
                        <section className="dashboard-section">
                            <h3>Fund Allocation</h3>
                            <div className="allocation-list">
                                <div className="allocation-item">
                                    <div className="alloc-header">
                                        <span>Art Ecosystem Development</span>
                                        <span>40%</span>
                                    </div>
                                    <div className="alloc-bar"><div className="fill" style={{ width: '40%' }}></div></div>
                                </div>
                                <div className="allocation-item">
                                    <div className="alloc-header">
                                        <span>Liquidity Pool</span>
                                        <span>30%</span>
                                    </div>
                                    <div className="alloc-bar"><div className="fill blue" style={{ width: '30%' }}></div></div>
                                </div>
                                <div className="allocation-item">
                                    <div className="alloc-header">
                                        <span>Operations & Marketing</span>
                                        <span>30%</span>
                                    </div>
                                    <div className="alloc-bar"><div className="fill grey" style={{ width: '30%' }}></div></div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar - Contribution Portal */}
                    <div className="dashboard-sidebar">
                        <div className="investment-card">
                            <h3>Primary Offering</h3>
                            <p className="price-info">1 $DIMEN = ₹{(config?.current_price || 0.50)}</p>

                            <div className="input-group-clean">
                                <label>Contribution Amount (INR)</label>
                                <div className="input-row">
                                    <IconCurrencyRupee size={20} />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        placeholder="Min. 500"
                                    />
                                </div>
                            </div>

                            <div className="conversion-result">
                                <span>You will receive</span>
                                <strong>{(amount / (config?.current_price || 0.50)).toLocaleString()} $DIMEN</strong>
                            </div>

                            <button
                                className="reserve-btn"
                                onClick={handleInvest}
                                disabled={investing || amount < 500}
                            >
                                {investing ? 'Processing...' : 'Reserve Tokens'}
                            </button>

                            <div className="security-notice">
                                <IconShieldCheck size={16} />
                                Safe & Secure Transaction
                            </div>
                        </div>

                        <div className="utility-highlight">
                            <h4>Token Utility</h4>
                            <ul>
                                <li><IconTrendingUp size={16} /> High growth potential</li>
                                <li><IconBuildingStore size={16} /> Buy Blue Chip Art</li>
                                <li><IconWallet size={16} /> Instant Liquidity</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* About Section - Expanded with Images */}
                <section className="about-token-section">
                    <div className="about-header">
                        <h2>Ecosystem Overview & Digital-Physical Convergence</h2>
                        <p>A detailed look into how $DIMEN is redefining the artistic landscape.</p>
                    </div>

                    <div className="about-feature-row">
                        <div className="feature-text">
                            <h3>The Bridge to Physical Excellence</h3>
                            <p>
                                $DIMEN isn't just a digital asset; it's a key that unlocks physical artistry. Unlike traditional cryptocurrencies that exist solely on-chain, $DIMEN is deeply integrated with our physical infrastructure. From the tactile sensation of a custom tattoo to the visual presence of a masterwork on your wall, $DIMEN facilitates a seamless transition from digital ownership to tangible reality.
                            </p>
                            <p>
                                By participating in our ecosystem, you are supporting a decentralized network of artists, curators, and technologists dedicated to preserving the integrity of physical art while leveraging the efficiency of blockchain technology.
                            </p>
                        </div>
                        <div className="feature-image-vertical">
                            <img src="/dimen-coin.png" alt="Dimen Coin Utility" />
                            <span className="caption">The Currency of Creation</span>
                        </div>
                    </div>

                    <div className="about-grid">
                        <div className="about-card">
                            <h3>Unrivaled Utility</h3>
                            <p>
                                Use your tokens across our entire suite of services. Whether you're looking to acquire a blue-chip masterpiece, book a session with a celebrity tattoo artist, or enroll in a masterclass at the Dimensionless Art School, $DIMEN provides a frictionless payment experience with exclusive holder-only benefits.
                            </p>
                            <p>
                                Special privileges include early access to new drops, lower service fees, and the ability to stake your tokens for premium status within our physical galleries.
                            </p>
                        </div>
                        <div className="about-card">
                            <h3>Scarcity & Economics</h3>
                            <p>
                                With a capped total supply and a strategic allocation model, $DIMEN is built for long-term sustainability. Our tokenomics are designed to reward long-term supporters through ecosystem growth and increased demand for limited-edition physical assets.
                            </p>
                            <p>
                                The 1-year Genesis Lock ensures that initial contributors are aligned with the project's multi-year roadmap, preventing short-term volatility and fostering a stable growth environment for our artistic partners.
                            </p>
                        </div>
                        <div className="about-card">
                            <h3>DAO & Community Vision</h3>
                            <p>
                                Dimensionless is evolving into a decentralized autonomous organization. Your $DIMEN tokens will soon grant you voting power to determine which new artists join the platform, which cities we expand our physical studios to, and how the communal treasury is utilized for global art preservation.
                            </p>
                            <p>
                                We are building a community where every contributor has a voice in shaping the future of global art and body-art culture.
                            </p>
                        </div>
                    </div>

                    <div className="about-feature-row reverse">
                        <div className="feature-image-vertical">
                            <img src="/dimen-coin.png" alt="Ecosystem Growth" />
                            <span className="caption">Decentralized Governance</span>
                        </div>
                        <div className="feature-text">
                            <h3>Global Reach, Local Impact</h3>
                            <p>
                                Our physical presence is expanding. While $DIMEN can be traded globally, its impact is felt locally. Every transaction contributes to the maintenance of our physical studios and the fair compensation of artists. We believe in high-impact artistic presence that inspires local communities while maintaining a global digital footprint.
                            </p>
                            <p>
                                As we open more locations, the utility of your tokens grows. Future expansions include flagship galleries in major art hubs, further increasing the value of being an early participant in the Dimen ecosystem. Every studio acts as a physical node in our decentralized network, providing real-world utility for your digital assets.
                            </p>
                        </div>
                    </div>

                    <div className="about-full-text">
                        <h3>Roadmap & Future Milestones</h3>
                        <p>
                            Phase 1 of our launch focuses on establishing the core $DIMEN utility and building the initial bridge between our digital platform and premium physical studios. We are currently in the Strategic Contribution stage, allowing early supporters to participate in the Genesis event. Following this, Phase 2 will introduce the "Blue Chip Marketplace," where high-value artworks will be fractionally traded using $DIMEN.
                        </p>
                        <p>
                            By Phase 3, we plan to launch the Dimensionless DAO, handing over significant governance rights to token holders. This includes the ability to vote on upcoming gallery locations, artist residencies, and the allocation of the community art fund. Our vision is to create a self-sustaining ecosystem where art, technology, and community converge seamlessly.
                        </p>
                        <p>
                            Long-term goals include the integration of Augmented Reality (AR) galleries, allowing holders to visualize their blue-chip art collection in any physical space, and the establishment of the Dimensionless Art Academy, a premier institution for the next generation of digital and traditional artists. Join us as we build the framework for the future of artistic expression and decentralized ownership.
                        </p>
                    </div>
                </section>
            </div>

            {showProof && investmentData && (
                <InvestmentProof
                    {...investmentData}
                    onClose={() => setShowProof(false)}
                />
            )}
        </AppLayout>
    );
}
