
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useProjects = () => {
    const { profile } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.mda_id) {
            fetchProjects(profile.mda_id);
        } else {
            setLoading(false);
        }
    }, [profile]);

    const fetchProjects = async (mdaId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('mda_id', mdaId);

            if (error) {
                throw error;
            }

            setProjects(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { projects, loading, error, refetch: () => profile?.mda_id && fetchProjects(profile.mda_id) };
};
