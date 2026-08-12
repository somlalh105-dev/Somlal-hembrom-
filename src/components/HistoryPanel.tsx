import React from 'react';
import { ProcessedHistoryItem, Language } from '../types';
import { translations } from '../translations';
import { X, Trash2, Download, History, Clock } from 'lucide-react';

interface HistoryPanelProps {
  lang: Language;
  history: ProcessedHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  lang,
  history,
  isOpen,
  onClose,
  onClearHistory,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 p-6 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between space-y-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.recentFiles}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
              {t.noHistory}
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.previewUrl}
                      alt={item.originalName}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.originalName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {item.timestamp} • {item.processedSizeFormatted}
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.previewUrl}
                    download={`edited_${item.originalName}`}
                    className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>
    </div>
  );
};
