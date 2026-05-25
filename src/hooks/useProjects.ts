import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Project } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useProjects = (mdaIdOverride?: string | null, initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetMdaId = mdaIdOverride || profile?.mdaId;
    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';

    const fetchProjects = async () => {
        console.log('useProjects: Fetching projects...');
        try {
            setLoading(true);
            setError(null);

            // Our NestJS API automatically filters by the user's MDA ID based on their JWT role.
            // If they are a webmaster, we can pass it as a query parameter.
            let url = `/projects?page=${page}&limit=${limit}`;
            if (targetMdaId && isWebmaster) {
                url += `&mdaId=${targetMdaId}`;
            }

            const { data } = await api.get(url);

            console.log(`useProjects: Successfully fetched ${data?.data?.length || 0} projects.`);
            setProjects(data?.data || []);
            setMeta(data?.meta || null);
        } catch (err: any) {
            console.error('useProjects: Error fetching projects:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetMdaId || isWebmaster) {
            fetchProjects();
        } else {
            setLoading(false);
            setProjects([]);
            setMeta(null);
        }
    }, [targetMdaId, isWebmaster, page, limit]);

    return {
        projects,
        meta,
        page,
        setPage,
        limit,
        setLimit,
        loading,
        error,
        refetch: fetchProjects
    };
};
