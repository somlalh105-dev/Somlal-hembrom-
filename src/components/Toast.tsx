import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
          type === 'error'
            ? 'bg-rose-900 text-rose-100 border-rose-700'
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span className="truncate">{message}</span>
        </div>

        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
