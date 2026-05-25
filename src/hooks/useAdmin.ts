import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { UserProfile, MDA } from '../types/api';

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
                api.get('/users?limit=1000'),
                api.get('/mdas')
            ]);

            const usersList = usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
            console.log(`useAdmin: Fetched ${usersList.length} users and ${mdasRes.data?.length || 0} MDAs.`);

            setUsers(usersList);
            setMDAs(mdasRes.data || []);
        } catch (err: any) {
            console.error('useAdmin: Error fetching admin data:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (email: string, fullName: string, role: string, mdaId: string, password?: string) => {
        console.log('useAdmin: Invoking backend to create user...', { email, role, mdaId, hasPassword: !!password });

        try {
            await api.post('/auth/register', { email, fullName, role, mdaId, password });
            fetchData();
        } catch (error: any) {
            console.error('API Error creating user:', error);
            throw error;
        }
    };

    return { users, mdas, loading, error, createUser, refetch: fetchData };
};
