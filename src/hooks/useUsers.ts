import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface FlattenedUser {
  id: string;
  email: string;
  mdaId: string | null;
  mdaName: string;
  fullName: string;
  role: 'WEBMASTER_ADMIN' | 'PPIMU_ADMIN' | 'MDA_OFFICER' | null;
  lastEditActivityDate: string | null;
  isActive: boolean;
}

export const useUsers = (initialPage = 1, initialLimit = 25) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const {
    data, isLoading, error, refetch,
  } = useQuery({
    queryKey: ['users', { page, limit, profile }],
    queryFn: async () => {
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      return response.data;
    },
  });

  const mappedUsers: FlattenedUser[] = (data?.data || []).map((u: any) => {
    const profileObj = u.profile || {};
    return {
      id: u.id,
      email: u.email,
      mdaId: profileObj.mdaId || null,
      mdaName: profileObj.mda?.name || 'N/A',
      fullName: profileObj.fullName || '',
      role: profileObj.role || null,
      lastEditActivityDate: u.lastEditActivityDate || null,
      isActive: u.isActive !== false,
    };
  });

  const meta = data?.meta ? {
    total: data.meta.total,
    page: data.meta.page,
    limit: data.meta.limit,
    totalPages: data.meta.totalPages || data.meta.total_pages || 0,
    total_pages: data.meta.totalPages || data.meta.total_pages || 0,
  } : null;

  const createMutation = useMutation({
    mutationFn: async ({
      email, fullName, role, mdaId, password,
    }: { email: string; fullName: string; role: string; mdaId: string; password?: string }) => {
      await api.post('/auth/register', {
        email, fullName, role, mdaId, password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: { email?: string; fullName?: string; role?: string; mdaId?: string | null; password?: string } }) => {
      // Flat payload: the API no longer accepts raw Prisma nested writes.
      await api.put(`/users/${id}`, {
        email: updateData.email,
        fullName: updateData.fullName,
        role: updateData.role,
        mdaId: updateData.mdaId ?? null,
        password: updateData.password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.patch(`/users/${id}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    },
  });

  return {
    users: mappedUsers,
    meta,
    page,
    setPage,
    limit,
    setLimit,
    loading: isLoading,
    error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
    createUser: (email: string, fullName: string, role: string, mdaId: string, password?: string) => createMutation.mutateAsync({
      email, fullName, role, mdaId, password,
    }),
    updateUser: (id: string, updateData: { email?: string; fullName?: string; role?: string; mdaId?: string | null; password?: string }) => updateMutation.mutateAsync({ id, updateData }),
    toggleUserStatus: (id: string, isActive: boolean) => toggleStatusMutation.mutateAsync({ id, isActive }),
    deleteUser: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
  };
};
