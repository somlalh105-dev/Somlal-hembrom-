import React, { useState, useRef, useEffect } from 'react';
import { ImageFileItem, Language, EditSettings } from '../types';
import { translations } from '../translations';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Columns, 
  Info, 
  Download, 
  Check, 
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ImagePreviewCanvasProps {
  lang: Language;
  activeFile: ImageFileItem | null;
  processedResultUrl?: string;
  processedSize?: number;
  settings: EditSettings;
  onUpdateCropRect?: (rect: { x: number; y: number; width: number; height: number }) => void;
  onOpenExifModal: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

export const ImagePreviewCanvas: React.FC<ImagePreviewCanvasProps> = ({
  lang,
  activeFile,
  processedResultUrl,
  processedSize,
  settings,
  onOpenExifModal,
  onDownload,
  isProcessing,
}) => {
  const t = translations[lang];
  const [zoom, setZoom] = useState(1);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSliderPos, setCompareSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(1);
  }, [activeFile?.id]);

  if (!activeFile) {
    return (
      <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-600">
        <Eye className="w-12 h-12 mb-3 stroke-[1.5]" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          No image selected for preview
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Upload an image above to start editing
        </p>
      </div>
    );
  }

  const originalSizeKb = (activeFile.originalSize / 1024).toFixed(1);
  const processedSizeKb = processedSize ? (processedSize / 1024).toFixed(1) : originalSizeKb;
  const savingsPct = processedSize && activeFile.originalSize > 0
    ? Math.round(((activeFile.originalSize - processedSize) / activeFile.originalSize) * 100)
    : 0;

  const displayUrl = processedResultUrl || activeFile.previewUrl;

  return (
    <div className="space-y-3">
      {/* Top Preview Canvas Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Dimensions & File Size Comparison */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {activeFile.originalWidth} x {activeFile.originalHeight} px
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Orig: {originalSizeKb} KB
          </span>

          {processedSize && processedSize !== activeFile.originalSize && (
            <>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {processedSizeKb} KB ({savingsPct > 0 ? `-${savingsPct}%` : `+${Math.abs(savingsPct)}%`})
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Compare Before/After Toggle */}
          {processedResultUrl && (
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                isCompareMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{t.beforeAfter}</span>
            </button>
          )}

          {/* EXIF Metadata Button */}
          <button
            onClick={onOpenExifModal}
            title="View Image EXIF Metadata"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={onDownload}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadSingle}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[460px] rounded-3xl bg-slate-900/90 dark:bg-black overflow-hidden flex items-center justify-center p-4 border border-slate-800 select-none shadow-inner"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p className="text-xs font-semibold">{t.processingText}</p>
          </div>
        )}

        {/* Side-by-Side Compare Mode Slider */}
        {isCompareMode && processedResultUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Original Image (Left Layer) */}
            <img
              src={activeFile.previewUrl}
              alt="Original"
              style={{ transform: `scale(${zoom})` }}
              className="max-w-full max-h-full object-contain pointer-events-none transition-transform"
            />

            {/* Processed Overlay clipped by compare slider */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center"
              style={{ clipPath: `inset(0 0 0 ${compareSliderPos}%)` }}
            >
              <img
                src={processedResultUrl}
                alt="Processed"
                style={{ transform: `scale(${zoom})` }}
                className="max-w-full max-h-full object-contain pointer-events-none transition-transform"
              />
            </div>

            {/* Comparison Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${compareSliderPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg">
                ↔
              </div>
            </div>

            {/* Slider Input overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={compareSliderPos}
              onChange={(e) => setCompareSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-25 w-full h-full"
            />

            {/* Labels */}
            <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-md backdrop-blur-md">
              {t.original}
            </span>
            <span className="absolute top-3 right-3 px-2 py-1 bg-indigo-600/90 text-white text-[10px] font-bold rounded-md backdrop-blur-md">
              {t.processed}
            </span>
          </div>
        ) : (
          /* Normal Single Image Preview */
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={displayUrl}
              alt="Preview"
              className="max-w-full max-h-[420px] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};
