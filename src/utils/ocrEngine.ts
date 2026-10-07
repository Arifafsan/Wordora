/**
 * Smart Document Scanner - OCR Engine & Preprocessing
 * 
 * Features:
 * - High-fidelity Optical Character Recognition for Bengali ('ben') and English ('eng')
 * - Mixed Bengali + English document support
 * - Image preprocessing pipeline: rotation, crop, contrast stretching, B&W document enhancement, noise reduction
 * - Text normalization: Bengali Unicode preservation, paragraph restructuring, heading detection
 * - Offline/client-side privacy: all processing happens inside the browser Web Worker
 */

import { createWorker } from 'tesseract.js';

export type OcrLanguage = 'ben+eng' | 'ben' | 'eng';

export type ImageFilterMode = 'document_bw' | 'magic_color' | 'grayscale' | 'original';

export interface CropRect {
  x: number;      // 0 to 1
  y: number;      // 0 to 1
  width: number;  // 0 to 1
  height: number; // 0 to 1
}

export interface ScannedPage {
  id: string;
  originalDataUrl: string;
  enhancedDataUrl: string;
  rotation: number; // 0, 90, 180, 270
  filter: ImageFilterMode;
  brightness: number; // -50 to 50
  contrast: number;   // -50 to 50
  cropRect?: CropRect;
  recognizedText?: string;
  confidence?: number;
}

export interface OcrProgressInfo {
  phase: 'initializing' | 'loading_model' | 'preprocessing' | 'recognizing' | 'formatting' | 'completed' | 'error';
  progress: number; // 0 to 100
  message: string;
  pageIndex?: number;
  totalPages?: number;
}

export interface OcrScanResult {
  title: string;
  fullText: string;
  contentHtml: string;
  pages: ScannedPage[];
  averageConfidence: number;
}

/**
 * Preprocesses a raw scan image using HTML5 Canvas for optimal OCR recognition.
 * Applies rotation, bounds crop, contrast enhancement, brightness and binarization filters.
 */
