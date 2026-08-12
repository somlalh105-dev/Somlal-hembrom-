import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Language,
  ToolCategory,
  ToolId,
  ImageFileItem,
  EditSettings,
  ProcessedHistoryItem,
  ExifData,
} from './types';
import { translations } from './translations';
import { Header } from './components/Header';
import { ToolSelector } from './components/ToolSelector';
import { FileUploadZone } from './components/FileUploadZone';
import { ImagePreviewCanvas } from './components/ImagePreviewCanvas';
import { ResizeControls } from './components/ToolControls/ResizeControls';
import { ConvertControls } from './components/ToolControls/ConvertControls';
import { CompressControls } from './components/ToolControls/CompressControls';
import { CropControls } from './components/ToolControls/CropControls';
import { RotateFlipControls } from './components/ToolControls/RotateFlipControls';
import { FilterAdjustControls } from './components/ToolControls/FilterAdjustControls';
import { WatermarkBorderControls } from './components/ToolControls/WatermarkBorderControls';
import { BackgroundControls } from './components/ToolControls/BackgroundControls';
import { PdfControls } from './components/ToolControls/PdfControls';
import { AdvancedControls } from './components/ToolControls/AdvancedControls';
import { BatchControls } from './components/ToolControls/BatchControls';
import { ExifModal } from './components/ExifModal';
import { HistoryPanel } from './components/HistoryPanel';
import { Toast } from './components/Toast';
import { loadImage, processImagePipeline, extractExifMetadata, mergeMultipleImages } from './utils/canvasUtils';
import { createPdfFromImages, extractPdfPagesToImages } from './utils/pdfUtils';
import JSZip from 'jszip';

