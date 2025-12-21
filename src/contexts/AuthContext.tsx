'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    loading: boolean;
    signUp: (email: string, password: string, full_name?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const lastFetchedUserId = useRef<string | null>(null);

    const fetchProfile = useCallback(async (userId: string) => {
        // Prevent duplicate fetches for the same user in the same session
        if (lastFetchedUserId.current === userId) return;

        try {
            lastFetchedUserId.current = userId;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch note:', error.message);
                setProfile(null);
                return;
            }
            setProfile(data);
        } catch (err) {
            console.error('Fatal profile error:', err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Handle session load
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setLoading(false);
            }
        };

        init();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setProfile(null);
                lastFetchedUserId.current = null;
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signUp = async (email: string, password: string, full_name?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: full_name
                    }
                }
            });

            if (data?.user && full_name) {
                // Manually create profile if trigger is not set or to ensure immediate availability
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: full_name,
                    email: email,
                    role: 'user'
                }, { onConflict: 'id' });
            }

            return { error };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
