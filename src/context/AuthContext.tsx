
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    mdaName: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [mdaName, setMdaName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // fetch session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('AuthContext: Initial session check:', session ? 'Session found' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                console.log('AuthContext: Fetching profile for user', session.user.id);
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`AuthContext: Auth event '${event}'`, session ? 'Session active' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setLoading(true);
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setMdaName(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const profileData = data as UserProfile | null;

            if (error || !profileData) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(profileData);

                // Fetch MDA name if mda_id exists
                if (profileData.mda_id) {
                    const { data: mdaRes, error: mdaError } = await supabase
                        .from('mdas')
                        .select('name')
                        .eq('id', profileData.mda_id)
                        .single();

                    const mdaData = mdaRes as { name: string } | null;

                    if (mdaError) {
                        console.error('Error fetching MDA:', mdaError);
                    } else if (mdaData) {
                        setMdaName(mdaData.name);
                    }
                } else {
                    setMdaName(null);
                }
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setMdaName(null);
        setSession(null);
        setUser(null);
    };

    const value = {
        session,
        user,
        profile,
        mdaName,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
