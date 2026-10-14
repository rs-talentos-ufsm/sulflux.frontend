import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type AssistantContextResponseDTO,
  type AssistantChatResponseDTO,
  type AssistantClearResponseDTO,
  type ChatMessageDTO,
} from '@lib/shared';

export const useAssistantContext = () => {
  return useQuery<AssistantContextResponseDTO>({
    queryKey: ['assistant', 'context'],
    queryFn: async () => {
      const response = await api.get('/api/assistant/context');
      return response.data;
    },
  });
};

export const useAssistantMessages = () => {
  return useQuery<ChatMessageDTO[]>({
    queryKey: ['assistant', 'messages'],
    queryFn: async () => {
      const response = await api.get('/api/assistant/messages');
      return response.data;
    },
  });
};

export const useSendAssistantMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<AssistantChatResponseDTO, Error, string>({
    mutationFn: async (message: string) => {
      const response = await api.post('/api/assistant/chat', { message });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant'] });
    },
  });
};

export const useClearAssistantMessages = () => {
  const queryClient = useQueryClient();

  return useMutation<AssistantClearResponseDTO, Error, void>({
    mutationFn: async () => {
      const response = await api.delete('/api/assistant/messages');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant', 'messages'] });
    },
  });
};
