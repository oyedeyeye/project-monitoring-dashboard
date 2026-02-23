import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProgressUpdate, Issue } from '../types/supabase';

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
                supabase
                    .from('progress_updates')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('report_date', { ascending: false }),
                supabase
                    .from('issues')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('log_date', { ascending: false })
            ]);

            if (updatesRes.error) throw updatesRes.error;
            if (issuesRes.error) throw issuesRes.error;

            setUpdates(updatesRes.data || []);
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
