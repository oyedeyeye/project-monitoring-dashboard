import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProgressUpdate } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const useReports = (initialPage = 1, initialLimit = 25) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';
  const isPpimu = profile?.role === 'PPIMU_ADMIN';

  const {
    data, isLoading, error, refetch,
  } = useQuery({
    queryKey: ['reports', { page, limit, profile }],
    queryFn: async () => {
      const response = await api.get(`/progress-updates?page=${page}&limit=${limit}`);
      return response.data;
    },
    enabled: !!(profile?.mdaId || isWebmaster || isPpimu),
  });

  const reports: ProgressUpdate[] = data?.data || [];
  const meta = data?.meta || null;

  const approveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      if (!isPpimu && !isWebmaster) {
        throw new Error('Permission denied. Only PPIMU Administrators and Webmasters can approve reports.');
      }
      await api.put(`/progress-updates/${reportId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reportId: string) => {
      if (!isPpimu && !isWebmaster) {
        throw new Error('Permission denied. Only PPIMU Administrators and Webmasters can reject reports.');
      }
      await api.put(`/progress-updates/${reportId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
    },
  });

  return {
    reports,
    meta,
    page,
    setPage,
    limit,
    setLimit,
    loading: isLoading,
    error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
    approveReport: (reportId: string) => approveMutation.mutateAsync(reportId),
    rejectReport: (reportId: string) => rejectMutation.mutateAsync(reportId),
    refetch,
  };
};