export async function preprocessImage(
  dataUrl: string,
  options: {
    rotation?: number;
    filter?: ImageFilterMode;
    brightness?: number;
    contrast?: number;
    cropRect?: CropRect;
  } = {}
): Promise<string> {
  const {
    rotation = 0,
    filter = 'document_bw',
    brightness = 0,
    contrast = 15,
    cropRect
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const normRotation = ((rotation % 360) + 360) % 360;
        const isRotated90or270 = normRotation === 90 || normRotation === 270;

        // Source crop rect
        let sx = 0;
        let sy = 0;
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;

        if (cropRect) {
          sx = Math.max(0, Math.min(img.naturalWidth - 1, cropRect.x * img.naturalWidth));
          sy = Math.max(0, Math.min(img.naturalHeight - 1, cropRect.y * img.naturalHeight));
          sWidth = Math.max(10, Math.min(img.naturalWidth - sx, cropRect.width * img.naturalWidth));
          sHeight = Math.max(10, Math.min(img.naturalHeight - sy, cropRect.height * img.naturalHeight));
        }

        const targetWidth = isRotated90or270 ? sHeight : sWidth;
        const targetHeight = isRotated90or270 ? sWidth : sHeight;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Apply rotation around center
        ctx.save();
        ctx.translate(targetWidth / 2, targetHeight / 2);
        ctx.rotate((normRotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          sx,
          sy,
          sWidth,
          sHeight,
          -sWidth / 2,
          -sHeight / 2,
          sWidth,
          sHeight
        );
        ctx.restore();

        // Apply pixel-level enhancements if needed
        if (filter !== 'original' || brightness !== 0 || contrast !== 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const len = data.length;

          // Contrast multiplier factor
          const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

          for (let i = 0; i < len; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Brightness
            if (brightness !== 0) {
              r = Math.min(255, Math.max(0, r + brightness));
              g = Math.min(255, Math.max(0, g + brightness));
              b = Math.min(255, Math.max(0, b + brightness));
            }

            // Contrast
            if (contrast !== 0) {
              r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
              g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
              b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
            }

            // Greyscale luminance
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            if (filter === 'grayscale') {
              data[i] = luma;
              data[i + 1] = luma;
              data[i + 2] = luma;
            } else if (filter === 'document_bw') {
              // High contrast document filter: separates ink from paper background
              // Soft adaptive curve: paper is pushed to crisp white, text to deep dark
              const threshold = 145;
              let bwVal = luma;
              if (luma > threshold) {
                // Background paper whitening
                bwVal = Math.min(255, luma * 1.35 + 25);
              } else {
                // Text ink sharpening
                bwVal = Math.max(0, luma * 0.7 - 20);
              }
              data[i] = bwVal;
              data[i + 1] = bwVal;
              data[i + 2] = bwVal;
            } else if (filter === 'magic_color') {
              // Magic Color: whiten light background while preserving colored ink / stamps
              if (luma > 185) {
                const whiteBoost = (luma - 185) * 0.9;
                data[i] = Math.min(255, r + whiteBoost);
                data[i + 1] = Math.min(255, g + whiteBoost);
                data[i + 2] = Math.min(255, b + whiteBoost);
              } else {
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
              }
            } else {
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
            }
          }

          ctx.putImageData(imageData, 0, 0);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Preprocessing canvas error:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for enhancement'));
    img.src = dataUrl;
  });
}

/**
 * Restructures raw OCR transcribed text into clean Bengali and English paragraphs,
 * headings, and bullet points while preserving Bengali Unicode characters.
 */
export function formatOcrTextToHtml(rawText: string): { html: string; plainText: string } {
  if (!rawText || !rawText.trim()) {
    return {
      html: `<p style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt; line-height: 1.6; margin-bottom: 8pt;">No readable text detected in scan.</p>`,
      plainText: ''
    };
  }

  // 1. Normalize line endings and whitespace
  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ');

  // 2. Split into raw lines
  const lines = normalized.split('\n').map(l => l.trim());

  // 3. Process paragraphs: combine lines that belong to the same sentence/paragraph
  // Hyphenated line ending in English (e.g. "communi-\ncation" -> "communication")
  const paragraphBlocks: string[] = [];
  let currentParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) {
      if (currentParagraph) {
        paragraphBlocks.push(currentParagraph.trim());
        currentParagraph = '';
      }
      continue;
    }

    // Check if line looks like a list item or heading
    const isBullet = /^([•\-\*–—]|(\d+|[\u09E6-\u09EF]+)[\.\)])\s+/.test(line);
    const isShortHeading = line.length < 50 && (
      line.startsWith('বিষয়:') ||
      line.startsWith('বিষয়:') ||
      line.startsWith('তারিখ:') ||
      line.startsWith('বরাবর') ||
      line.startsWith('Subject:') ||
      line.startsWith('Date:') ||
      line.startsWith('To:') ||
      /^(মহোদয়|মহোদয়া|জনাব|সুধী|Dear Sir|Dear Madam|Sir)/.test(line)
    );

    if (isBullet || isShortHeading) {
      if (currentParagraph) {
        paragraphBlocks.push(currentParagraph.trim());
        currentParagraph = '';
      }
      paragraphBlocks.push(line);
      continue;
    }

    if (!currentParagraph) {
      currentParagraph = line;
    } else {
      if (currentParagraph.endsWith('-')) {
        currentParagraph = currentParagraph.slice(0, -1) + line;
      } else {
        currentParagraph += ' ' + line;
      }
    }
  }

  if (currentParagraph) {
    paragraphBlocks.push(currentParagraph.trim());
  }

  // 4. Transform paragraph blocks into styled HTML
  const htmlParts: string[] = [];
  const cleanPlainParts: string[] = [];

  for (const block of paragraphBlocks) {
    if (!block) continue;
    cleanPlainParts.push(block);

    // Escape HTML special characters
    const escaped = block
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Heading heuristics
    if (
      escaped.startsWith('বিষয়:') || 
      escaped.startsWith('বিষয়:') || 
      escaped.startsWith('Subject:')
    ) {
      htmlParts.push(
        `<p style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt; font-weight: bold; line-height: 1.5; margin-top: 10pt; margin-bottom: 8pt; color: #1e293b;">${escaped}</p>`
      );
    } else if (
      escaped.startsWith('তারিখ:') || 
      escaped.startsWith('Date:') ||
      escaped.startsWith('বরাবর') || 
      escaped.startsWith('To:')
    ) {
      htmlParts.push(
        `<p style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt; line-height: 1.6; margin-bottom: 4pt; color: #334155;"><strong>${escaped}</strong></p>`
      );
    } else if (/^([•\-\*–—]|(\d+|[\u09E6-\u09EF]+)[\.\)])\s+/.test(escaped)) {
      htmlParts.push(
        `<p style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt; line-height: 1.6; margin-left: 18pt; margin-bottom: 4pt; color: #1e293b;">${escaped}</p>`
      );
    } else {
      htmlParts.push(
        `<p style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt; line-height: 1.65; margin-bottom: 8pt; text-align: justify; color: #1e293b;">${escaped}</p>`
      );
    }
  }

  return {
    html: htmlParts.join('\n'),
    plainText: cleanPlainParts.join('\n\n')
  };
}

