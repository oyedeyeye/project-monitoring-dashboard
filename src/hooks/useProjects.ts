import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Project } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useProjects = (mdaIdOverride?: string | null, initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const targetMdaId = mdaIdOverride || profile?.mdaId;
    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['projects', { targetMdaId, isWebmaster, page, limit }],
        queryFn: async () => {
            let url = `/projects?page=${page}&limit=${limit}`;
            if (targetMdaId && isWebmaster) {
                url += `&mdaId=${targetMdaId}`;
            }
            const response = await api.get(url);
            return response.data;
        },
        enabled: !!(targetMdaId || isWebmaster),
    });

    const projects: Project[] = data?.data || [];
    const meta = data?.meta ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages || data.meta.total_pages || 0,
        total_pages: data.meta.totalPages || data.meta.total_pages || 0,
    } : null;

    return {
        projects,
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

