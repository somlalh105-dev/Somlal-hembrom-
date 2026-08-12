import React, { useState } from 'react';
import { EditSettings, Language, ImageFileItem } from '../../types';
import { translations } from '../../translations';
import { performOCR } from '../../utils/ocrUtils';
import {
  Layers,
  LayoutGrid,
  Smile,
  QrCode,
  ScanText,
  Copy,
  Check,
  Sparkles,
  Download
} from 'lucide-react';

interface AdvancedControlsProps {
  lang: Language;
  activeFile: ImageFileItem | null;
  files: ImageFileItem[];
  settings: EditSettings;
  onChange: (updates: Partial<EditSettings>) => void;
  onMergeImages: () => void;
  isProcessing: boolean;
  onAiMemeCaption: () => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  lang,
  activeFile,
  files,
  settings,
  onChange,
  onMergeImages,
  isProcessing,
  onAiMemeCaption,
}) => {
  const t = translations[lang];
  const [ocrText, setOcrText] = useState<string>('');
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [copiedOcr, setCopiedOcr] = useState<boolean>(false);

  const handleRunOcr = async () => {
    if (!activeFile) return;
    setIsOcrLoading(true);
    setOcrText('Extracting text from image...');
    try {
      const text = await performOCR(activeFile.previewUrl);
      setOcrText(text);
    } catch (e) {
      setOcrText('Failed to extract text from image.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleCopyOcr = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Meme Generator */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-indigo-500" />
            {t.tool_meme_generator_title}
          </h4>

          <button
            onClick={onAiMemeCaption}
            disabled={!activeFile || isProcessing}
            className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg flex items-center gap-1 hover:bg-indigo-200"
          >
            <Sparkles className="w-3 h-3" />
            AI Meme Generator
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={settings.memeTopText}
            onChange={(e) => onChange({ memeTopText: e.target.value })}
            placeholder={t.textTop + ' (e.g., WHEN CODE BUILDS ON FIRST TRY)'}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold uppercase"
          />

          <input
            type="text"
            value={settings.memeBottomText}
            onChange={(e) => onChange({ memeBottomText: e.target.value })}
            placeholder={t.textBottom + ' (e.g., ABSOLUTE CINEMA)'}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold uppercase"
          />
        </div>
      </div>

      {/* Image Merger */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          {t.tool_image_merger_title}
        </h4>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'horizontal', label: 'Side-by-Side' },
            { id: 'vertical', label: 'Stacked' },
            { id: 'grid', label: 'Grid' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                onChange({ mergeDirection: mode.id as EditSettings['mergeDirection'] })
              }
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-xl border transition-colors ${
                settings.mergeDirection === mode.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <button
          onClick={onMergeImages}
          disabled={files.length < 2 || isProcessing}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Merge {files.length} Images</span>
        </button>
      </div>

      {/* QR Code Embedder */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-indigo-500" />
          {t.tool_qr_embed_title}
        </h4>

        <input
          type="text"
          value={settings.qrText}
          onChange={(e) => onChange({ qrText: e.target.value })}
          placeholder={t.qrContent}
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Image to Text OCR */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <ScanText className="w-4 h-4 text-indigo-500" />
            {t.tool_ocr_title}
          </h4>

          <button
            onClick={handleRunOcr}
            disabled={!activeFile || isOcrLoading}
            className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isOcrLoading ? 'Extracting...' : 'Extract Text'}
          </button>
        </div>

        {ocrText && (
          <div className="relative p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleCopyOcr}
              className="absolute top-2 right-2 p-1 text-slate-500 hover:text-indigo-600 transition-colors"
              title={t.copyText}
            >
              {copiedOcr ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto pr-6">
              {ocrText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
