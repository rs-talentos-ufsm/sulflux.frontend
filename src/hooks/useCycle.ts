import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CropCycleResponseDTO,
  type SaveSeasonCyclesDTO,
} from '@lib/shared';

export const useFieldCycles = (fieldId?: string) => {
  return useQuery<CropCycleResponseDTO[]>({
    queryKey: ['cycles', fieldId],
    queryFn: async () => {
      const response = await api.get(`/api/cycles/field/${fieldId}`);
      return response.data;
    },
    enabled: !!fieldId,
  });
};

export const useSaveSeasonCycles = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CropCycleResponseDTO[],
    Error,
    { fieldId: string; data: SaveSeasonCyclesDTO }
  >({
    mutationFn: async ({ fieldId, data }) => {
      const response = await api.post(
        `/api/cycles/field/${fieldId}/season`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cycles', variables.fieldId],
      });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });
};
