import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFileDetails, useFileDelete } from '../hooks/useFiles';
import fileService from '../services/fileService';
import { 
  ArrowLeftIcon, ArrowDownTrayIcon, TrashIcon, 
  DocumentIcon, PhotoIcon, FilmIcon, MusicalNoteIcon, 
  DocumentTextIcon, ArchiveBoxIcon, TableCellsIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

type FileDetailsParams = {
  id: string;
};

const FileDetails: React.FC = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { data: file, isLoading, isError } = useFileDetails(id || '');
  const deleteFileMutation = useFileDelete();

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm(`Are you sure you want to delete "${file?.name}"?`)) {
      try {
        await deleteFileMutation.mutateAsync(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const getFileIcon = () => {
    if (!file) return <DocumentIcon className="h-16 w-16 text-gray-500" />;
    
    switch (fileService.getFileIcon(file.content_type)) {
      case 'image':
        return <PhotoIcon className="h-16 w-16 text-pink-500" />;
      case 'video':
        return <FilmIcon className="h-16 w-16 text-purple-500" />;
      case 'audio':
        return <MusicalNoteIcon className="h-16 w-16 text-yellow-500" />;
      case 'pdf':
        return <DocumentTextIcon className="h-16 w-16 text-red-500" />;
      case 'document':
        return <DocumentTextIcon className="h-16 w-16 text-blue-500" />;
      case 'spreadsheet':
        return <TableCellsIcon className="h-16 w-16 text-green-500" />;
      case 'archive':
        return <ArchiveBoxIcon className="h-16 w-16 text-gray-500" />;
      default:
        return <DocumentIcon className="h-16 w-16 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading file details...</span>
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load file details</span>
        <Link 
          to="/"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Files
        </Link>
      </div>
    );
  }

  // Check if file is an image to display preview
  const isImage = file.content_type.startsWith('image/');

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">File Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Complete information about the file.</p>
        </div>
        <Link 
          to="/"
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </Link>
      </div>

      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              {getFileIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{file.name}</h2>
              <p className="text-sm text-gray-500">{file.content_type}</p>
            </div>
          </div>

          {isImage && (
            <div className="mb-6 border rounded-lg overflow-hidden">
              <img 
                src={file.download_url} 
                alt={file.name} 
                className="max-w-full h-auto max-h-96 mx-auto"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">File Size</h3>
              <p className="mt-1 text-sm text-gray-900">{fileService.formatFileSize(file.size)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(file.uploaded_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hash Type</h3>
              <p className="mt-1 text-sm text-gray-900">{file.hash_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">File Hash</h3>
              <p className="mt-1 text-sm text-gray-900 break-all">{file.file_hash}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">File ID</h3>
              <p className="mt-1 text-sm text-gray-900 break-all">{file.id}</p>
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            <a
              href={file.download_url}
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download File
            </a>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              disabled={deleteFileMutation.isPending}
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              {deleteFileMutation.isPending ? 'Deleting...' : 'Delete File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails; 