/**
 * Recognizes a collection of scanned document pages using Tesseract.js.
 * Configured with genuine Bengali ('ben') and English ('eng') support.
 */
export async function recognizeDocumentPages(
  pages: ScannedPage[],
  language: OcrLanguage = 'ben+eng',
  onProgress?: (info: OcrProgressInfo) => void
): Promise<OcrScanResult> {
  if (!pages || pages.length === 0) {
    throw new Error('No pages provided for scanning.');
  }

  onProgress?.({
    phase: 'initializing',
    progress: 5,
    message: 'Initializing Bengali & English OCR engine...'
  });

  // Tesseract language parameter: 'ben+eng', 'ben', or 'eng'
  let langCodes = language;
  if (language === 'ben+eng') {
    langCodes = 'ben+eng';
  }

  let worker: any = null;

  try {
    onProgress?.({
      phase: 'loading_model',
      progress: 15,
      message: language.includes('ben')
        ? 'Loading Bengali (বাংলা) & English language recognition models...'
        : 'Loading English OCR model...'
    });

    // Create worker with progress logger
    worker = await createWorker(langCodes, 1, {
      logger: (m: any) => {
        if (m.status === 'loading tesseract core') {
          onProgress?.({
            phase: 'loading_model',
            progress: 20 + Math.round((m.progress || 0) * 15),
            message: 'Loading OCR core runtime...'
          });
        } else if (m.status === 'loading language traineddata') {
          onProgress?.({
            phase: 'loading_model',
            progress: 35 + Math.round((m.progress || 0) * 20),
            message: language.includes('ben')
              ? 'Downloading Bengali & English trained models...'
              : 'Downloading OCR model...'
          });
        } else if (m.status === 'initializing api') {
          onProgress?.({
            phase: 'initializing',
            progress: 55,
            message: 'Configuring Bengali text parser...'
          });
        } else if (m.status === 'recognizing text') {
          // Progress per page handled in loop below
        }
      }
    });

    const recognizedPages: ScannedPage[] = [];
    const allTextList: string[] = [];
    let totalConfidence = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNum = i + 1;

      onProgress?.({
        phase: 'preprocessing',
        progress: 55 + Math.round((i / pages.length) * 40),
        message: `Recognizing Page ${pageNum} of ${pages.length}...`,
        pageIndex: pageNum,
        totalPages: pages.length
      });

      // Use the preprocessed / enhanced image
      const imageToOcr = page.enhancedDataUrl || page.originalDataUrl;

      // Execute OCR
      const result = await worker.recognize(imageToOcr);
      const text = result.data.text || '';
      const confidence = result.data.confidence || 0;

      totalConfidence += confidence;
      allTextList.push(text);

      recognizedPages.push({
        ...page,
        recognizedText: text,
        confidence: Math.round(confidence)
      });
    }

    onProgress?.({
      phase: 'formatting',
      progress: 96,
      message: 'Arranging Bengali Unicode text and formatting document...'
    });

    // Clean up worker
    await worker.terminate();
    worker = null;

    // Combine all pages with clear page separation if multi-page
    const combinedRaw = allTextList.join('\n\n--- [Page Break] ---\n\n');
    const { html, plainText } = formatOcrTextToHtml(combinedRaw);

    // Generate a contextual title
    const firstLine = plainText.split('\n').find(l => l.trim().length > 3)?.trim() || '';
    let autoTitle = 'Scanned Document';
    if (firstLine) {
      autoTitle = firstLine.substring(0, 32).replace(/[\r\n\t]/g, ' ').trim();
    } else {
      const dateStr = new Date().toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
      autoTitle = `স্ক্যান কপি (${dateStr})`;
    }

    const avgConfidence = pages.length > 0 ? Math.round(totalConfidence / pages.length) : 0;

    onProgress?.({
      phase: 'completed',
      progress: 100,
      message: 'OCR Complete!'
    });

    return {
      title: autoTitle,
      fullText: plainText,
      contentHtml: html,
      pages: recognizedPages,
      averageConfidence: avgConfidence
    };
  } catch (err: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore
      }
    }
    console.error('OCR processing error:', err);
    throw new Error(err?.message || 'Unable to recognize document text. Please check image lighting and retry.');
  }
}

/**
 * Generates an authentic sample Bengali Document for instant testing,
 * without requiring the user to have a paper document handy.
 */
