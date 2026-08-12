export type Language = 'en' | 'hi';

export type ToolCategory = 
  | 'all'
  | 'resize'
  | 'convert'
  | 'compress'
  | 'crop'
  | 'edit'
  | 'background'
  | 'pdf'
  | 'advanced'
  | 'batch';

export type ToolId = 
  | 'resize'
  | 'convert'
  | 'compress'
  | 'crop'
  | 'rotate-flip'
  | 'filters'
  | 'adjustments'
  | 'watermark'
  | 'border'
  | 'bg-remove'
  | 'bg-blur'
  | 'bg-color'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'image-merger'
  | 'collage-maker'
  | 'meme-generator'
  | 'qr-embed'
  | 'ocr'
  | 'batch-process'
  | 'exif-viewer';

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  type: string;
  previewUrl: string;
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'pdf' | 'bmp' | 'svg';

export interface SocialPreset {
  nameEn: string;
  nameHi: string;
  width: number;
  height: number;
  category: 'Instagram' | 'Facebook' | 'WhatsApp' | 'Twitter' | 'YouTube' | 'Document';
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  isCircle?: boolean;
}

export interface EditSettings {
  // Resize
  resizeWidth: number;
  resizeHeight: number;
  keepAspectRatio: boolean;
  resizePercent: number;
  quality: number; // 0.1 to 1.0

  // Format
  targetFormat: ImageFormat;

  // Compression
  targetSizeKB?: number;

  // Crop
  cropRect?: CropRect;

  // Rotate & Flip
  rotation: number; // 0, 90, 180, 270 or custom
  flipHorizontal: boolean;
  flipVertical: boolean;

  // Adjustments & Filters
  filter: 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cool' | 'warm' | 'invert' | 'vivid' | 'cyberpunk';
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  hue: number; // -180 to 180 (0 default)
  blur: number; // 0 to 20 px
  sharpen: number; // 0 to 100

  // Border
  borderWidth: number; // 0 to 50
  borderColor: string;
  borderPadding: number;

  // Watermark
  watermarkType: 'none' | 'text' | 'image';
  watermarkText: string;
  watermarkColor: string;
  watermarkFontSize: number;
  watermarkOpacity: number; // 0 to 1
  watermarkPosition: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile';
  watermarkImageUri?: string;

  // Background
  bgType: 'none' | 'color' | 'blur' | 'transparent' | 'image' | 'ai-remove';
  bgColor: string;
  bgBlurAmount: number;
  bgCustomImageUri?: string;
  chromaTolerance: number;

  // Meme
  memeTopText: string;
  memeBottomText: string;
  memeTextColor: string;
  memeStrokeColor: string;
  memeFontSize: number;

  // QR Code
  qrText: string;
  qrPosition: 'top-right' | 'bottom-right' | 'center';
  qrSize: number;

  // Collage / Merge
  mergeDirection: 'horizontal' | 'vertical' | 'grid';
  mergeGap: number;
  mergeBgColor: string;
}

export interface ProcessedHistoryItem {
  id: string;
  timestamp: string;
  toolName: string;
  originalName: string;
  originalSizeFormatted: string;
  processedSizeFormatted: string;
  previewUrl: string;
}

export interface ExifData {
  fileName: string;
  fileSize: string;
  fileType: string;
  dimensions: string;
  aspectRatio: string;
  colorDepth: string;
  lastModified: string;
}
