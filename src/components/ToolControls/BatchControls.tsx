import React from 'react';
import { ImageFileItem, Language, EditSettings } from '../../types';
import { translations } from '../../translations';
import { Boxes, Download, CheckCircle2, Play, RefreshCw } from 'lucide-react';

interface BatchControlsProps {
  lang: Language;
  files: ImageFileItem[];
  onProcessBatch: () => void;
  onDownloadZip: () => void;
  isProcessing: boolean;
}

export const BatchControls: React.FC<BatchControlsProps> = ({
  lang,
  files,
  onProcessBatch,
  onDownloadZip,
  isProcessing,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Boxes className="w-4 h-4 text-indigo-500" />
        {t.tool_batch_process_title}
      </h3>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Total Batch Queue:</span>
          <span className="font-bold text-indigo-600">{files.length} Files</span>
        </div>

        <button
          onClick={onProcessBatch}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>Process All {files.length} Images</span>
        </button>

        <button
          onClick={onDownloadZip}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{t.downloadZip}</span>
        </button>
      </div>
    </div>
  );
};
