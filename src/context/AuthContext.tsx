import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types/api';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    session: string | null; // JWT token
    user: User | null;
    profile: UserProfile | null;
    mdaName: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signIn: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [mdaName, setMdaName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const token = localStorage.getItem('access_token');
        const userDataString = localStorage.getItem('user_data');

        if (token && userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                setSession(token);
                setUser({ id: userData.id, email: userData.email });

                const profileData = userData.profile;
                if (profileData) {
                    profileData.mdaId = profileData.mdaId || profileData.mda_id;
                    profileData.mda_id = profileData.mdaId;
                    profileData.fullName = profileData.fullName || profileData.full_name;
                    profileData.full_name = profileData.fullName;
                }
                setProfile(profileData);

                if (profileData?.mdaId) {
                    fetchMda(profileData.mdaId);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
                signOut();
            }
        } else {
            console.log('AuthContext: No session found');
            setLoading(false);
        }
    }, []);

    const fetchMda = async (mdaId: string) => {
        try {
            const { data } = await api.get(`/mdas/${mdaId}`);
            setMdaName(data.name);
        } catch (error) {
            console.error('Error fetching MDA:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = (authData: any) => {
        const profileData = authData.user?.profile;
        if (profileData) {
            profileData.mdaId = profileData.mdaId || profileData.mda_id;
            profileData.mda_id = profileData.mdaId;
            profileData.fullName = profileData.fullName || profileData.full_name;
            profileData.full_name = profileData.fullName;
        }

        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('user_data', JSON.stringify(authData.user));

        setSession(authData.access_token);
        setUser({ id: authData.user.id, email: authData.user.email });
        setProfile(profileData);

        if (profileData?.mdaId) {
            fetchMda(profileData.mdaId);
        } else {
            setLoading(false);
        }
    }

    const signOut = async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');

        setProfile(null);
        setMdaName(null);
        setSession(null);
        setUser(null);
        setLoading(false);
    };

    const value = {
        session,
        user,
        profile,
        mdaName,
        loading,
        signOut,
        signIn,
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
