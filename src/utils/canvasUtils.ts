import { EditSettings, ImageFormat, ExifData } from '../types';
import QRCode from 'qrcode';

// Load image safely from Blob or File URL
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

// Convert canvas to Blob with target format and quality
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: ImageFormat = 'png',
  quality: number = 0.92
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    let mimeType = 'image/png';
    if (format === 'jpeg') mimeType = 'image/jpeg';
    if (format === 'webp') mimeType = 'image/webp';
    if (format === 'bmp') mimeType = 'image/bmp';

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas conversion failed'));
      },
      mimeType,
      quality
    );
  });
};

// Target Size Compression (e.g. target 100 KB)
export const compressToTargetSize = async (
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  targetSizeKB: number
): Promise<{ blob: Blob; finalQuality: number }> => {
  const targetBytes = targetSizeKB * 1024;
  let minQ = 0.05;
  let maxQ = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.8;

  // Binary search for closest quality setting under targetBytes
  for (let step = 0; step < 7; step++) {
    const midQ = (minQ + maxQ) / 2;
    const currentBlob = await canvasToBlob(canvas, format, midQ);
    
    if (currentBlob.size <= targetBytes) {
      bestBlob = currentBlob;
      bestQuality = midQ;
      minQ = midQ; // Try to get higher quality if possible
    } else {
      maxQ = midQ; // Decrease quality
    }
  }

  if (!bestBlob) {
    // If even lowest quality exceeds, return lowest quality
    bestBlob = await canvasToBlob(canvas, format, 0.05);
    bestQuality = 0.05;
  }

  return { blob: bestBlob, finalQuality: bestQuality };
};

// Auto Crop Whitespace / Transparent borders
export const autoCropCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];

      // Check if pixel is not transparent and not pure white
      const isWhitespace = alpha < 10 || (r > 245 && g > 245 && b > 245);
      if (!isWhitespace) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found || minX >= maxX || minY >= maxY) return canvas;

  const croppedWidth = maxX - minX + 1;
  const croppedHeight = maxY - minY + 1;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;
  const croppedCtx = croppedCanvas.getContext('2d');

  if (croppedCtx) {
    croppedCtx.drawImage(canvas, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
  }

  return croppedCanvas;
};

