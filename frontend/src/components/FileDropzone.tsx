import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  className?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileAccepted, className }) => {
  const { t } = useTranslation();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-gray-400 mb-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        
        <p className="text-lg font-medium">
          {t('dropzone.title')}
        </p>
        
        <p className="text-sm text-gray-500 mt-1">
          {t('dropzone.subtitle')}
        </p>
        
        <p className="text-xs text-gray-400 mt-2">
          {t('dropzone.acceptedFormats')}
        </p>
        
        {acceptedFiles.length > 0 && (
          <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
            {acceptedFiles[0].name} ({(acceptedFiles[0].size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;
