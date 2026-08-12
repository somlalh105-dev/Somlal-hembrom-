import React from 'react';
import { EditSettings, ImageFormat, Language } from '../../types';
import { translations } from '../../translations';
import { RefreshCw, Check } from 'lucide-react';

interface ConvertControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
}

export const ConvertControls: React.FC<ConvertControlsProps> = ({
  lang,
  settings,
  onChange,
}) => {
  const t = translations[lang];

  const formats: { id: ImageFormat; label: string; desc: string }[] = [
    { id: 'png', label: 'PNG', desc: 'Transparent background, lossless quality' },
    { id: 'jpeg', label: 'JPG / JPEG', desc: 'Compressed, standard photo format' },
    { id: 'webp', label: 'WebP', desc: 'Modern web image format, extra light' },
    { id: 'pdf', label: 'PDF', desc: 'Portable Document Format' },
    { id: 'bmp', label: 'BMP', desc: 'Uncompressed bitmap image' },
    { id: 'svg', label: 'SVG', desc: 'Scalable vector graphic container' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-indigo-500" />
        {t.tool_convert_title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {formats.map((fmt) => {
          const isSelected = settings.targetFormat === fmt.id;

          return (
            <button
              key={fmt.id}
              onClick={() => onChange({ targetFormat: fmt.id })}
              className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">{fmt.label}</span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {fmt.desc}
                </span>
              </div>
              {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
