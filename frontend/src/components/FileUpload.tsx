import React, { useState, useRef } from 'react';
import { useFileUpload } from '../hooks/useFiles';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashType, setHashType] = useState<string>('blake3');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadMutation.mutateAsync({ file: selectedFile, hashType });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload File</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Drag and drop a file here, or click to select a file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="hash-type" className="block text-sm font-medium text-gray-700">
          Hash Algorithm
        </label>
        <select
          id="hash-type"
          name="hash-type"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={hashType}
          onChange={(e) => setHashType(e.target.value)}
        >
          <option value="blake3">Blake3 (Default)</option>
          <option value="md5">MD5</option>
          <option value="sha256">SHA256</option>
        </select>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${!selectedFile || uploadMutation.isPending 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {uploadMutation.isError && (
        <div className="mt-3 text-sm text-red-600">
          Upload failed: {uploadMutation.error?.message || 'Unknown error'}
        </div>
      )}

      {uploadMutation.isSuccess && (
        <div className="mt-3 text-sm text-green-600">
          File uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default FileUpload; 