import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import {
  type LoginAuthDTO,
  type CreateUserDTO,
  type UserResponseDTO,
  AuthEnums,
} from '@lib/shared';

// Buscar usuário atual (Me)
export const useUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  return useQuery<UserResponseDTO>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/auth/me');

        // Sincroniza com o Zustand em caso de sucesso
        setUser(response.data);
        setStatus(AuthEnums.LoginStatus.Authenticated);

        return response.data;
      } catch (err) {
        // Limpa o Zustand se o token for inválido/expirado
        setUser(null);
        setStatus(AuthEnums.LoginStatus.Unauthenticated);
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Realizar Login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  return useMutation<UserResponseDTO, Error, LoginAuthDTO>({
    mutationFn: async (credentials) => {
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response.data;
    },
    onSuccess: (userData) => {
      setUser(userData);
      setStatus(AuthEnums.LoginStatus.Authenticated);

      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

// Registrar novo usuário
export const useRegister = () => {
  return useMutation<UserResponseDTO, Error, CreateUserDTO>({
    mutationFn: async (payload) => {
      const response = await api.post('/api/auth/register', payload);
      return response.data;
    },
  });
};

// Realizar Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await api.post('/api/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      logoutStore(); // Limpa o estado no Zustand
      queryClient.setQueryData(['me'], null); // Zera o cache do React Query
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
