'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase';

interface CreatorOnboardingProps {
    onComplete: () => void;
    onBack: () => void;
}

export default function CreatorOnboarding({ onComplete, onBack }: CreatorOnboardingProps) {
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [awards, setAwards] = useState([{ title: '', year: '', description: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleAddAward = () => {
        setAwards([...awards, { title: '', year: '', description: '' }]);
    };

    const handleAwardChange = (index: number, field: string, value: string) => {
        const newAwards = [...awards];
        newAwards[index] = { ...newAwards[index], [field]: value };
        setAwards(newAwards);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !address) {
            setError('Phone and address are required for creators');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    phone,
                    address,
                    awards: awards.filter(a => a.title),
                    role: 'creator' // Ensure role is set
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to update creator profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-step">
            <button className="auth-back-button" onClick={onBack}>
                ← Back
            </button>

            <form onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                    Complete your artist profile to start showcasing your work
                </p>

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">Phone Number</label>
                    <input
                        type="tel"
                        className="auth-input"
                        placeholder="+91 00000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label className="auth-label">Studio Address</label>
                    <textarea
                        className="auth-input"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        required
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label className="auth-label">Awards & Achievements</label>
                    {awards.map((award, index) => (
                        <div key={index} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <input
                                type="text"
                                className="auth-input"
                                style={{ marginBottom: '8px' }}
                                placeholder="Award Title"
                                value={award.title}
                                onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    className="auth-input"
                                    placeholder="Year"
                                    style={{ width: '100px' }}
                                    value={award.year}
                                    onChange={(e) => handleAwardChange(index, 'year', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Brief Description"
                                    value={award.description}
                                    onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddAward} className="auth-link" style={{ fontSize: '14px' }}>
                        + Add another award
                    </button>
                </div>

                <button
                    type="submit"
                    className="auth-button auth-button-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Finish Setup'}
                </button>
            </form>

            <style jsx>{`
                .auth-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
            `}</style>
        </div>
    );
}
