'use client';

import React, { useEffect, useState } from 'react';
import { getURL } from '@/utils/auth-helpers';
import { createClient } from '@/utils/supabase-client';
import AppLayout from '@/components/layout/AppLayout';

export default function DebugAuthPage() {
    const [info, setInfo] = useState<any>({});
    const [supabaseStatus, setSupabaseStatus] = useState<'testing' | 'ok' | 'error'>('testing');
    const [errorMsg, setErrorMsg] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const testSupabase = async () => {
            try {
                const { data, error } = await supabase.from('profiles').select('count').limit(1);
                if (error) throw error;
                setSupabaseStatus('ok');
            } catch (err: any) {
                console.error('Supabase Conn Error:', err);
                setSupabaseStatus('error');
                setErrorMsg(err.message || 'Unknown error');
            }
        };

        if (typeof window !== 'undefined') {
            setInfo({
                origin: window.location.origin,
                getURL_root: getURL('/'),
                getURL_callback: getURL('/auth/callback'),
                userAgent: navigator.userAgent,
                protocol: window.location.protocol,
                host: window.location.host,
            });
            testSupabase();
        }
    }, []);

    return (
        <AppLayout>
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
                <h1 style={{ color: '#5B4FE8' }}>Auth Diagnostics</h1>

                <section style={{ marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3>Environment & URLs</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><strong>window.location.origin:</strong> {info.origin}</li>
                        <li><strong>getURL('/'):</strong> {info.getURL_root}</li>
                        <li><strong>getURL('/auth/callback'):</strong> {info.getURL_callback}</li>
                        <li><strong>Protocol:</strong> {info.protocol}</li>
                        <li><strong>Host:</strong> {info.host}</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3>Supabase Connection</h3>
                    <p>Status:
                        <span style={{
                            marginLeft: '8px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: supabaseStatus === 'ok' ? '#dcfce7' : supabaseStatus === 'error' ? '#fee2e2' : '#fef9c3',
                            color: supabaseStatus === 'ok' ? '#166534' : supabaseStatus === 'error' ? '#991b1b' : '#854d0e'
                        }}>
                            {supabaseStatus.toUpperCase()}
                        </span>
                    </p>
                    {errorMsg && <p style={{ color: '#991b1b', fontSize: '12px' }}>Error: {errorMsg}</p>}
                </section>

                <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                    <p><strong>Note:</strong> If "getURL" above shows "localhost" but you are on "dimens.in", it means neither <code>NEXT_PUBLIC_SITE_URL</code> nor <code>window.location.origin</code> are working as expected.</p>
                    <p>If "getURL" shows the correct domain, but you still get redirected to localhost after Google Login, the issue is definitely in the <strong>Supabase Dashboard "Site URL"</strong> setting.</p>
                </div>
            </div>
        </AppLayout>
    );
}
