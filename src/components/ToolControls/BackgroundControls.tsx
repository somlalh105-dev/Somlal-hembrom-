import React, { useState } from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { Scissors, Palette, Droplets, Sparkles, AlertCircle } from 'lucide-react';

interface BackgroundControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
  onAiRemoveBg: () => void;
  isAiProcessing: boolean;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  lang,
  settings,
  onChange,
  onAiRemoveBg,
  isAiProcessing,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Scissors className="w-4 h-4 text-indigo-500" />
        {t.tool_bg_remove_title}
      </h3>

      {/* AI BG Removal Trigger */}
      <button
        onClick={onAiRemoveBg}
        disabled={isAiProcessing}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl shadow-md shadow-indigo-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        <span>{isAiProcessing ? 'Analyzing Background...' : 'AI Remove Background / Auto Chroma'}</span>
      </button>

      {/* Auto Chroma Key Transparency Tolerance */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Solid BG Color Eraser Tolerance</span>
          <span className="font-mono text-indigo-600">{settings.chromaTolerance || 30}</span>
        </div>

        <input
          type="range"
          min="5"
          max="120"
          value={settings.chromaTolerance || 30}
          onChange={(e) =>
            onChange({
              chromaTolerance: Number(e.target.value),
              bgType: 'transparent',
            })
          }
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Erases matching background color from photo corners automatically.
        </p>
      </div>

      {/* Replace Background Color */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-indigo-500" />
          {t.tool_bg_color_title}
        </label>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.bgColor || '#ffffff'}
            onChange={(e) =>
              onChange({
                bgColor: e.target.value,
                bgType: 'color',
              })
            }
            className="w-12 h-9 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
          />

          <div className="flex flex-wrap gap-1">
            {['#ffffff', '#000000', '#f3f4f6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
              <button
                key={c}
                onClick={() =>
                  onChange({
                    bgColor: c,
                    bgType: 'color',
                  })
                }
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
