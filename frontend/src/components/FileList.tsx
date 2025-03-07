import React from 'react';
import { useFiles } from '../hooks/useFiles';
import FileItem from './FileItem';
import { DocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const FileList: React.FC = () => {
  const { data: files, isLoading, isError, error, refetch } = useFiles();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error?.message || 'Failed to load files'}</span>
        <button 
          onClick={() => refetch()} 
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded-md text-sm flex items-center"
        >
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          Retry
        </button>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading a file.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </ul>
    </div>
  );
};

export default FileList; 