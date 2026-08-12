import React from 'react';
import { EditSettings, Language, ImageFileItem } from '../../types';
import { translations } from '../../translations';
import { FileText, FileDown, Layers, Download } from 'lucide-react';

interface PdfControlsProps {
  lang: Language;
  files: ImageFileItem[];
  onConvertImagesToPdf: () => void;
  onExtractPdfPages: () => void;
  isProcessing: boolean;
}

export const PdfControls: React.FC<PdfControlsProps> = ({
  lang,
  files,
  onConvertImagesToPdf,
  onExtractPdfPages,
  isProcessing,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      {/* Images to PDF */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {t.tool_images_to_pdf_title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.tool_images_to_pdf_desc}
            </p>
          </div>
        </div>

        <button
          onClick={onConvertImagesToPdf}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Convert {files.length} Image(s) to PDF</span>
        </button>
      </div>

      {/* PDF to Images */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2">
          <FileDown className="w-5 h-5 text-rose-500" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {t.tool_pdf_to_images_title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.tool_pdf_to_images_desc}
            </p>
          </div>
        </div>

        <button
          onClick={onExtractPdfPages}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Layers className="w-4 h-4" />
          <span>Extract PDF Pages to Images</span>
        </button>
      </div>
    </div>
  );
};
