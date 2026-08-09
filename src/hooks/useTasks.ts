import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CreateTaskDTO,
  type PaginatedTasksDTO,
  type TaskResponseDTO,
  type UpdateTaskDTO,
} from '@lib/shared';

// Buscar tarefas com paginação
export const useTasks = (page = 1, limit = 10) => {
  return useQuery<PaginatedTasksDTO>({
    queryKey: ['tasks', page, limit],
    queryFn: async () => {
      const response = await api.get('/api/tasks', { params: { page, limit } });
      return response.data;
    },
  });
};

// Buscar uma única tarefa
export const useTask = (id: string) => {
  return useQuery<TaskResponseDTO>({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Criar tarefa
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<TaskResponseDTO, Error, CreateTaskDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/tasks', data);
      return response.data; // Retorno direto do objeto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Atualizar tarefa
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TaskResponseDTO,
    Error,
    { id: string; data: UpdateTaskDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
  });
};

// Deletar tarefa
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
