'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase-client';

interface InterestCategory {
    id: string;
    name: string;
    display_name: string;
    icon: string;
    description: string;
}

interface InterestSelectionProps {
    onComplete: (isCreator: boolean) => void;
    onSkip: () => void;
}

export default function InterestSelection({ onComplete, onSkip }: InterestSelectionProps) {
    const [categories, setCategories] = useState<InterestCategory[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isCreator, setIsCreator] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/interests/categories');
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const toggleInterest = (categoryName: string) => {
        setSelectedInterests(prev =>
            prev.includes(categoryName)
                ? prev.filter(i => i !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleSubmit = async () => {
        if (selectedInterests.length < 3) {
            setError('Please select at least 3 interests');
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
                    interests: selectedInterests,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            onComplete(isCreator);
        } catch (err: any) {
            setError(err.message || 'Failed to save interests');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-step">
            {error && <div className="auth-error">{error}</div>}

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                Select at least 3 interests to personalize your feed
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleInterest(category.name)}
                        className="interest-card"
                        style={{
                            padding: '16px',
                            border: selectedInterests.includes(category.name)
                                ? '2px solid #36454F'
                                : '2px solid #e2e8f0',
                            borderRadius: '12px',
                            background: selectedInterests.includes(category.name)
                                ? '#f8fafc'
                                : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {category.icon}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                            {category.display_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {category.description}
                        </div>
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={isCreator}
                        onChange={(e) => setIsCreator(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>I am an Artist / Creator</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>I want to showcase and sell my work in my gallery</div>
                    </div>
                </label>
            </div>

            <button
                onClick={handleSubmit}
                className="auth-button auth-button-primary"
                disabled={loading || selectedInterests.length < 3}
            >
                {loading ? 'Saving...' : (isCreator ? 'Next: Artist Setup' : 'Complete Setup')}
            </button>

            <button
                type="button"
                onClick={onSkip}
                className="auth-button auth-button-secondary"
                style={{ marginTop: '12px' }}
                disabled={loading}
            >
                Skip for now
            </button>
        </div>
    );
}
