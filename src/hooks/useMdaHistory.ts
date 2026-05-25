import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ProgressUpdate } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useMdaHistory = (initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number; total_pages: number } | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        if (!profile?.mdaId && profile?.role !== 'WEBMASTER_ADMIN') {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/progress-updates?page=${page}&limit=${limit}`);
            setUpdates(data?.data || []);
            if (data?.meta) {
                setMeta({
                    total: data.meta.total,
                    page: data.meta.page,
                    limit: data.meta.limit,
                    totalPages: data.meta.total_pages || data.meta.totalPages || 0,
                    total_pages: data.meta.total_pages || data.meta.totalPages || 0,
                });
            } else {
                setMeta(null);
            }
        } catch (err: any) {
            console.error('Error fetching MDA progress updates history:', err);
            setError(err.message || 'Failed to fetch progress updates history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, limit, profile]);

    return { updates, meta, page, setPage, limit, setLimit, loading, error, refetch: fetchHistory };
};
