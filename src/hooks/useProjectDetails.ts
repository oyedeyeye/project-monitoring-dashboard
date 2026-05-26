import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ProgressUpdate, Issue } from '../types/api';

export const useProjectDetails = (projectId: string | null) => {
    const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const updatesRes = await api.get(`/progress-updates?projectId=${projectId}&limit=10`);
            setUpdates(updatesRes.data.data || []);
        } catch (err: any) {
            console.error('Error fetching project updates:', err);
            setError(err.message || 'Failed to fetch project updates');
        }

        try {
            const issuesRes = await api.get(`/issues?projectId=${projectId}`);
            setIssues(issuesRes.data || []);
        } catch (err: any) {
            console.error('Error fetching project issues (endpoint might not exist yet):', err);
            // Don't fail the whole view if issues fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [projectId]);

    return { updates, issues, loading, error, refetch: fetchDetails };
};
