import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { Zap, Target, Gauge } from 'lucide-react';

interface CompressControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
  originalSize: number;
}

export const CompressControls: React.FC<CompressControlsProps> = ({
  lang,
  settings,
  onChange,
  originalSize,
}) => {
  const t = translations[lang];

  const handleQualityChange = (val: number) => {
    onChange({ quality: val, targetSizeKB: undefined });
  };

  const handleTargetKBSelect = (kb: number) => {
    onChange({ targetSizeKB: kb });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Zap className="w-4 h-4 text-indigo-500" />
        {t.tool_compress_title}
      </h3>

      {/* Quality Slider */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" />
            {t.quality}
          </span>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round((settings.quality || 0.8) * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.05"
          max="1.0"
          step="0.05"
          value={settings.quality || 0.8}
          onChange={(e) => handleQualityChange(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Max Compression (Small Size)</span>
          <span>Max Quality (High Detail)</span>
        </div>
      </div>

      {/* Target KB Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          {t.targetSizeKb}
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[50, 100, 200, 500, 1000, 2000].map((kb) => (
            <button
              key={kb}
              onClick={() => handleTargetKBSelect(kb)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                settings.targetSizeKB === kb
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              Under {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
