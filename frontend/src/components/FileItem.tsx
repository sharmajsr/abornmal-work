import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentIcon, PhotoIcon, FilmIcon, MusicalNoteIcon, 
  DocumentTextIcon, ArchiveBoxIcon, TableCellsIcon,
  TrashIcon, ArrowDownTrayIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { FileMetadata } from '../services/fileService';
import fileService from '../services/fileService';
import { useFileDelete } from '../hooks/useFiles';

interface FileItemProps {
  file: FileMetadata;
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const deleteFileMutation = useFileDelete();
  
  const getFileIcon = () => {
    switch (fileService.getFileIcon(file.content_type)) {
      case 'image':
        return <PhotoIcon className="h-10 w-10 text-pink-500" />;
      case 'video':
        return <FilmIcon className="h-10 w-10 text-purple-500" />;
      case 'audio':
        return <MusicalNoteIcon className="h-10 w-10 text-yellow-500" />;
      case 'pdf':
        return <DocumentTextIcon className="h-10 w-10 text-red-500" />;
      case 'document':
        return <DocumentTextIcon className="h-10 w-10 text-blue-500" />;
      case 'spreadsheet':
        return <TableCellsIcon className="h-10 w-10 text-green-500" />;
      case 'archive':
        return <ArchiveBoxIcon className="h-10 w-10 text-gray-500" />;
      default:
        return <DocumentIcon className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFileMutation.mutateAsync(file.id);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <li className="relative">
      <div className="px-4 py-4 sm:px-6 flex items-center">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0 flex-1 px-4">
            <div>
              <p className="text-sm font-medium text-indigo-600 truncate">{file.name}</p>
              <p className="mt-1 flex text-sm text-gray-500">
                <span>{fileService.formatFileSize(file.size)}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(file.uploaded_at)}</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Hash: {file.file_hash.substring(0, 8)}... ({file.hash_type})
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link 
            to={`/files/${file.id}`}
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-100 hover:bg-indigo-200"
            title="View details"
          >
            <InformationCircleIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </Link>
          <a 
            href={file.download_url} 
            download
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-100 hover:bg-green-200"
            title="Download file"
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
          </a>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-100 hover:bg-red-200"
            title="Delete file"
          >
            <TrashIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full border border-red-100">
            <h3 className="text-lg font-medium text-gray-900">Delete file</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete "{file.name}"? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteFileMutation.isPending}
              >
                {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default FileItem; 