import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Project } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useProjects = (mdaIdOverride?: string | null, initialPage = 1, initialLimit = 25, initialStatus = '', initialLga = '') => {
    const { profile } = useAuth();
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [status, setStatus] = useState(initialStatus);
    const [lga, setLga] = useState(initialLga);

    const targetMdaId = mdaIdOverride || profile?.mdaId;
    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';
    const isPpimu = profile?.role === 'PPIMU_ADMIN';

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['projects', { targetMdaId, isWebmaster, isPpimu, page, limit, status, lga }],
        queryFn: async () => {
            let url = `/projects?page=${page}&limit=${limit}`;
            if (targetMdaId && (isWebmaster || isPpimu)) {
                url += `&mdaId=${targetMdaId}`;
            }
            if (status) {
                url += `&status=${status}`;
            }
            if (lga) {
                url += `&lga=${lga}`;
            }
            const response = await api.get(url);
            return response.data;
        },
        enabled: !!(targetMdaId || isWebmaster || isPpimu),
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
        status,
        setStatus,
        lga,
        setLga,
        loading: isLoading,
        error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
        refetch
    };
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
    const response = await api.patch(`/projects/${projectId}`, data);
    return response.data;
};

export const uploadCsv = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/projects/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