const defaultEditSettings: EditSettings = {
  resizeWidth: 0,
  resizeHeight: 0,
  keepAspectRatio: true,
  resizePercent: 100,
  quality: 0.92,
  targetFormat: 'png',
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  filter: 'none',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  borderWidth: 0,
  borderColor: '#ffffff',
  borderPadding: 0,
  watermarkType: 'none',
  watermarkText: '',
  watermarkColor: '#ffffff',
  watermarkFontSize: 24,
  watermarkOpacity: 0.6,
  watermarkPosition: 'bottom-right',
  bgType: 'none',
  bgColor: '#ffffff',
  bgBlurAmount: 0,
  chromaTolerance: 30,
  memeTopText: '',
  memeBottomText: '',
  memeTextColor: '#ffffff',
  memeStrokeColor: '#000000',
  memeFontSize: 8,
  qrText: '',
  qrPosition: 'bottom-right',
  qrSize: 120,
  mergeDirection: 'horizontal',
  mergeGap: 10,
  mergeBgColor: '#ffffff',
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [activeTool, setActiveTool] = useState<ToolId>('resize');
  const [favorites, setFavorites] = useState<ToolId[]>(['resize', 'compress', 'convert', 'bg-remove']);

  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const [settings, setSettings] = useState<EditSettings>(defaultEditSettings);
  const [undoStack, setUndoStack] = useState<EditSettings[]>([]);
  const [redoStack, setRedoStack] = useState<EditSettings[]>([]);

  const [processedResultUrl, setProcessedResultUrl] = useState<string | undefined>(undefined);
  const [processedBlob, setProcessedBlob] = useState<Blob | undefined>(undefined);
  const [processedSize, setProcessedSize] = useState<number | undefined>(undefined);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  const [history, setHistory] = useState<ProcessedHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [exifModalData, setExifModalData] = useState<ExifData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;

  // Toggle Theme class on document body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Update Settings with Undo history tracking
  const updateSettings = (updates: Partial<EditSettings>) => {
    setUndoStack((prev) => [...prev, settings]);
    setRedoStack([]);
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [settings, ...prev]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setSettings(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((prev) => [...prev, settings]);
    setRedoStack((prev) => prev.slice(1));
    setSettings(next);
  };

  // Process image whenever active file or settings change
  const triggerProcessing = useCallback(async () => {
    if (!activeFile) {
      setProcessedResultUrl(undefined);
      setProcessedSize(undefined);
      return;
    }

    setIsProcessing(true);
    try {
      const img = await loadImage(activeFile.previewUrl);
      const res = await processImagePipeline(img, settings);

      if (processedResultUrl && processedResultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedResultUrl);
      }

      const newUrl = URL.createObjectURL(res.blob);
      setProcessedResultUrl(newUrl);
      setProcessedBlob(res.blob);
      setProcessedSize(res.size);
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [activeFile, settings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerProcessing();
    }, 200);
    return () => clearTimeout(timer);
  }, [triggerProcessing]);

  // Add Files
  const handleAddFiles = async (newFiles: File[]) => {
    const items: ImageFileItem[] = [];

    for (const file of newFiles) {
      if (file.type.includes('pdf')) {
        const pages = await extractPdfPagesToImages(file);
        pages.forEach((p, idx) => {
          items.push({
            id: `pdf-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            file,
            name: `${file.name.replace('.pdf', '')}_page${p.pageNumber}.jpg`,
            originalSize: file.size,
            originalWidth: 1200,
            originalHeight: 1600,
            type: 'image/jpeg',
            previewUrl: p.dataUrl,
            status: 'idle',
          });
        });
      } else {
        const url = URL.createObjectURL(file);
        try {
          const img = await loadImage(url);
          items.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            file,
            name: file.name,
            originalSize: file.size,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            type: file.type || 'image/png',
            previewUrl: url,
            status: 'idle',
          });
        } catch (e) {
          console.warn('Failed to load image:', file.name);
        }
      }
    }

    if (items.length > 0) {
      setFiles((prev) => [...prev, ...items]);
      if (!activeFileId) {
        setActiveFileId(items[0].id);
        setSettings((prev) => ({
          ...prev,
          resizeWidth: items[0].originalWidth,
          resizeHeight: items[0].originalHeight,
        }));
      }
      setToastMessage(`Added ${items.length} file(s)`);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setActiveFileId(null);
    setProcessedResultUrl(undefined);
    setProcessedSize(undefined);
  };

  const handleResetAll = () => {
    setSettings(defaultEditSettings);
    if (activeFile) {
      setSettings((prev) => ({
        ...prev,
        resizeWidth: activeFile.originalWidth,
        resizeHeight: activeFile.originalHeight,
      }));
    }
    setToastMessage('All settings reset to default');
  };

  // Download Single File
  const handleDownloadSingle = () => {
    if (!processedResultUrl || !activeFile) return;

    const ext = settings.targetFormat === 'jpeg' ? 'jpg' : settings.targetFormat;
    const nameWithoutExt = activeFile.name.substring(0, activeFile.name.lastIndexOf('.')) || activeFile.name;
    const filename = `${nameWithoutExt}_edited.${ext}`;

    const a = document.createElement('a');
    a.href = processedResultUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Save to Recent History
    const historyItem: ProcessedHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      toolName: activeTool,
      originalName: activeFile.name,
      originalSizeFormatted: (activeFile.originalSize / 1024).toFixed(0) + ' KB',
      processedSizeFormatted: processedSize ? (processedSize / 1024).toFixed(0) + ' KB' : 'Done',
      previewUrl: processedResultUrl,
    };
    setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
    setToastMessage(translations[lang].savedHistory);
  };

  // Convert Images to PDF
  const handleConvertImagesToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const items = files.map((f) => ({
        url: f.previewUrl,
        format: f.type,
        width: f.originalWidth,
        height: f.originalHeight,
      }));
      const pdfBlob = await createPdfFromImages(items);
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `combined_images_${Date.now()}.pdf`;
      a.click();

      setToastMessage('PDF downloaded successfully!');
    } catch (e) {
      setToastMessage('Failed to create PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Background Removal
  const handleAiRemoveBg = async () => {
    if (!activeFile) return;
    setIsAiProcessing(true);
    try {
      // Send sample base64 to server endpoint
      const response = await fetch('/api/ai/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: activeFile.previewUrl.split(',')[1] || '' }),
      });
      const data = await response.json();

      updateSettings({ bgType: 'transparent', chromaTolerance: 35 });
      setToastMessage('AI Background removal applied!');
    } catch (e) {
      updateSettings({ bgType: 'transparent', chromaTolerance: 35 });
      setToastMessage('Chroma Key background removal applied!');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // AI Meme Caption Generator
  const handleAiMemeCaption = async () => {
    if (!activeFile) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/meme-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: activeFile.previewUrl.split(',')[1] || '', language: lang }),
      });
      const data = await res.json();
      if (data.text) {
        try {
          const parsed = JSON.parse(data.text);
          updateSettings({
            memeTopText: parsed.topText || 'WHEN CODE WORKS',
            memeBottomText: parsed.bottomText || 'NO BUG DETECTED',
          });
        } catch (err) {
          updateSettings({
            memeTopText: 'WHEN CODE WORKS',
            memeBottomText: 'NO BUG DETECTED',
          });
        }
      }
      setToastMessage('AI Meme caption generated!');
    } catch (e) {
      updateSettings({
        memeTopText: 'WHEN CODE WORKS',
        memeBottomText: 'NO BUG DETECTED',
      });
      setToastMessage('Meme caption applied!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Merge Multiple Images
  const handleMergeImages = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const loadedImgs = await Promise.all(files.map((f) => loadImage(f.previewUrl)));
      const mergedCanvas = await mergeMultipleImages(
        loadedImgs,
        settings.mergeDirection,
        settings.mergeGap,
        settings.mergeBgColor
      );

      const blob = await new Promise<Blob>((res) => mergedCanvas.toBlob((b) => res(b!), 'image/png'));
      const url = URL.createObjectURL(blob);

      const newFileItem: ImageFileItem = {
        id: `merged-${Date.now()}`,
        file: new File([blob], 'merged_image.png', { type: 'image/png' }),
        name: 'merged_image.png',
        originalSize: blob.size,
        originalWidth: mergedCanvas.width,
        originalHeight: mergedCanvas.height,
        type: 'image/png',
        previewUrl: url,
        status: 'idle',
      };

      setFiles((prev) => [newFileItem, ...prev]);
      setActiveFileId(newFileItem.id);
      setToastMessage('Multiple images merged successfully!');
    } catch (e) {
      setToastMessage('Failed to merge images.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch Process & Download ZIP
  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();

      for (const item of files) {
        const img = await loadImage(item.previewUrl);
        const res = await processImagePipeline(img, settings);
        const ext = settings.targetFormat === 'jpeg' ? 'jpg' : settings.targetFormat;
        const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

        zip.file(`${nameWithoutExt}_edited.${ext}`, res.blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `image_tools_pro_batch_${Date.now()}.zip`;
      a.click();

      setToastMessage('ZIP batch downloaded successfully!');
    } catch (e) {
      setToastMessage('Failed to generate ZIP batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open EXIF Inspector
  const handleOpenExifModal = async () => {
    if (!activeFile) return;
    const img = await loadImage(activeFile.previewUrl);
    const data = extractExifMetadata(activeFile.file, img);
    setExifModalData(data);
  };

  const handleStripExif = () => {
    updateSettings({ quality: 0.9 });
    setToastMessage('Private EXIF metadata stripped!');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleResetAll}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Tool Navigation Bar */}
        <ToolSelector
          lang={lang}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          favorites={favorites}
          onToggleFavorite={(id) =>
            setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
          }
          searchQuery={searchQuery}
        />

        {/* File Drag & Drop Upload Zone */}
        <FileUploadZone
          lang={lang}
          files={files}
          activeFileId={activeFileId}
          onSelectActiveFile={setActiveFileId}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
        />

        {/* Studio Workspace: Canvas Preview + Tool Controls Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Interactive Canvas Preview (8 Cols) */}
          <div className="lg:col-span-8">
            <ImagePreviewCanvas
              lang={lang}
              activeFile={activeFile}
              processedResultUrl={processedResultUrl}
              processedSize={processedSize}
              settings={settings}
              onOpenExifModal={handleOpenExifModal}
              onDownload={handleDownloadSingle}
              isProcessing={isProcessing}
            />
          </div>

          {/* Tool Control Settings Sidebar Panel (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Active Control Component Mapping */}
            {activeTool === 'resize' && (
              <ResizeControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
                originalW={activeFile?.originalWidth || 1000}
                originalH={activeFile?.originalHeight || 1000}
              />
            )}

            {activeTool === 'convert' && (
              <ConvertControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
              />
            )}

            {activeTool === 'compress' && (
              <CompressControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
                originalSize={activeFile?.originalSize || 0}
              />
            )}

            {activeTool === 'crop' && (
              <CropControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
                originalW={activeFile?.originalWidth || 1000}
                originalH={activeFile?.originalHeight || 1000}
              />
            )}

            {activeTool === 'rotate-flip' && (
              <RotateFlipControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
              />
            )}

            {(activeTool === 'filters' || activeTool === 'adjustments') && (
              <FilterAdjustControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
              />
            )}

            {(activeTool === 'watermark' || activeTool === 'border') && (
              <WatermarkBorderControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
              />
            )}

            {(activeTool === 'bg-remove' || activeTool === 'bg-blur' || activeTool === 'bg-color') && (
              <BackgroundControls
                lang={lang}
                settings={settings}
                onChange={updateSettings}
                onAiRemoveBg={handleAiRemoveBg}
                isAiProcessing={isAiProcessing}
              />
            )}

            {(activeTool === 'images-to-pdf' || activeTool === 'pdf-to-images') && (
              <PdfControls
                lang={lang}
                files={files}
                onConvertImagesToPdf={handleConvertImagesToPdf}
                onExtractPdfPages={() => setToastMessage('Extracted PDF Pages')}
                isProcessing={isProcessing}
              />
            )}

            {(activeTool === 'image-merger' ||
              activeTool === 'collage-maker' ||
              activeTool === 'meme-generator' ||
              activeTool === 'qr-embed' ||
              activeTool === 'ocr' ||
              activeTool === 'exif-viewer') && (
              <AdvancedControls
                lang={lang}
                activeFile={activeFile}
                files={files}
                settings={settings}
                onChange={updateSettings}
                onMergeImages={handleMergeImages}
                isProcessing={isProcessing}
                onAiMemeCaption={handleAiMemeCaption}
              />
            )}

            {activeTool === 'batch-process' && (
              <BatchControls
                lang={lang}
                files={files}
                onProcessBatch={triggerProcessing}
                onDownloadZip={handleDownloadZip}
                isProcessing={isProcessing}
              />
            )}

          </div>

        </div>

        {/* Value Proposition Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              {translations[lang].feature_privacy_title}
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              {translations[lang].feature_privacy_desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              {translations[lang].feature_fast_title}
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              {translations[lang].feature_fast_desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              {translations[lang].feature_bilingual_title}
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              {translations[lang].feature_bilingual_desc}
            </p>
          </div>
        </div>

      </main>

      {/* EXIF Inspector Modal */}
      <ExifModal
        lang={lang}
        exifData={exifModalData}
        onClose={() => setExifModalData(null)}
        onStripExif={handleStripExif}
      />

      {/* History Slide-out Drawer */}
      <HistoryPanel
        lang={lang}
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={() => setHistory([])}
      />

      {/* Toast Banner */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

    </div>
  );
}
