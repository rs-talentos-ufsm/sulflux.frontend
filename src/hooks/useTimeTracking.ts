import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type CreateTimeLogDTO,
  type UpdateTimeLogDTO,
  type TimeLogResponseDTO,
  type PaginatedTimeLogsDTO,
  TaskStatus,
} from '@lib/shared';

// Hook para dar Play/Pause (Com atualização automática para Em Andamento ao iniciar)
export const useToggleTimer = () => {
  const queryClient = useQueryClient();

  return useMutation<{ isTimerActive: boolean }, Error, string>({
    mutationFn: async (taskId) => {
      // 1. Alterna o timer no backend
      const response = await api.post(`/api/tasks/${taskId}/timer/toggle`);
      const { isTimerActive } = response.data;

      // 2. Se o timer foi ATIVADO, verificamos o status atual da tarefa no cache do React Query
      if (isTimerActive) {
        const taskCache: any = queryClient.getQueryData(['tasks', taskId]);

        // Se a tarefa estiver em BACKLOG ou PENDING, mudamos automaticamente para IN_PROGRESS
        if (
          taskCache &&
          (taskCache.status === TaskStatus.Backlog ||
            taskCache.status === TaskStatus.Pending)
        ) {
          await api.patch(`/api/tasks/${taskId}`, {
            status: TaskStatus.InProgress,
          });
        }
      }

      return response.data;
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
};

// Hook para buscar o tempo acumulado pendente
export const usePendingTime = (taskId: string, isOpen: boolean) => {
  return useQuery<{
    totalMinutes: number;
    firstStart: string | null;
    lastEnd: string | null;
  }>({
    queryKey: ['tasks', taskId, 'pending-time'],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/${taskId}/timer/pending`);
      return response.data;
    },
    enabled: !!taskId && isOpen,
  });
};

// Salvar formulário de horas (Create)
export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeLogResponseDTO, Error, CreateTimeLogDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/time-logs', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId, 'pending-time'],
      });
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
    },
  });
};

// Listar todos os apontamentos (Read All)
export const useTimeLogs = (
  page = 1,
  limit = 10,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery<PaginatedTimeLogsDTO>({
    queryKey: ['time-logs', page, limit, startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/api/time-logs', {
        params: { page, limit, startDate, endDate },
      });
      return response.data;
    },
  });
};

// Buscar apontamento específico (Read One)
export const useTimeLog = (id: string) => {
  return useQuery<TimeLogResponseDTO>({
    queryKey: ['time-logs', id],
    queryFn: async () => {
      const response = await api.get(`/api/time-logs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Atualizar um apontamento (Update)
export const useUpdateTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TimeLogResponseDTO,
    Error,
    { id: string; data: UpdateTimeLogDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/time-logs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Deletar apontamento (Delete)
export const useDeleteTimeLog = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/time-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
