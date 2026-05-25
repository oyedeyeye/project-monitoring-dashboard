import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ProgressUpdate } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useReports = (initialPage = 1, initialLimit = 25) => {
    const { profile } = useAuth();
    const [reports, setReports] = useState<ProgressUpdate[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';
    const isPpimu = profile?.role === 'PPIMU_ADMIN';

    useEffect(() => {
        if (profile?.mdaId || isWebmaster || isPpimu) {
            fetchReports();
        } else {
            setLoading(false);
        }
    }, [profile, isWebmaster, isPpimu, page, limit]);

    const fetchReports = async () => {
        console.log('useReports: Fetching reports...');
        try {
            setLoading(true);

            // Nest API handles scoping based on JWT
            const { data } = await api.get(`/progress-updates?page=${page}&limit=${limit}`);

            console.log(`useReports: Successfully fetched ${data?.data?.length || 0} reports.`);
            setReports(data?.data || []);
            setMeta(data?.meta || null);
        } catch (err: any) {
            console.error('useReports: Error fetching reports:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const approveReport = async (reportId: string) => {
        if (!isPpimu && !isWebmaster) {
            alert('Permission denied. Only PPIMU Administrators and Webmasters can approve reports.');
            return;
        }
        try {
            await api.put(`/progress-updates/${reportId}/approve`);
            fetchReports();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    };

    const rejectReport = async (reportId: string) => {
        if (!isPpimu && !isWebmaster) {
            alert('Permission denied. Only PPIMU Administrators and Webmasters can reject reports.');
            return;
        }
        try {
            await api.put(`/progress-updates/${reportId}/reject`);
            fetchReports();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    };

    return { 
        reports, 
        meta, 
        page, 
        setPage, 
        limit, 
        setLimit, 
        loading, 
        error, 
        approveReport, 
        rejectReport, 
        refetch: () => fetchReports() 
    };
};
