import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CreateProjectDTO,
  type UpdateProjectDTO,
  type ProjectResponseDTO,
  type PaginatedProjectsDTO,
} from '@lib/shared';

// Buscar projetos com paginação
export const useProjects = (page = 1, limit = 10) => {
  return useQuery<PaginatedProjectsDTO>({
    queryKey: ['projects', page, limit],
    queryFn: async () => {
      const response = await api.get('/api/projects', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

// Buscar um único projeto
export const useProject = (id: string) => {
  return useQuery<ProjectResponseDTO>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await api.get(`/api/projects/${id}`);
      return response.data;
    },
    // Só faz a requisição se o ID existir
    enabled: !!id,
  });
};

// Criar projeto
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponseDTO, Error, CreateProjectDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Atualizar projeto
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectResponseDTO,
    Error,
    { id: string; data: UpdateProjectDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/projects/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
};

// Deletar projeto
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
