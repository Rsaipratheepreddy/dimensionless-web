'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconCurrencyRupee,
    IconBuildingStore,
    IconWallet,
    IconShieldCheck,
    IconTrendingUp,
    IconLock,
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
    const { user, profile } = useAuth();
    const router = useRouter();
    const { isLoaded, openCheckout } = useRazorpay();
    const [amount, setAmount] = useState<number>(5000);
    const [config, setConfig] = useState<any>(null);
    const [blueChipArt, setBlueChipArt] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [investing, setInvesting] = useState(false);
    const [locking, setLocking] = useState(false);
    const [selectedLockIndex, setSelectedLockIndex] = useState(1);
    const [lockAmount, setLockAmount] = useState(0);
    const [showProof, setShowProof] = useState(false);
    const [investmentData, setInvestmentData] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/tokens/config');
            const data = await res.json();
            if (res.ok) {
                setConfig(data.config);
                setBlueChipArt(data.blueChip);
                setUserStats(data.userStats);
                setRecentActivity(data.recentActivity || []);
                setChartData(data.chartData);
                setLockAmount(Math.min(data.userStats?.available || 0, 5000));
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
            router.push('/login');
            return;
        }

        if (!isLoaded) {
            toast.error('Payment gateway is loading, please wait...');
            return;
        }

        setInvesting(true);
        try {
            const orderRes = await fetch('/api/tokens/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

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
                            fetchData();
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

    const handleLock = async () => {
        if (!user) {
            toast.error('Please login to stake tokens');
            return;
        }

        const selectedLock = config?.lock_config?.[selectedLockIndex] || { months: 12, multiplier: 1.15 };

        setLocking(true);
        try {
            const res = await fetch('/api/tokens/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: lockAmount,
                    durationMonths: selectedLock.months,
                    multiplier: selectedLock.multiplier
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Succesfully staked ${lockAmount} $DIMEN!`);
                fetchData();
            } else {
                toast.error(data.error || 'Failed to initiate stake');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLocking(false);
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="dimen-token-platform">
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
                        <section className="dashboard-section chart-section">
                            <GrowthChart data={config?.growth_projection || [0.5, 0.6, 0.8, 1.2, 1.5, 1.8, 2.2]} />
                        </section>

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


                        <section className="dashboard-section">
                            <div className="section-header">
                                <h3>Ecosystem Fund Allocation</h3>
                                <p>Transparency in fund utilization for sustainable growth</p>
                            </div>
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

                {/* Phase 2: Participation Dashboard (Added at the bottom) */}
                <div className="participation-dashboard">
                    <h2 className="dashboard-title-v2">Your Participation Dashboard</h2>

                    {/* 1. Balance Banner */}
                    <div className="balance-banner">
                        <div className="b-info">
                            <span className="b-label">TOTAL PURCHASED COINS</span>
                            <div className="b-value">
                                <img src="/dimen-coin.png" alt="Dimen" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                                <span>{(userStats?.total_purchased || 0).toLocaleString()}</span>
                                <span style={{ fontSize: '28px', opacity: 0.9, fontWeight: 600 }}>$DIMEN</span>
                            </div>
                        </div>
                        <div className="tier-status-badge">
                            <IconShieldCheck size={20} />
                            {userStats?.tier || 'Explorer'} Tier
                        </div>
                    </div>

                    {/* 2. Tier Progress Roadmap */}
                    <div className="tier-roadmap">
                        <div className="roadmap-header">
                            <h3>Ecosystem Tier Roadmap</h3>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>Unlock exclusive benefits by increasing your token stake</p>
                        </div>

                        <div className="roadmap-track">
                            <div className="roadmap-line">
                                <div className="roadmap-line-fill" style={{ width: `${userStats?.tier_progress || 0}%` }}></div>
                            </div>

                            <div className={`roadmap-step ${userStats?.total_purchased >= 0 ? 'completed' : ''}`}>
                                <div className="step-icon"><IconBuildingStore size={20} /></div>
                                <span className="step-label">Collector</span>
                            </div>

                            <div className={`roadmap-step ${userStats?.total_purchased >= 10000 ? 'completed' : userStats?.next_tier === 'Patron' ? 'active' : ''}`}>
                                <div className="step-icon">★</div>
                                <span className="step-label">Patron</span>
                            </div>

                            <div className={`roadmap-step ${userStats?.total_purchased >= 50000 ? 'completed' : userStats?.next_tier === 'Legacy' ? 'active' : ''}`}>
                                <div className="step-icon">♛</div>
                                <span className="step-label">Legacy</span>
                            </div>
                        </div>

                        <div className="roadmap-footer">
                            <div className="points-progress">
                                <span>{userStats?.points_to_next > 0 ? `${userStats.points_to_next.toLocaleString()} $DIMEN left for ${userStats.next_tier} Tier` : 'Maximum Tier Achieved'}</span>
                                <div className="p-bar"><div className="p-bar-fill" style={{ width: `${userStats?.tier_progress || 0}%` }}></div></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Analytics Section */}
                    <div className="analytics-grid">
                        <div className="analytics-card">
                            <h3>Points Growth Analysis</h3>
                            {/* Simple SVG Chart Implementation for Available vs Locked */}
                            <div style={{ height: '240px', width: '100%', marginTop: '32px' }}>
                                <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%' }}>
                                    {/* Grid Lines */}
                                    {[0, 1, 2, 3].map(i => (
                                        <line key={i} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="#f3f4f6" strokeWidth="1" />
                                    ))}

                                    {/* Available Path (Blue) */}
                                    <polyline
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={(chartData?.datasets?.[0]?.data || [0]).map((v: number, i: number) => {
                                            const max = Math.max(...(chartData?.datasets?.[0]?.data || [1000]), 1000);
                                            return `${(i * 160)},${240 - (v / max * 200) - 20}`;
                                        }).join(' ')}
                                    />

                                    {/* Locked Path (Purple) */}
                                    <polyline
                                        fill="none"
                                        stroke="#8b5cf6"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={(chartData?.datasets?.[1]?.data || [0]).map((v: number, i: number) => {
                                            const max = Math.max(...(chartData?.datasets?.[0]?.data || [1000]), 1000);
                                            return `${(i * 160)},${240 - (v / max * 200) - 20}`;
                                        }).join(' ')}
                                    />
                                </svg>
                                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6' }}></div> Available
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#8b5cf6' }}></div> Locked
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="analytics-card">
                            <h3>Stake Distribution</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                                <svg width="160" height="160" viewBox="0 0 42 42">
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4"
                                        strokeDasharray={`${(userStats?.available / (userStats?.total_purchased || 1)) * 100} ${100 - (userStats?.available / (userStats?.total_purchased || 1)) * 100}`}
                                        strokeDashoffset="25"></circle>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4"
                                        strokeDasharray={`${(userStats?.locked / (userStats?.total_purchased || 1)) * 100} ${100 - (userStats?.locked / (userStats?.total_purchased || 1)) * 100}`}
                                        strokeDashoffset={25 - (userStats?.available / (userStats?.total_purchased || 1)) * 100}></circle>
                                    <text x="21" y="21" textAnchor="middle" dominantBaseline="central" fontSize="4" fontWeight="800" fill="#111827">Dimen</text>
                                </svg>
                            </div>
                            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Available Tokens</span>
                                    <strong style={{ color: '#111827' }}>{(userStats?.available || 0).toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Strategically Locked</span>
                                    <strong style={{ color: '#111827' }}>{(userStats?.locked || 0).toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Management Row */}
                    <div className="management-grid">
                        <div className="management-card">
                            <div className="section-header" style={{ marginBottom: '32px' }}>
                                <h3>Enhanced Stake Manager</h3>
                                <p style={{ fontSize: '14px' }}>Optimize your holdings for maximum ecosystem benefits</p>
                            </div>

                            <div className="lock-calculator-ui">
                                <div className="duration-selector">
                                    {(config?.lock_config || [
                                        { months: 1, multiplier: 1.05 },
                                        { months: 6, multiplier: 1.15 },
                                        { months: 12, multiplier: 1.30 },
                                        { months: 24, multiplier: 1.50 }
                                    ]).map((opt: any, i: number) => (
                                        <div
                                            key={i}
                                            className={`duration-btn ${selectedLockIndex === i ? 'active' : ''}`}
                                            onClick={() => setSelectedLockIndex(i)}
                                        >
                                            <span className="d-label">{opt.months >= 12 ? `${opt.months / 12}Y` : `${opt.months}M`}</span>
                                            <span className="d-mult">+{((opt.multiplier - 1) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="lock-amount-input">
                                    <div className="input-header" style={{ marginBottom: '16px' }}>
                                        <span style={{ fontWeight: 700, color: '#6b7280' }}>STAKE AMOUNT</span>
                                        <strong style={{ fontSize: '24px', color: '#111827' }}>{lockAmount.toLocaleString()} $D</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={userStats?.available || 10000}
                                        step="100"
                                        style={{ width: '100%', accentColor: '#3b82f6', height: '8px' }}
                                        value={lockAmount}
                                        onChange={(e) => setLockAmount(Number(e.target.value))}
                                    />
                                    <div className="range-labels" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', fontWeight: 700 }}>
                                        <span>MIN: 0</span>
                                        <span onClick={() => setLockAmount(userStats?.available || 0)} style={{ cursor: 'pointer', color: '#3b82f6' }}>MAX: {(userStats?.available || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bonus-preview-box bonus-green">
                                    <div className="bp-icon"><IconTrendingUp size={28} /></div>
                                    <div className="bp-text">
                                        <span>PROJECTED MATURITY REWARD</span>
                                        <strong>+{(lockAmount * (config?.lock_config?.[selectedLockIndex]?.multiplier - 1 || 0.15)).toFixed(0)} $DIMEN</strong>
                                    </div>
                                </div>

                                <div className="lock-actions">
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Estimated Unlock Date:<br />
                                        <strong style={{ color: '#111827' }}>{new Date(Date.now() + (config?.lock_config?.[selectedLockIndex]?.months || 12) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                                    </div>
                                    <button
                                        className="lock-main-btn"
                                        onClick={handleLock}
                                        disabled={lockAmount <= 0 || locking}
                                    >
                                        {locking ? 'Confirming...' : `Confirm Lock [${lockAmount.toLocaleString()}]`}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="management-card">
                            <h3 style={{ marginBottom: '24px' }}>Recent Footprint</h3>
                            <div className="activity-feed-scroller">
                                {recentActivity.length > 0 ? recentActivity.map((act: any) => (
                                    <div key={act.id} className="activity-row">
                                        <div className="act-icon">
                                            {act.type === 'purchase' ? <IconWallet size={20} /> : <IconLock size={20} />}
                                        </div>
                                        <div className="act-content">
                                            <span className="act-title">{act.description}</span>
                                            <span className="act-time">{new Date(act.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className={`act-amt ${act.type === 'purchase' ? 'pos' : 'neg'}`}>
                                            {act.type === 'purchase' ? '+' : '-'}{Number(act.amount).toLocaleString()}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <p>No activity recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <section className="about-token-section">
                    <div className="about-header">
                        <h2>Ecosystem Overview & Digital-Physical Convergence</h2>
                        <p>A detailed look into how $DIMEN is redefining the artistic landscape.</p>
                    </div>

                    <div className="about-feature-row">
                        <div className="feature-text">
                            <h3>The Bridge to Physical Excellence</h3>
                            <p>
                                $DIMEN isn't just a digital asset; it's a key that unlocks physical artistry. Unlike traditional cryptocurrencies that exist solely on-chain, $DIMEN is deeply integrated with our physical infrastructure.
                            </p>
                        </div>
                        <div className="feature-image-vertical">
                            <img src="/dimen-coin.png" alt="Dimen Coin Utility" />
                        </div>
                    </div>

                    <div className="about-grid">
                        <div className="about-card">
                            <h3>Unrivaled Utility</h3>
                            <p>Use your tokens across our entire suite of services.</p>
                        </div>
                        <div className="about-card">
                            <h3>Scarcity & Economics</h3>
                            <p>Built for long-term sustainability with capped total supply.</p>
                        </div>
                        <div className="about-card">
                            <h3>DAO & Community Vision</h3>
                            <p>Evolving into a decentralized autonomous organization.</p>
                        </div>
                    </div>

                    <div className="about-full-text">
                        <h3>Roadmap & Future Milestones</h3>
                        <p>Phase 1 focused on core utility. Phase 2 introduces Blue Chip Marketplace. Phase 3 launches Dimensionless DAO.</p>
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
