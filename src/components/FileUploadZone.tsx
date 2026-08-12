import React, { useRef, useState, useEffect } from 'react';
import { ImageFileItem, Language } from '../types';
import { translations } from '../translations';
import { 
  UploadCloud, 
  Camera, 
  Clipboard, 
  FileImage, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';

interface FileUploadZoneProps {
  lang: Language;
  files: ImageFileItem[];
  activeFileId: string | null;
  onSelectActiveFile: (id: string) => void;
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  lang,
  files,
  activeFileId,
  onSelectActiveFile,
  onAddFiles,
  onRemoveFile,
  onClearAll,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files).filter((file) =>
          file.type.startsWith('image/') || file.type.includes('pdf')
        );
        if (pastedFiles.length > 0) {
          onAddFiles(pastedFiles);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onAddFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-14 h-14 mb-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {t.uploadTitle}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          {t.uploadSubtitle}
        </p>

        {/* Quick Action Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.selectFiles}
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
            {t.cameraCapture}
          </button>

          <span className="hidden sm:flex items-center gap-1 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
            <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
            {t.pasteClipboard}
          </span>
        </div>
      </div>

      {/* Selected Files List Bar */}
      {files.length > 0 && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Uploaded Files ({files.length})
            </span>
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {files.map((item) => {
              const isActive = item.id === activeFileId;
              const isPdf = item.type.includes('pdf');

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectActiveFile(item.id)}
                  className={`group relative flex-shrink-0 w-36 p-2 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(item.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="w-full h-20 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center mb-1.5 relative">
                    {isPdf ? (
                      <FileText className="w-8 h-8 text-rose-500" />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {item.status === 'done' && (
                      <span className="absolute top-1 right-1 p-0.5 bg-emerald-500 text-white rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {(item.originalSize / 1024).toFixed(0)} KB • {item.originalWidth}x{item.originalHeight}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
