import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface FlattenedUser {
    id: string;
    email: string;
    mdaId: string | null;
    mda_id: string | null;
    fullName: string;
    full_name: string;
    role: 'WEBMASTER_ADMIN' | 'PPIMU_ADMIN' | 'MDA_OFFICER' | null;
}

export const useUsers = (initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [users, setUsers] = useState<FlattenedUser[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/users?page=${page}&limit=${limit}`);
            
            // Map and flatten response structure
            const mappedUsers = (data?.data || []).map((u: any) => {
                const profileObj = u.profile || {};
                return {
                    id: u.id,
                    email: u.email,
                    mdaId: profileObj.mda_id || profileObj.mdaId || null,
                    mda_id: profileObj.mda_id || profileObj.mdaId || null,
                    fullName: profileObj.full_name || profileObj.fullName || '',
                    full_name: profileObj.full_name || profileObj.fullName || '',
                    role: profileObj.role || null,
                };
            });

            setUsers(mappedUsers);
            setMeta(data?.meta || null);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit, profile]);

    const createUser = async (email: string, fullName: string, role: string, mdaId: string, password?: string) => {
        console.log('useUsers: Creating user...', { email, fullName, role, mdaId, hasPassword: !!password });
        try {
            await api.post('/auth/register', { email, fullName, role, mdaId, password });
            await fetchUsers();
        } catch (err: any) {
            console.error('API Error creating user:', err);
            throw err;
        }
    };

    const updateUser = async (id: string, updateData: { email?: string; fullName?: string; role?: string; mdaId?: string | null; password?: string }) => {
        console.log('useUsers: Updating user...', id, updateData);
        try {
            // Transform keys to correct casing if needed, or NestJS service handles UserUpdateInput
            await api.put(`/users/${id}`, {
                email: updateData.email,
                password: updateData.password,
                profile: {
                    update: {
                        fullName: updateData.fullName,
                        role: updateData.role,
                        mdaId: updateData.mdaId || null,
                    }
                }
            });
            await fetchUsers();
        } catch (err: any) {
            console.error('API Error updating user:', err);
            throw err;
        }
    };

    const deleteUser = async (id: string) => {
        console.log('useUsers: Deleting user...', id);
        try {
            await api.delete(`/users/${id}`);
            await fetchUsers();
        } catch (err: any) {
            console.error('API Error deleting user:', err);
            throw err;
        }
    };

    return {
        users,
        meta,
        page,
        setPage,
        limit,
        setLimit,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        refetch: fetchUsers
    };
};
