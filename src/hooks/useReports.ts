
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProgressUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useReports = () => {
    const { profile } = useAuth();
    const [reports, setReports] = useState<ProgressUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.mda_id) {
            fetchReports(profile.mda_id);
        } else {
            setLoading(false);
        }
    }, [profile]);

    const fetchReports = async (mdaId: string) => {
        console.log('useReports: Fetching reports for MDA:', mdaId);
        try {
            setLoading(true);
            // Verify join query syntax with Supabase documentation if needed. 
            // Assuming we want reports for projects belonging to this MDA.
            const { data, error } = await supabase
                .from('progress_updates')
                .select(`
                    *,
                    projects!inner(mda_id, title)
                `)
                .eq('projects.mda_id', mdaId)
                .order('report_date', { ascending: false });

            if (error) {
                console.error('useReports: Error fetching reports:', error);
                throw error;
            }

            console.log(`useReports: Successfully fetched ${data?.length || 0} reports.`);
            setReports(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const approveReport = async (reportId: string) => {
        try {
            // Logic for approval - currently updating milestone_status as placeholder
            const { error } = await supabase
                .from('progress_updates')
                .update({ milestone_status: 'Approved' })
                .eq('id', reportId);

            if (error) throw error;

            // Refresh list
            if (profile?.mda_id) fetchReports(profile.mda_id);

        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return { reports, loading, error, approveReport, refetch: () => profile?.mda_id && fetchReports(profile.mda_id) };
};
