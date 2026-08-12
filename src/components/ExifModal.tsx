import React from 'react';
import { ExifData, Language } from '../types';
import { translations } from '../translations';
import { X, ShieldAlert, CheckCircle2, FileText, Info } from 'lucide-react';

interface ExifModalProps {
  lang: Language;
  exifData: ExifData | null;
  onClose: () => void;
  onStripExif: () => void;
}

export const ExifModal: React.FC<ExifModalProps> = ({
  lang,
  exifData,
  onClose,
  onStripExif,
}) => {
  const t = translations[lang];

  if (!exifData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.tool_exif_viewer_title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Details Table */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">File Name:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {exifData.fileName}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">File Size:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {exifData.fileSize}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Resolution:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {exifData.dimensions}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Aspect Ratio:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {exifData.aspectRatio}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">MIME Format:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {exifData.fileType}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Last Modified:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {exifData.lastModified}
            </span>
          </div>
        </div>

        {/* Privacy Action */}
        <div className="pt-2">
          <button
            onClick={() => {
              onStripExif();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Clean & Strip Private Metadata</span>
          </button>
        </div>
      </div>
    </div>
  );
};
