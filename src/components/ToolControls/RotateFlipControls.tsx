import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface RotateFlipControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
}

export const RotateFlipControls: React.FC<RotateFlipControlsProps> = ({
  lang,
  settings,
  onChange,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <RotateCw className="w-4 h-4 text-indigo-500" />
        {t.tool_rotate_flip_title}
      </h3>

      {/* Quick Rotate Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onChange({ rotation: (settings.rotation - 90 + 360) % 360 })}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex flex-col items-center justify-center gap-1"
        >
          <RotateCcw className="w-4 h-4 text-indigo-500" />
          -90°
        </button>

        <button
          onClick={() => onChange({ rotation: (settings.rotation + 90) % 360 })}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex flex-col items-center justify-center gap-1"
        >
          <RotateCw className="w-4 h-4 text-indigo-500" />
          +90°
        </button>

        <button
          onClick={() => onChange({ flipHorizontal: !settings.flipHorizontal })}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
            settings.flipHorizontal
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500'
          }`}
        >
          <FlipHorizontal className="w-4 h-4" />
          Flip H
        </button>

        <button
          onClick={() => onChange({ flipVertical: !settings.flipVertical })}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
            settings.flipVertical
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500'
          }`}
        >
          <FlipVertical className="w-4 h-4" />
          Flip V
        </button>
      </div>

      {/* Rotation Slider */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
          <span>{t.rotationAngle}</span>
          <span className="font-mono text-indigo-600">{settings.rotation}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={settings.rotation}
          onChange={(e) => onChange({ rotation: Number(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>
    </div>
  );
};
