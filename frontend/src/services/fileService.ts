import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  content_type: string;
  hash_type: string;
  file_hash: string;
  uploaded_at: string;
  download_url: string;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  content_type: string;
  hash_type: string;
  file_hash: string;
  uploaded_at: string;
  download_url: string;
}

const fileService = {
  // Get all files
  getFiles: async (): Promise<FileMetadata[]> => {
    const response = await axios.get(`${API_URL}/files/`);
    return response.data;
  },

  // Get file details
  getFileDetails: async (fileId: string): Promise<FileMetadata> => {
    const response = await axios.get(`${API_URL}/files/${fileId}/`);
    return response.data;
  },

  // Upload file
  uploadFile: async (file: File, hashType: string = 'blake3'): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hash_type', hashType);

    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    await axios.delete(`${API_URL}/files/${fileId}/`);
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on content type
  getFileIcon: (contentType: string): string => {
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.startsWith('video/')) {
      return 'video';
    } else if (contentType.startsWith('audio/')) {
      return 'audio';
    } else if (contentType.includes('pdf')) {
      return 'pdf';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return 'document';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      return 'spreadsheet';
    } else if (contentType.includes('zip') || contentType.includes('compressed')) {
      return 'archive';
    } else {
      return 'file';
    }
  }
};

export default fileService; 