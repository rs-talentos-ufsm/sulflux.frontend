import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CreateFieldDTO,
  type PaginatedFieldsDTO,
  type FieldResponseDTO,
  type UpdateFieldDTO,
  type FieldQueryDTO,
} from '@lib/shared';

// Buscar talhões com paginação e filtros
export const useFields = (filters: FieldQueryDTO) => {
  return useQuery<PaginatedFieldsDTO>({
    queryKey: ['fields', filters],
    queryFn: async () => {
      const response = await api.get('/api/fields', { params: filters });
      return response.data;
    },
  });
};

// Buscar um único talhão
export const useField = (id: string) => {
  return useQuery<FieldResponseDTO>({
    queryKey: ['fields', id],
    queryFn: async () => {
      const response = await api.get(`/api/fields/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Criar talhão
export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation<FieldResponseDTO, Error, CreateFieldDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/fields', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      // Invalida a propriedade também caso tenhamos uma lista atrelada a ela
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

// Atualizar talhão
export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FieldResponseDTO,
    Error,
    { id: string; data: UpdateFieldDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/fields/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['fields', variables.id] });
    },
  });
};

// Deletar talhão
export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};
