import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useReportsAnalytics = (
  initialYear = new Date().getFullYear(),
  initialType: 'monthly' | 'quarterly' = 'monthly',
  initialValue = new Date().getMonth() + 1,
) => {
  const [year, setYear] = useState(initialYear);
  const [type, setType] = useState<'monthly' | 'quarterly'>(initialType);
  const [value, setValue] = useState(initialValue);

  const {
    data, isLoading, error, refetch, isRefetching,
  } = useQuery({
    queryKey: ['reports-analytics', { year, type, value }],
    queryFn: async () => {
      const response = await api.get(`/reports/analytics?year=${year}&type=${type}&value=${value}`);
      return response.data;
    },
  });

  return {
    data,
    loading: isLoading,
    isRefetching,
    error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
    year,
    setYear,
    type,
    setType,
    value,
    setValue,
    refetch,
  };
};
