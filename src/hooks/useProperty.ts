import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CreatePropertyDTO,
  type PaginatedPropertiesDTO,
  type PropertyResponseDTO,
  type UpdatePropertyDTO,
  type PropertyQueryDTO,
} from '@lib/shared';

// Buscar propriedades com paginação e filtros
export const useProperties = (filters: PropertyQueryDTO) => {
  return useQuery<PaginatedPropertiesDTO>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const response = await api.get('/api/properties', { params: filters });
      return response.data;
    },
  });
};

// Buscar uma única propriedade
export const useProperty = (id: string) => {
  return useQuery<PropertyResponseDTO>({
    queryKey: ['properties', id],
    queryFn: async () => {
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Criar propriedade
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<PropertyResponseDTO, Error, CreatePropertyDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/properties', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

// Atualizar propriedade
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PropertyResponseDTO,
    Error,
    { id: string; data: UpdatePropertyDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/properties/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] });
    },
  });
};

// Deletar propriedade
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};
