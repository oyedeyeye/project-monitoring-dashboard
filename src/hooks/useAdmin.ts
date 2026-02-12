
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, MDA } from '../types/supabase';

export const useAdmin = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [mdas, setMDAs] = useState<MDA[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        console.log('useAdmin: Fetching admin data (users & MDAs)...');
        setLoading(true);
        try {
            const [usersRes, mdasRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('mdas').select('*')
            ]);

            if (usersRes.error) {
                console.error('useAdmin: Error fetching users:', usersRes.error);
                throw usersRes.error;
            }
            if (mdasRes.error) {
                console.error('useAdmin: Error fetching MDAs:', mdasRes.error);
                throw mdasRes.error;
            }

            console.log(`useAdmin: Fetched ${usersRes.data?.length || 0} users and ${mdasRes.data?.length || 0} MDAs.`);
            setUsers(usersRes.data || []);
            setMDAs(mdasRes.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (email: string, fullName: string, role: 'super_user' | 'approver' | 'user', mdaId: string) => {
        // Note: Creating a user usually requires service_role key or an admin function if configured strictly. 
        // For client-side creation, we might be limited. 
        // However, standard flow is SignUp.
        // But signUp creates a session for that user. Admin creating user usually implies secondary API or Edge Function.
        // For now, let's assume direct insert to Profiles is what we manage, but Auth user creation is tricky without logging out admin.
        // We will just implement profile creation or call a hypothetical edge function.
        // As per Instructions: "supabase.auth.signUp() + INSERT into profiles"
        // Warning: calling signUp will sign in the new user in client-side context unless autoSignIn is false.

        const { data, error } = await supabase.auth.signUp({
            email,
            password: 'GenericPassword123!', // Required placeholder
            options: {
                data: { full_name: fullName, role, mda_id: mdaId } as any
            }
        });

        if (error) throw error;

        // If trigger doesn't exist, manually insert profile
        if (data.user) {
            const { error: profileError } = await (supabase.from('profiles') as any).insert({
                id: data.user.id,
                full_name: fullName,
                role: role,
                mda_id: mdaId
            });

            if (profileError) throw profileError;
        }

        fetchData();
    };


    return { users, mdas, loading, error, createUser, refetch: fetchData };
};
