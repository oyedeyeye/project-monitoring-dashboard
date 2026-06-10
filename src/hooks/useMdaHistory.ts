import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProgressUpdate } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useMdaHistory = (initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['mdaHistory', { page, limit, profile }],
        queryFn: async () => {
            const response = await api.get(`/progress-updates?page=${page}&limit=${limit}`);
            return response.data;
        },
        enabled: !!(profile?.mdaId || isWebmaster),
    });

    const updates: ProgressUpdate[] = data?.data || [];
    const meta = data?.meta ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages || data.meta.total_pages || 0,
        total_pages: data.meta.totalPages || data.meta.total_pages || 0,
    } : null;

    return { 
        updates, 
        meta, 
        page, 
        setPage, 
        limit, 
        setLimit, 
        loading: isLoading, 
        error: error ? ((error as any).response?.data?.message || (error as any).message) : null, 
        refetch 
    };
};

