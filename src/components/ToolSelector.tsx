import React from 'react';
import { ToolCategory, ToolId, Language } from '../types';
import { translations } from '../translations';
import {
  Scaling,
  RefreshCw,
  Zap,
  Crop,
  RotateCw,
  Sliders,
  Sparkles,
  Stamp,
  Square,
  Scissors,
  Droplets,
  Palette,
  FileText,
  FileDown,
  Layers,
  LayoutGrid,
  Smile,
  QrCode,
  ScanText,
  Boxes,
  Info,
  Star
} from 'lucide-react';

interface ToolSelectorProps {
  lang: Language;
  activeCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  favorites: ToolId[];
  onToggleFavorite: (tool: ToolId) => void;
  searchQuery: string;
}

interface ToolDefinition {
  id: ToolId;
  category: ToolCategory;
  titleKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
  icon: React.FC<{ className?: string }>;
  isPopular?: boolean;
}

export const toolsList: ToolDefinition[] = [
  { id: 'resize', category: 'resize', titleKey: 'tool_resize_title', descKey: 'tool_resize_desc', icon: Scaling, isPopular: true },
  { id: 'convert', category: 'convert', titleKey: 'tool_convert_title', descKey: 'tool_convert_desc', icon: RefreshCw, isPopular: true },
  { id: 'compress', category: 'compress', titleKey: 'tool_compress_title', descKey: 'tool_compress_desc', icon: Zap, isPopular: true },
  { id: 'crop', category: 'crop', titleKey: 'tool_crop_title', descKey: 'tool_crop_desc', icon: Crop, isPopular: true },
  { id: 'rotate-flip', category: 'edit', titleKey: 'tool_rotate_flip_title', descKey: 'tool_rotate_flip_desc', icon: RotateCw },
  { id: 'filters', category: 'edit', titleKey: 'tool_filters_title', descKey: 'tool_filters_desc', icon: Sparkles },
  { id: 'adjustments', category: 'edit', titleKey: 'tool_adjustments_title', descKey: 'tool_adjustments_desc', icon: Sliders },
  { id: 'watermark', category: 'edit', titleKey: 'tool_watermark_title', descKey: 'tool_watermark_desc', icon: Stamp },
  { id: 'border', category: 'edit', titleKey: 'tool_border_title', descKey: 'tool_border_desc', icon: Square },
  { id: 'bg-remove', category: 'background', titleKey: 'tool_bg_remove_title', descKey: 'tool_bg_remove_desc', icon: Scissors, isPopular: true },
  { id: 'bg-blur', category: 'background', titleKey: 'tool_bg_blur_title', descKey: 'tool_bg_blur_desc', icon: Droplets },
  { id: 'bg-color', category: 'background', titleKey: 'tool_bg_color_title', descKey: 'tool_bg_color_desc', icon: Palette },
  { id: 'images-to-pdf', category: 'pdf', titleKey: 'tool_images_to_pdf_title', descKey: 'tool_images_to_pdf_desc', icon: FileText, isPopular: true },
  { id: 'pdf-to-images', category: 'pdf', titleKey: 'tool_pdf_to_images_title', descKey: 'tool_pdf_to_images_desc', icon: FileDown },
  { id: 'image-merger', category: 'advanced', titleKey: 'tool_image_merger_title', descKey: 'tool_image_merger_desc', icon: Layers },
  { id: 'collage-maker', category: 'advanced', titleKey: 'tool_collage_maker_title', descKey: 'tool_collage_maker_desc', icon: LayoutGrid },
  { id: 'meme-generator', category: 'advanced', titleKey: 'tool_meme_generator_title', descKey: 'tool_meme_generator_desc', icon: Smile },
  { id: 'qr-embed', category: 'advanced', titleKey: 'tool_qr_embed_title', descKey: 'tool_qr_embed_desc', icon: QrCode },
  { id: 'ocr', category: 'advanced', titleKey: 'tool_ocr_title', descKey: 'tool_ocr_desc', icon: ScanText, isPopular: true },
  { id: 'batch-process', category: 'batch', titleKey: 'tool_batch_process_title', descKey: 'tool_batch_process_desc', icon: Boxes },
  { id: 'exif-viewer', category: 'advanced', titleKey: 'tool_exif_viewer_title', descKey: 'tool_exif_viewer_desc', icon: Info },
];

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  lang,
  activeCategory,
  onSelectCategory,
  activeTool,
  onSelectTool,
  favorites,
  onToggleFavorite,
  searchQuery,
}) => {
  const t = translations[lang];

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: t.cat_all },
    { id: 'resize', label: t.cat_resize },
    { id: 'convert', label: t.cat_convert },
    { id: 'compress', label: t.cat_compress },
    { id: 'crop', label: t.cat_crop },
    { id: 'edit', label: t.cat_edit },
    { id: 'background', label: t.cat_background },
    { id: 'pdf', label: t.cat_pdf },
    { id: 'advanced', label: t.cat_advanced },
    { id: 'batch', label: t.cat_batch },
  ];

  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const title = t[tool.titleKey].toLowerCase();
    const desc = t[tool.descKey].toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || title.includes(query) || desc.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const isFav = favorites.includes(tool.id);

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`group relative p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className="text-slate-300 dark:text-slate-700 hover:text-amber-400 dark:hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {t[tool.titleKey]}
              </h3>

              {tool.isPopular && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 rounded-md">
                  HOT
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
