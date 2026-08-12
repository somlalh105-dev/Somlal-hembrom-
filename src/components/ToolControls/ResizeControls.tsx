import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations, socialPresets } from '../../translations';
import { Link2, Link2Off, Percent, Scaling, Check } from 'lucide-react';

interface ResizeControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
  originalW: number;
  originalH: number;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  lang,
  settings,
  onChange,
  originalW,
  originalH,
}) => {
  const t = translations[lang];

  const handleWidthChange = (val: number) => {
    if (settings.keepAspectRatio && originalW > 0) {
      const ratio = originalH / originalW;
      onChange({
        resizeWidth: val,
        resizeHeight: Math.round(val * ratio),
        resizePercent: 100,
      });
    } else {
      onChange({ resizeWidth: val, resizePercent: 100 });
    }
  };

  const handleHeightChange = (val: number) => {
    if (settings.keepAspectRatio && originalH > 0) {
      const ratio = originalW / originalH;
      onChange({
        resizeHeight: val,
        resizeWidth: Math.round(val * ratio),
        resizePercent: 100,
      });
    } else {
      onChange({ resizeHeight: val, resizePercent: 100 });
    }
  };

  const handlePercentSelect = (pct: number) => {
    const newW = Math.round((originalW * pct) / 100);
    const newH = Math.round((originalH * pct) / 100);
    onChange({
      resizePercent: pct,
      resizeWidth: newW,
      resizeHeight: newH,
    });
  };

  const handlePresetSelect = (preset: typeof socialPresets[0]) => {
    onChange({
      resizeWidth: preset.width,
      resizeHeight: preset.height,
      keepAspectRatio: false,
      resizePercent: 100,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Scaling className="w-4 h-4 text-indigo-500" />
        {t.tool_resize_title}
      </h3>

      {/* Percentage Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
          {t.preset_percentage}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[25, 50, 75, 100, 150, 200].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentSelect(pct)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                settings.resizePercent === pct
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Custom Width x Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
            {t.width}
          </label>
          <input
            type="number"
            min="10"
            max="10000"
            value={settings.resizeWidth || originalW}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
            {t.height}
          </label>
          <input
            type="number"
            min="10"
            max="10000"
            value={settings.resizeHeight || originalH}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
          />
        </div>
      </div>

      {/* Aspect Ratio Lock button */}
      <button
        onClick={() => onChange({ keepAspectRatio: !settings.keepAspectRatio })}
        className={`w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border transition-colors ${
          settings.keepAspectRatio
            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
        }`}
      >
        {settings.keepAspectRatio ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
        <span>{t.lockAspect} ({settings.keepAspectRatio ? 'ON' : 'OFF'})</span>
      </button>

      {/* Social Media Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
          {t.preset_social}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {socialPresets.map((preset) => {
            const isSelected =
              settings.resizeWidth === preset.width && settings.resizeHeight === preset.height;
            const title = lang === 'hi' ? preset.nameHi : preset.nameEn;

            return (
              <button
                key={preset.nameEn}
                onClick={() => handlePresetSelect(preset)}
                className={`p-2 text-left rounded-xl border text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="font-bold truncate">{title}</div>
                <div className="text-[10px] opacity-80">{preset.width}x{preset.height} px</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
