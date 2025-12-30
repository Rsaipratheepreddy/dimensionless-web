'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'react-hot-toast';
import {
    IconSettings, IconCoin, IconDeviceFloppy, IconPlus, IconRefresh,
    IconLock
} from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';

export default function AdminTokenManagement() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/tokens/config');
            const data = await res.json();
            if (res.ok) setConfig(data.config);
        } catch (error) {
            toast.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/tokens/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config_data: config })
            });
            if (res.ok) {
                toast.success('Configuration updated successfully!');
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setConfig({ ...config, [field]: value });
    };

    const updateProjection = (index: number, value: string) => {
        const newProj = [...config.growth_projection];
        newProj[index] = parseFloat(value);
        setConfig({ ...config, growth_projection: newProj });
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Token Launch Management</h1>
                        <p style={{ color: '#666' }}>Configure launch details and ecosystem projections</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ background: '#5b4fe8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, display: 'flex', gap: '8px', cursor: 'pointer' }}
                    >
                        <IconDeviceFloppy size={20} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Lock Strategy Configuration */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconLock size={20} />
                        Strategic Lock Configuration
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        {(config.lock_config || []).map((lock: any, index: number) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600 }}>{lock.months} Months Multiplier</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={lock.multiplier}
                                    onChange={(e) => {
                                        const newLockConfig = [...config.lock_config];
                                        newLockConfig[index].multiplier = Number(e.target.value);
                                        setConfig({ ...config, lock_config: newLockConfig });
                                    }}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Basic Pricing */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
                        <h3 style={{ marginBottom: '20px' }}>Pricing & Supply</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Current Listing Price (INR)
                                <input
                                    type="number"
                                    value={config.current_price}
                                    onChange={(e) => updateField('current_price', parseFloat(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Target Listing Price (INR)
                                <input
                                    type="number"
                                    value={config.listing_price}
                                    onChange={(e) => updateField('listing_price', parseFloat(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Total Supply
                                <input
                                    type="number"
                                    value={config.total_supply}
                                    onChange={(e) => updateField('total_supply', parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Projections */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
                        <h3 style={{ marginBottom: '20px' }}>Growth Projection Path</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {config.growth_projection.map((val: number, i: number) => (
                                <label key={i} style={{ fontSize: '12px' }}>
                                    Point {i + 1}
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={(e) => updateProjection(i, e.target.value)}
                                        step="0.1"
                                        style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Progress */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', gridColumn: 'span 2' }}>
                        <h3 style={{ marginBottom: '20px' }}>Launch Progress</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Contribution Total (INR)
                                <input
                                    type="number"
                                    value={config.raised_amount}
                                    onChange={(e) => updateField('raised_amount', parseFloat(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Launch Target (INR)
                                <input
                                    type="number"
                                    value={config.target_amount}
                                    onChange={(e) => updateField('target_amount', parseFloat(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: 600 }}>
                                Contributors Count
                                <input
                                    type="number"
                                    value={config.investors_count}
                                    onChange={(e) => updateField('investors_count', parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
