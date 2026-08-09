import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import type { DashboardResponseDTO } from '@lib/shared';

/**
 * Hook para buscar os dados agregados do Dashboard.
 * Utiliza o TanStack Query para cache, refetch e controle de loading/error.
 */
export const useDashboard = () => {
  return useQuery<DashboardResponseDTO>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard');
      return response.data;
    },
  });
};
