import { useCallback, useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/hashUtils';

interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
}

export default function FileDropZone({
  onFilesDrop,
  multiple = false,
  className = ''
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback((files: File[]): File[] => {
    return files.filter(file => {
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
        file.name.match(/\.(txt|json|md|csv|html|js|ts|xml)$/);
      const isValidSize = file.size <= MAX_FILE_SIZE;
      return isValidType && isValidSize;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length) {
      onFilesDrop(multiple ? validFiles : [validFiles[0]]);
    }
  }, [multiple, onFilesDrop, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length) {
      onFilesDrop(multiple ? validFiles : [validFiles[0]]);
    }
    // 重置input值以允许选择相同的文件
    e.target.value = '';
  }, [multiple, onFilesDrop, validateFiles]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center 
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
        transition-colors duration-200 ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileSelect}
        multiple={multiple}
        accept={ALLOWED_FILE_TYPES.join(',')}
      />
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        拖放文件到此处，或点击选择文件
      </p>
      <p className="mt-1 text-xs text-gray-500">
        支持的文件类型: TXT, JSON, MD, CSV, HTML, JS, TS, XML
      </p>
      <p className="mt-1 text-xs text-gray-500">
        最大文件大小: {MAX_FILE_SIZE / 1024 / 1024}MB
      </p>
    </div>
  );
} 