// Process complete edit stack on an image element
export const processImagePipeline = async (
  img: HTMLImageElement,
  settings: EditSettings
): Promise<{ canvas: HTMLCanvasElement; blob: Blob; size: number }> => {
  // 1. Calculate Target Dimensions
  let targetW = settings.resizeWidth || img.naturalWidth;
  let targetH = settings.resizeHeight || img.naturalHeight;

  if (settings.resizePercent && settings.resizePercent !== 100) {
    targetW = Math.round((img.naturalWidth * settings.resizePercent) / 100);
    targetH = Math.round((img.naturalHeight * settings.resizePercent) / 100);
  }

  // Ensure minimum dimensions
  targetW = Math.max(10, targetW);
  targetH = Math.max(10, targetH);

  // 2. Prepare Base Canvas with Border / Padding considerations
  const borderTotal = (settings.borderWidth || 0) * 2 + (settings.borderPadding || 0) * 2;
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = targetW + borderTotal;
  baseCanvas.height = targetH + borderTotal;
  const ctx = baseCanvas.getContext('2d');

  if (!ctx) throw new Error('Failed to create canvas context');

  // Fill Border Background if applicable
  if (settings.borderWidth > 0 || settings.borderPadding > 0) {
    ctx.fillStyle = settings.borderColor || '#ffffff';
    ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  }

  // Calculate inner photo offset
  const photoX = (settings.borderWidth || 0) + (settings.borderPadding || 0);
  const photoY = (settings.borderWidth || 0) + (settings.borderPadding || 0);

  // 3. Handle Rotations and Flips inside an isolated temporary canvas
  const rotatedCanvas = document.createElement('canvas');
  const rad = (settings.rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const rotW = Math.round(targetW * cos + targetH * sin);
  const rotH = Math.round(targetW * sin + targetH * cos);

  rotatedCanvas.width = rotW;
  rotatedCanvas.height = rotH;
  const rotCtx = rotatedCanvas.getContext('2d');

  if (rotCtx) {
    rotCtx.translate(rotW / 2, rotH / 2);
    rotCtx.rotate(rad);
    rotCtx.scale(settings.flipHorizontal ? -1 : 1, settings.flipVertical ? -1 : 1);

    // Apply Filter / Adjustments using Canvas Filter String
    const filterParts: string[] = [];
    if (settings.brightness !== 0) filterParts.push(`brightness(${100 + settings.brightness}%)`);
    if (settings.contrast !== 0) filterParts.push(`contrast(${100 + settings.contrast}%)`);
    if (settings.saturation !== 0) filterParts.push(`saturate(${100 + settings.saturation}%)`);
    if (settings.hue !== 0) filterParts.push(`hue-rotate(${settings.hue}deg)`);
    if (settings.blur > 0) filterParts.push(`blur(${settings.blur}px)`);

    // Preset Filters
    switch (settings.filter) {
      case 'grayscale': filterParts.push('grayscale(100%)'); break;
      case 'sepia': filterParts.push('sepia(100%)'); break;
      case 'vintage': filterParts.push('sepia(60%) contrast(120%) brightness(90%)'); break;
      case 'cool': filterParts.push('hue-rotate(180deg) saturate(120%)'); break;
      case 'warm': filterParts.push('sepia(30%) saturate(140%) brightness(105%)'); break;
      case 'invert': filterParts.push('invert(100%)'); break;
      case 'vivid': filterParts.push('saturate(200%) contrast(115%)'); break;
      case 'cyberpunk': filterParts.push('hue-rotate(280deg) saturate(220%) contrast(130%)'); break;
    }

    if (filterParts.length > 0) {
      rotCtx.filter = filterParts.join(' ');
    }

    // Handle background removal / background color fill
    if (settings.bgType === 'color' && settings.bgColor) {
      rotCtx.fillStyle = settings.bgColor;
      rotCtx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
    }

    rotCtx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  }

  // 4. Chroma Key / Auto Transparency (Solid background removal)
  if (settings.bgType === 'transparent' || settings.bgType === 'ai-remove') {
    if (rotCtx) {
      const imgData = rotCtx.getImageData(0, 0, rotW, rotH);
      const data = imgData.data;
      const tol = settings.chromaTolerance || 30;

      // Sample corner color as background key
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (diff < tol) {
          data[i + 3] = 0; // Make transparent
        }
      }
      rotCtx.putImageData(imgData, 0, 0);
    }
  }

  // Draw rotated image onto base canvas
  ctx.drawImage(rotatedCanvas, photoX, photoY, targetW, targetH);

  // 5. Crop Box Handling
  let finalCanvas = baseCanvas;
  if (settings.cropRect && settings.cropRect.width > 0 && settings.cropRect.height > 0) {
    const { x, y, width, height, isCircle } = settings.cropRect;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext('2d');

    if (cropCtx) {
      if (isCircle) {
        cropCtx.beginPath();
        cropCtx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
        cropCtx.clip();
      }
      cropCtx.drawImage(baseCanvas, x, y, width, height, 0, 0, width, height);
      finalCanvas = cropCanvas;
    }
  }

  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) throw new Error('Final canvas context unavailable');

  // 6. Meme Text Overlay
  if (settings.memeTopText || settings.memeBottomText) {
    const fontSize = Math.max(16, Math.round((finalCanvas.height * (settings.memeFontSize || 8)) / 100));
    finalCtx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
    finalCtx.textAlign = 'center';
    finalCtx.fillStyle = settings.memeTextColor || '#ffffff';
    finalCtx.strokeStyle = settings.memeStrokeColor || '#000000';
    finalCtx.lineWidth = Math.max(2, fontSize / 10);

    if (settings.memeTopText) {
      const topY = fontSize + 10;
      finalCtx.strokeText(settings.memeTopText.toUpperCase(), finalCanvas.width / 2, topY);
      finalCtx.fillText(settings.memeTopText.toUpperCase(), finalCanvas.width / 2, topY);
    }

    if (settings.memeBottomText) {
      const bottomY = finalCanvas.height - 20;
      finalCtx.strokeText(settings.memeBottomText.toUpperCase(), finalCanvas.width / 2, bottomY);
      finalCtx.fillText(settings.memeBottomText.toUpperCase(), finalCanvas.width / 2, bottomY);
    }
  }

  // 7. Watermark (Text or Image)
  if (settings.watermarkType === 'text' && settings.watermarkText) {
    finalCtx.save();
    finalCtx.globalAlpha = settings.watermarkOpacity ?? 0.6;
    const wFontSize = settings.watermarkFontSize || 24;
    finalCtx.font = `bold ${wFontSize}px system-ui, sans-serif`;
    finalCtx.fillStyle = settings.watermarkColor || '#ffffff';

    const textMetrics = finalCtx.measureText(settings.watermarkText);
    let wx = 20;
    let wy = finalCanvas.height - 20;

    switch (settings.watermarkPosition) {
      case 'top-left': wx = 20; wy = wFontSize + 20; break;
      case 'top-right': wx = finalCanvas.width - textMetrics.width - 20; wy = wFontSize + 20; break;
      case 'center': wx = (finalCanvas.width - textMetrics.width) / 2; wy = finalCanvas.height / 2; break;
      case 'bottom-left': wx = 20; wy = finalCanvas.height - 20; break;
      case 'bottom-right': wx = finalCanvas.width - textMetrics.width - 20; wy = finalCanvas.height - 20; break;
    }

    // Shadow for legibility
    finalCtx.shadowColor = 'rgba(0,0,0,0.8)';
    finalCtx.shadowBlur = 6;
    finalCtx.fillText(settings.watermarkText, wx, wy);
    finalCtx.restore();
  }

  // 8. QR Code Overlay
  if (settings.qrText) {
    try {
      const qrDataUrl = await QRCode.toDataURL(settings.qrText, { margin: 1, width: settings.qrSize || 120 });
      const qrImg = await loadImage(qrDataUrl);
      const qSize = settings.qrSize || 120;
      let qx = finalCanvas.width - qSize - 20;
      let qy = finalCanvas.height - qSize - 20;

      if (settings.qrPosition === 'top-right') { qx = finalCanvas.width - qSize - 20; qy = 20; }
      else if (settings.qrPosition === 'center') { qx = (finalCanvas.width - qSize) / 2; qy = (finalCanvas.height - qSize) / 2; }

      finalCtx.drawImage(qrImg, qx, qy, qSize, qSize);
    } catch (e) {
      console.warn('QR Code generation skipped:', e);
    }
  }

  // 9. Target Size Compression or Format Conversion
  let resultBlob: Blob;
  if (settings.targetSizeKB && settings.targetSizeKB > 0) {
    const { blob } = await compressToTargetSize(finalCanvas, settings.targetFormat, settings.targetSizeKB);
    resultBlob = blob;
  } else {
    resultBlob = await canvasToBlob(finalCanvas, settings.targetFormat, settings.quality);
  }

  return {
    canvas: finalCanvas,
    blob: resultBlob,
    size: resultBlob.size,
  };
};

