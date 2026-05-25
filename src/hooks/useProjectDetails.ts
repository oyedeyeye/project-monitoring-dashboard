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
            const [updatesRes, issuesRes] = await Promise.all([
                api.get(`/progress-updates?projectId=${projectId}&limit=10`),
                api.get(`/issues?projectId=${projectId}`)
            ]);

            setUpdates(updatesRes.data.data || []);
            setIssues(issuesRes.data || []);
        } catch (err: any) {
            console.error('Error fetching project details:', err);
            setError(err.message || 'Failed to fetch project details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [projectId]);

    return { updates, issues, loading, error, refetch: fetchDetails };
};
