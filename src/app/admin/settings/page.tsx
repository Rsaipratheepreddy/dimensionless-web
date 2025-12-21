'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconSettings, IconLoader2, IconCircleCheck, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import './page.css';

export default function AdminSettingsPage() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fee, setFee] = useState(10);
    const [success, setSuccess] = useState(false); // Keep success state for button feedback if toast is not enough

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*')
                .single();

            if (data) {
                setFee(data.platform_fee_percent);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to fetch settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { error } = await supabase
                .from('platform_settings')
                .upsert({
                    id: 1, // Single row table
                    platform_fee_percent: fee
                });

            if (error) throw error;

            toast.success('Settings updated successfully!');
            fetchSettings(); // Re-fetch settings to ensure UI is up-to-date if needed, or just rely on local state
            // The original instruction had a partial line here: ` => setSuccess(false), 3000);`
            // Assuming the intent was to remove the `setTimeout` and `setSuccess` for success message,
            // as `toast.success` now handles it.
            // However, if `success` state is still desired for button text, it needs to be managed.
            // For now, keeping `setSuccess` for button text feedback, but removing the timeout as toast handles it.
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Re-adding this to maintain button feedback
        } catch (error: any) {
            console.error('Save error:', error); // Changed from 'Error saving settings:'
            toast.error('Failed to save settings.'); // Replaced alert
        } finally {
            setSaving(false);
        }
    };

    if (profile?.role !== 'admin') {
        return (
            <AppLayout>
                <div className="admin-container">
                    <p>Access Denied. Admins only.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="admin-container">
                <div className="admin-header">
                    <div className="header-info">
                        <h1>Platform Settings</h1>
                        <p>Configure global variables for the platform</p>
                    </div>
                </div>

                <div className="settings-content">
                    {loading ? (
                        <div className="loading-state">
                            <IconLoader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <form className="settings-form" onSubmit={handleSave}>
                            <div className="settings-section">
                                <h3>Revenue & Fees</h3>
                                <div className="form-group">
                                    <label>Platform Transaction Fee (%)</label>
                                    <input
                                        type="number"
                                        value={fee}
                                        onChange={(e) => setFee(parseFloat(e.target.value))}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        required
                                    />
                                    <p className="helper-text">
                                        This percentage will be deducted from the artwork price and kept by the platform.
                                        Example: A ₹1000 artwork with a 10% fee will give ₹900 to the artist.
                                    </p>
                                </div>
                            </div>

                            <button className="save-btn" disabled={saving}>
                                {saving ? (
                                    <>
                                        <IconLoader2 className="animate-spin" size={20} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        {success && <IconCircleCheck size={20} />}
                                        <span>{success ? 'Settings Saved' : 'Save Changes'}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