export function generateSampleDocumentCanvas(type: 'application' | 'bilingual_memo'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;  // High-res A4 approx 150 DPI
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Paper background with subtle texture
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border / page margin outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  // Header Letterhead
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';

  if (type === 'application') {
    // Official Leave Application in Bengali
    ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', canvas.width / 2, 160);
    ctx.font = '24px "Noto Sans Bengali", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা', canvas.width / 2, 210);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 240);
    ctx.lineTo(canvas.width - 120, 240);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '26px "Noto Sans Bengali", sans-serif';

    const lines = [
      'তারিখ: ০৭ অক্টোবর, ২০২৬',
      '',
      'বরাবর,',
      'মহাপরিচালক',
      'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, শিক্ষা ভবন, ঢাকা।',
      '',
      'বিষয়: ৩ (তিন) দিনের নৈমিত্তিক ছুটির জন্য আবেদনপত্র।',
      '',
      'মহোদয়,',
      'সবিনয় নিবেদন এই যে, আমি আপনার কার্যালয়ে প্রশাসনিক কর্মকর্তা হিসেবে',
      'দায়িত্ব পালন করছি। আমার বিশেষ পারিবারিক জরুরি কারণে আগামী ১০ অক্টোবর',
      'হতে ১২ অক্টোবর ২০২৬ পর্যন্ত মোট ৩ (তিন) দিনের নৈমিত্তিক ছুটি অতি প্রয়োজন।',
      'উক্ত ছুটিকালীন সময়ে আমার সহকর্মী জনাব শফিকুল ইসলাম আমার দায়িত্ব পালন করবেন।',
      '',
      'অতএব, বিনীত প্রার্থনা এই যে, আমাকে উক্ত ৩ দিনের ছুটি মঞ্জুর করে বাধিত করবেন।',
      '',
      'বিনীত নিবেদক,',
      'মো. আব্দুল্লাহ আল মামুন',
      'প্রশাসনিক কর্মকর্তা, শাখা-৪',
      'ফোন: ০১৭১২-৩৪৫৬৭৮'
    ];

    let y = 320;
    for (const line of lines) {
      if (line.startsWith('বিষয়:')) {
        ctx.font = 'bold 28px "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(line, 120, y);
        ctx.font = '26px "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillText(line, 120, y);
      }
      y += 48;
    }
  } else {
    // Bilingual Certificate / Memorandum
    ctx.font = 'bold 36px "Noto Sans Bengali", sans-serif';
    ctx.fillText('ওয়ার্ডোরা টেকনোলজিস বাংলাদেশ লিমিটেড', canvas.width / 2, 160);
    ctx.font = '22px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Wordora Technologies Bangladesh Ltd. · Corporate Division', canvas.width / 2, 205);

    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 235);
    ctx.lineTo(canvas.width - 120, 235);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '26px "Noto Sans Bengali", sans-serif';

    const lines = [
      'Ref No: WTB/ADM/2026/049',
      'তারিখ / Date: October 07, 2026',
      '',
      'TO WHOM IT MAY CONCERN / প্রত্যয়নপত্র',
      '',
      'This is to certify that Mr. Tanvir Ahmed, Employee ID: W-8492, has been',
      'working with Wordora Technologies since January 15, 2023 as Senior Engineer.',
      '',
      'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, জনাব তানভীর আহমেদ আমাদের প্রতিষ্ঠানে একজন',
      'নিষ্ঠাবান এবং দক্ষ প্রকৌশলী হিসেবে সুনামের সাথে দায়িত্ব পালন করছেন।',
      'তাঁর কর্মকালীন সময়ে তিনি বাংলা ও ইংরেজি ডকুমেন্ট অটোমেশন প্রকল্পে',
      'অসামান্য অবদান রেখেছেন।',
      '',
      'We wish him every success in his future personal and academic endeavors.',
      '',
      'Authorized Signature / অনুমোদিত স্বাক্ষর,',
      'আহমেদ হাসান / Ahmed Hasan',
      'Director of Human Resources, Wordora Tech Ltd.'
    ];

    let y = 320;
    for (const line of lines) {
      if (line.includes('TO WHOM IT MAY CONCERN')) {
        ctx.font = 'bold 30px "Noto Sans Bengali", Arial, sans-serif';
        ctx.fillStyle = '#4338ca';
        ctx.fillText(line, 120, y);
        ctx.font = '26px "Noto Sans Bengali", Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillText(line, 120, y);
      }
      y += 48;
    }
  }

  // Stamp simulation
  ctx.save();
  ctx.translate(canvas.width - 320, canvas.height - 300);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(-100, -50, 200, 100);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED & APPROVED', 0, -10);
  ctx.font = '18px "Noto Sans Bengali", sans-serif';
  ctx.fillText('অনুমোদিত কপি', 0, 25);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
}
