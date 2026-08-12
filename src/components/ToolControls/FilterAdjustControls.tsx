import React from 'react';
import { EditSettings, Language } from '../../types';
import { translations } from '../../translations';
import { Sparkles, Sliders, Sun, Contrast, Droplets } from 'lucide-react';

interface FilterAdjustControlsProps {
  lang: Language;
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
}

export const FilterAdjustControls: React.FC<FilterAdjustControlsProps> = ({
  lang,
  settings,
  onChange,
}) => {
  const t = translations[lang];

  const filtersList: { id: EditSettings['filter']; name: string; previewClass: string }[] = [
    { id: 'none', name: 'Original', previewClass: '' },
    { id: 'grayscale', name: 'B&W', previewClass: 'grayscale' },
    { id: 'sepia', name: 'Sepia', previewClass: 'sepia' },
    { id: 'vintage', name: 'Vintage', previewClass: 'sepia contrast-125' },
    { id: 'cool', name: 'Cool', previewClass: 'hue-rotate-180' },
    { id: 'warm', name: 'Warm', previewClass: 'sepia-50 saturate-150' },
    { id: 'invert', name: 'Invert', previewClass: 'invert' },
    { id: 'vivid', name: 'Vivid', previewClass: 'saturate-200' },
    { id: 'cyberpunk', name: 'Cyberpunk', previewClass: 'hue-rotate-270 saturate-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Preset Filters */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          {t.tool_filters_title}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {filtersList.map((f) => {
            const isSelected = settings.filter === f.id;

            return (
              <button
                key={f.id}
                onClick={() => onChange({ filter: f.id })}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adjustment Sliders */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          {t.tool_adjustments_title}
        </h3>

        {/* Brightness */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> {t.brightness}
            </span>
            <span className="font-mono text-indigo-600">{settings.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.brightness}
            onChange={(e) => onChange({ brightness: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Contrast className="w-3.5 h-3.5 text-indigo-500" /> {t.contrast}
            </span>
            <span className="font-mono text-indigo-600">{settings.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.contrast}
            onChange={(e) => onChange({ contrast: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-pink-500" /> {t.saturation}
            </span>
            <span className="font-mono text-indigo-600">{settings.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.saturation}
            onChange={(e) => onChange({ saturation: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
            <span>{t.blur}</span>
            <span className="font-mono text-indigo-600">{settings.blur} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={settings.blur}
            onChange={(e) => onChange({ blur: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
