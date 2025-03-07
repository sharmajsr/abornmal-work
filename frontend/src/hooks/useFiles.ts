import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import fileService, { FileMetadata, FileUploadResponse } from '../services/fileService';

// Hook for fetching all files
export const useFiles = () => {
  return useQuery<FileMetadata[], Error>({
    queryKey: ['files'],
    queryFn: fileService.getFiles,
  });
};

// Hook for fetching a single file's details
export const useFileDetails = (fileId: string) => {
  return useQuery<FileMetadata, Error>({
    queryKey: ['file', fileId],
    queryFn: () => fileService.getFileDetails(fileId),
    enabled: !!fileId,
  });
};

// Hook for uploading a file
export const useFileUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation<FileUploadResponse, Error, { file: File; hashType?: string }>({
    mutationFn: ({ file, hashType = 'blake3' }) => fileService.uploadFile(file, hashType),
    onSuccess: () => {
      // Invalidate the files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

// Hook for deleting a file
export const useFileDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (fileId) => fileService.deleteFile(fileId),
    onSuccess: () => {
      // Invalidate the files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}; 