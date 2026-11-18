'use client';

import { useRef, type ChangeEvent } from 'react';

export interface AttachedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

interface AttachmentUploaderProps {
  files: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  disabled?: boolean;
}

export function AttachmentUploader({ files, onFilesChange, disabled }: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    const newAttachments: AttachedFile[] = selected.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    onFilesChange([...files, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.csv,.json"
        onChange={handleSelectFiles}
        className="hidden"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        title="Attach image or file"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>

      {/* Uploaded File Chips Preview */}
      {files.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-md">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 shadow-2xs"
            >
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="h-5 w-5 rounded object-cover"
                />
              ) : (
                <span className="text-xs">📎</span>
              )}
              <span className="max-w-[120px] truncate font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="cursor-pointer text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