// Merge Multiple Images (Horizontal, Vertical, Grid)
export const mergeMultipleImages = async (
  images: HTMLImageElement[],
  direction: 'horizontal' | 'vertical' | 'grid' = 'horizontal',
  gap: number = 10,
  bgColor: string = '#ffffff'
): Promise<HTMLCanvasElement> => {
  if (images.length === 0) throw new Error('No images to merge');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  if (direction === 'horizontal') {
    const totalW = images.reduce((acc, img) => acc + img.naturalWidth, 0) + gap * (images.length + 1);
    const maxH = Math.max(...images.map((img) => img.naturalHeight)) + gap * 2;

    canvas.width = totalW;
    canvas.height = maxH;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, maxH);

    let currentX = gap;
    images.forEach((img) => {
      const y = gap + (maxH - gap * 2 - img.naturalHeight) / 2;
      ctx.drawImage(img, currentX, y);
      currentX += img.naturalWidth + gap;
    });
  } else if (direction === 'vertical') {
    const maxW = Math.max(...images.map((img) => img.naturalWidth)) + gap * 2;
    const totalH = images.reduce((acc, img) => acc + img.naturalHeight, 0) + gap * (images.length + 1);

    canvas.width = maxW;
    canvas.height = totalH;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, maxW, totalH);

    let currentY = gap;
    images.forEach((img) => {
      const x = gap + (maxW - gap * 2 - img.naturalWidth) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.naturalHeight + gap;
    });
  } else {
    // Grid 2x2 or 3x3
    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
    const cellW = Math.max(...images.map((i) => i.naturalWidth));
    const cellH = Math.max(...images.map((i) => i.naturalHeight));

    canvas.width = cols * cellW + (cols + 1) * gap;
    canvas.height = rows * cellH + (rows + 1) * gap;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    images.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gap + col * (cellW + gap) + (cellW - img.naturalWidth) / 2;
      const y = gap + row * (cellH + gap) + (cellH - img.naturalHeight) / 2;
      ctx.drawImage(img, x, y);
    });
  }

  return canvas;
};

// Generate EXIF Metadata object
export const extractExifMetadata = (file: File, img: HTMLImageElement): ExifData => {
  const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB (' + (file.size / 1024).toFixed(0) + ' KB)';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(img.naturalWidth, img.naturalHeight);
  const aspect = `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`;

  return {
    fileName: file.name,
    fileSize: sizeFormatted,
    fileType: file.type || 'image/' + file.name.split('.').pop()?.toLowerCase(),
    dimensions: `${img.naturalWidth} x ${img.naturalHeight} px`,
    aspectRatio: aspect,
    colorDepth: '24-bit sRGB',
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
};
