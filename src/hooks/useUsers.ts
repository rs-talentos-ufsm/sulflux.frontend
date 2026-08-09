import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import {
  type UserResponseDTO,
  type UpdateUserDTO,
  type PaginatedUsersDTO,
} from '@lib/shared';

// Buscar o usuário logado atual
export const useMe = () => {
  return useQuery<UserResponseDTO>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/api/auth/me');
      return response.data;
    },
  });
};

// Buscar usuários com paginação (tela de administração)
export const useUsers = (page = 1, limit = 10) => {
  return useQuery<PaginatedUsersDTO>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const response = await api.get('/api/users', { params: { page, limit } });
      return response.data;
    },
  });
};

// Buscar um usuário específico pelo ID
export const useUser = (id: string) => {
  return useQuery<UserResponseDTO>({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Atualizar usuário
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const loggedUser = useAuthStore((state) => state.user);

  return useMutation<
    UserResponseDTO,
    Error,
    { id: string; data: UpdateUserDTO }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/api/users/${id}`, data);
      return response.data; // Retorna o usuário atualizado diretamente
    },
    onSuccess: (updatedUser, variables) => {
      // Só atualiza o AuthStore se o usuário editado for o próprio usuário logado.
      if (loggedUser?.id === variables.id) {
        setUser(updatedUser); // <-- Agora passamos updatedUser direto, sem .data
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }

      // Invalida a lista de usuários e o cache desse usuário específico
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

// Deletar usuário
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
