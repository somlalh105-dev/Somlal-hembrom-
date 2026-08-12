import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { Stamp, Square, Type, Palette } from 'lucide-react';

interface WatermarkBorderControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
}

export const WatermarkBorderControls: React.FC<WatermarkBorderControlsProps> = ({
  lang,
  settings,
  onChange,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      {/* Watermark Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Stamp className="w-4 h-4 text-indigo-500" />
          {t.tool_watermark_title}
        </h3>

        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              {t.watermarkText}
            </label>
            <input
              type="text"
              value={settings.watermarkText}
              onChange={(e) =>
                onChange({
                  watermarkText: e.target.value,
                  watermarkType: e.target.value ? 'text' : 'none',
                })
              }
              placeholder="e.g. © My Brand / Confidential"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                {t.watermarkColor}
              </label>
              <input
                type="color"
                value={settings.watermarkColor || '#ffffff'}
                onChange={(e) => onChange({ watermarkColor: e.target.value })}
                className="w-full h-8 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                {t.position}
              </label>
              <select
                value={settings.watermarkPosition}
                onChange={(e) =>
                  onChange({ watermarkPosition: e.target.value as EditSettings['watermarkPosition'] })
                }
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="bottom-right">{t.bottomRight}</option>
                <option value="bottom-left">{t.bottomLeft}</option>
                <option value="center">{t.center}</option>
                <option value="top-right">{t.topRight}</option>
                <option value="top-left">{t.topLeft}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              <span>{t.opacity}</span>
              <span className="font-mono text-indigo-600">
                {Math.round((settings.watermarkOpacity || 0.6) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.watermarkOpacity || 0.6}
              onChange={(e) => onChange({ watermarkOpacity: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Border Section */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Square className="w-4 h-4 text-indigo-500" />
          {t.tool_border_title}
        </h3>

        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Border Width
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.borderWidth || 0}
                onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Border Color
              </label>
              <input
                type="color"
                value={settings.borderColor || '#ffffff'}
                onChange={(e) => onChange({ borderColor: e.target.value })}
                className="w-full h-8 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
