import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import {
  type DocumentResponseDTO,
  type DocumentFolderDTO,
  type CreateDocumentDTO,
} from '@lib/shared';

export const useDocumentsList = (search?: string, folder?: string) => {
  return useQuery<DocumentResponseDTO[]>({
    queryKey: ['documents', search, folder],
    queryFn: async () => {
      const response = await api.get('/api/documents', {
        params: { search, folder },
      });
      return response.data;
    },
  });
};

export const useDocumentFolders = () => {
  return useQuery<DocumentFolderDTO[]>({
    queryKey: ['documents', 'folders'],
    queryFn: async () => {
      const response = await api.get('/api/documents/folders');
      return response.data;
    },
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<DocumentResponseDTO, Error, CreateDocumentDTO>({
    mutationFn: async (data) => {
      const response = await api.post('/api/documents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
