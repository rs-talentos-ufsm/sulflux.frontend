import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CarbonAnalysisResponseDTO,
  type WaterAnalysisResponseDTO,
  type PropertyMonitoringHistoryDTO,
  type TalhaoResultsResponseDTO,
  type MapExplorerResponseDTO,
} from '@lib/shared';

export const useCarbonAnalysis = (fieldId?: string, safra?: string) => {
  return useQuery<CarbonAnalysisResponseDTO>({
    queryKey: ['monitoring', 'carbon', fieldId, safra],
    queryFn: async () => {
      const response = await api.get(`/api/monitoring/carbon/${fieldId}`, {
        params: { safra },
      });
      return response.data;
    },
    enabled: !!fieldId,
  });
};

export const useWaterAnalysis = (fieldId?: string, safra?: string) => {
  return useQuery<WaterAnalysisResponseDTO>({
    queryKey: ['monitoring', 'water', fieldId, safra],
    queryFn: async () => {
      const response = await api.get(`/api/monitoring/water/${fieldId}`, {
        params: { safra },
      });
      return response.data;
    },
    enabled: !!fieldId,
  });
};

export const usePropertyMonitoringHistory = (propertyId?: string) => {
  return useQuery<PropertyMonitoringHistoryDTO>({
    queryKey: ['monitoring', 'history', propertyId],
    queryFn: async () => {
      const response = await api.get(`/api/monitoring/history/${propertyId}`);
      return response.data;
    },
    enabled: !!propertyId,
  });
};

export const useTalhaoResults = (fieldId?: string) => {
  return useQuery<TalhaoResultsResponseDTO>({
    queryKey: ['monitoring', 'results', fieldId],
    queryFn: async () => {
      const response = await api.get(`/api/monitoring/results/${fieldId}`);
      return response.data;
    },
    enabled: !!fieldId,
  });
};

export const useMapExplorer = () => {
  return useQuery<MapExplorerResponseDTO>({
    queryKey: ['monitoring', 'map'],
    queryFn: async () => {
      const response = await api.get('/api/monitoring/map');
      return response.data;
    },
  });
};
