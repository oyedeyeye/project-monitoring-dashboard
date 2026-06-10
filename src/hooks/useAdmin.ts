import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { UserProfile, MDA } from '../types/api';

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['adminData'],
        queryFn: async () => {
            const [usersRes, mdasRes] = await Promise.all([
                api.get('/users?limit=1000'),
                api.get('/mdas')
            ]);

            const usersList = usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
            return {
                users: usersList,
                mdas: mdasRes.data || []
            };
        }
    });

    const users: UserProfile[] = data?.users || [];
    const mdas: MDA[] = data?.mdas || [];

    const createMutation = useMutation({
        mutationFn: async ({ email, fullName, role, mdaId, password }: { email: string; fullName: string; role: string; mdaId: string; password?: string }) => {
            await api.post('/auth/register', { email, fullName, role, mdaId, password });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminData'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    return {
        users,
        mdas,
        loading: isLoading,
        error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
        createUser: (email: string, fullName: string, role: string, mdaId: string, password?: string) => 
            createMutation.mutateAsync({ email, fullName, role, mdaId, password }),
        refetch
    };
};

