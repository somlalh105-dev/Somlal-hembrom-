import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { Crop, Circle, Square, Wand2 } from 'lucide-react';

interface CropControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
  originalW: number;
  originalH: number;
}

export const CropControls: React.FC<CropControlsProps> = ({
  lang,
  settings,
  onChange,
  originalW,
  originalH,
}) => {
  const t = translations[lang];

  const setFixedRatio = (ratioW: number, ratioH: number) => {
    let cropW = originalW;
    let cropH = originalH;

    if (ratioW && ratioH) {
      if (originalW / originalH > ratioW / ratioH) {
        cropW = Math.round(originalH * (ratioW / ratioH));
      } else {
        cropH = Math.round(originalW * (ratioH / ratioW));
      }
    }

    const x = Math.max(0, Math.round((originalW - cropW) / 2));
    const y = Math.max(0, Math.round((originalH - cropH) / 2));

    onChange({
      cropRect: { x, y, width: cropW, height: cropH, isCircle: false },
    });
  };

  const setCircleCrop = () => {
    const size = Math.min(originalW, originalH);
    const x = Math.round((originalW - size) / 2);
    const y = Math.round((originalH - size) / 2);

    onChange({
      cropRect: { x, y, width: size, height: size, isCircle: true },
    });
  };

  const clearCrop = () => {
    onChange({ cropRect: undefined });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Crop className="w-4 h-4 text-indigo-500" />
        {t.tool_crop_title}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setFixedRatio(1, 1)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-2"
        >
          <Square className="w-3.5 h-3.5 text-indigo-500" />
          1:1 Square
        </button>

        <button
          onClick={() => setFixedRatio(4, 3)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-2"
        >
          <Square className="w-3.5 h-3.5 text-indigo-500" />
          4:3 Standard
        </button>

        <button
          onClick={() => setFixedRatio(16, 9)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-2"
        >
          <Square className="w-3.5 h-3.5 text-indigo-500" />
          16:9 Widescreen
        </button>

        <button
          onClick={() => setCircleCrop()}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-2"
        >
          <Circle className="w-3.5 h-3.5 text-indigo-500" />
          Circle Crop
        </button>
      </div>

      <button
        onClick={clearCrop}
        className="w-full py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-100"
      >
        Reset / Remove Crop
      </button>
    </div>
  );
};
