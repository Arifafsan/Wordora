/**
 * Wordora Smart Document Scanner
 * 
 * Comprehensive camera & gallery document scanning modal with:
 * - Direct camera live viewfinder with document alignment guides
 * - Multi-page scanning, reordering, and rotation
 * - Document edge cropping and boundary adjustments
 * - High-contrast B&W, Magic Color, and Grayscale enhancement filters
 * - Authentic Bengali ('ben') and English ('eng') Optical Character Recognition (OCR)
 * - Side-by-side original scan vs recognized text comparison & proofreading
 * - Direct export to DOCX, PDF, TXT, and seamless opening in Wordora Editor
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  ScanLine,
  Upload,
  RotateCw,
  RotateCcw,
  Crop,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
  Sliders,
  Download,
  Copy,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Plus,
  Layers,
  Languages,
  Sun,
  Maximize2,
  FileDown,
  Sparkles,
  Info,
  CheckCircle2,
  MoveLeft,
  MoveRight,
  ExternalLink
} from 'lucide-react';
import {
  ScannedPage,
  OcrLanguage,
  ImageFilterMode,
  OcrProgressInfo,
  OcrScanResult,
  preprocessImage,
  recognizeDocumentPages,
  formatOcrTextToHtml,
  generateSampleDocumentCanvas
} from '../utils/ocrEngine';
import { exportToDocx, downloadFile } from '../utils/docxExport';
import { exportToPdf } from '../utils/pdfExport';
import { DocumentModel } from '../types/document';
import { DEFAULT_PAGE_SETTINGS, calculateTextStats } from '../utils/storage';

interface SmartDocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor: (html: string, title: string, originalPages?: ScannedPage[]) => void;
  onInsertIntoActiveDoc?: (html: string) => void;
  isInsideEditor?: boolean;
}

type ScannerStep = 'capture' | 'adjust' | 'ocr_progress' | 'review_compare';

export const SmartDocumentScannerModal: React.FC<SmartDocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenInEditor,
  onInsertIntoActiveDoc,
  isInsideEditor = false
}) => {
  // Current active wizard step
  const [currentStep, setCurrentStep] = useState<ScannerStep>('capture');

  // Scanned pages list
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Hidden native file pickers
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // OCR configuration & progress
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>('ben+eng');
  const [ocrProgress, setOcrProgress] = useState<OcrProgressInfo | null>(null);
  const [ocrScanResult, setOcrScanResult] = useState<OcrScanResult | null>(null);
  const [isOcrRunning, setIsOcrRunning] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Review & comparison state
  const [editedText, setEditedText] = useState<string>('');
  const [docTitle, setDocTitle] = useState<string>('');
  const [embedOriginalImages, setEmbedOriginalImages] = useState<boolean>(false);
  const [comparisonViewMode, setComparisonViewMode] = useState<'split' | 'image' | 'text'>('split');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Image adjustment sliders for active page
  const [activeFilter, setActiveFilter] = useState<ImageFilterMode>('document_bw');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(15);
  const [showAdjustControls, setShowAdjustControls] = useState<boolean>(false);

  // Crop overlay drag state
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.05,
    y: 0.05,
    width: 0.9,
    height: 0.9
  });

  // Start live camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported in this browser environment. Please use device upload or native camera.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setIsCameraActive(true);

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as any;
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      let msg = 'Could not access camera. Please allow camera permissions or upload photos from device gallery.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in browser/system settings, or use Gallery Upload.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device. Please select document images from your gallery.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, [cameraFacing]);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  }, []);

  // Initialize camera when opening modal on capture step
  useEffect(() => {
    if (isOpen && currentStep === 'capture' && pages.length === 0) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentStep, pages.length, startCamera, stopCamera]);

  // Toggle torch / flash
  const handleToggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Failed to toggle torch:', err);
      }
    }
  };

  // Flip camera front/back
  const handleSwitchCamera = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture photo from live camera video frame
  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Preprocess with default document enhancement
      const enhancedDataUrl = await preprocessImage(rawDataUrl, {
        rotation: 0,
        filter: 'document_bw',
        contrast: 15,
        brightness: 0
      });

      const newPage: ScannedPage = {
        id: 'page_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        originalDataUrl: rawDataUrl,
        enhancedDataUrl: enhancedDataUrl,
        rotation: 0,
        filter: 'document_bw',
        brightness: 0,
        contrast: 15
      };

      setPages(prev => [...prev, newPage]);
      setActivePageIndex(pages.length);
      setCurrentStep('adjust');
      stopCamera();
    } catch (err) {
      console.error('Error capturing camera frame:', err);
    }
  };

  // Load photos from gallery file input
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPagesList: ScannedPage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const rawDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const enhancedDataUrl = await preprocessImage(rawDataUrl, {
        rotation: 0,
        filter: 'document_bw',
        contrast: 15,
        brightness: 0
      });

      newPagesList.push({
        id: 'page_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 6),
        originalDataUrl: rawDataUrl,
        enhancedDataUrl: enhancedDataUrl,
        rotation: 0,
        filter: 'document_bw',
        brightness: 0,
        contrast: 15
      });
    }

    if (newPagesList.length > 0) {
      setPages(prev => [...prev, ...newPagesList]);
      setActivePageIndex(pages.length);
      setCurrentStep('adjust');
      stopCamera();
    }

    // Reset input
    e.target.value = '';
  };

  // Load built-in authentic Bengali / Bilingual sample document
  const handleLoadSample = async (type: 'application' | 'bilingual_memo') => {
    const sampleDataUrl = generateSampleDocumentCanvas(type);
    if (!sampleDataUrl) return;

    const enhancedDataUrl = await preprocessImage(sampleDataUrl, {
      rotation: 0,
      filter: 'document_bw',
      contrast: 15,
      brightness: 0
    });

    const newPage: ScannedPage = {
      id: 'sample_' + Date.now(),
      originalDataUrl: sampleDataUrl,
      enhancedDataUrl: enhancedDataUrl,
      rotation: 0,
      filter: 'document_bw',
      brightness: 0,
      contrast: 15
    };

    setPages([newPage]);
    setActivePageIndex(0);
    setCurrentStep('adjust');
    stopCamera();
  };

  // Re-apply enhancement when user modifies rotation, filter, brightness, or contrast
  const updateActivePageEnhancement = async (updates: Partial<ScannedPage>) => {
    if (!pages[activePageIndex]) return;

    const curr = pages[activePageIndex];
    const newPage = { ...curr, ...updates };

    const newEnhanced = await preprocessImage(newPage.originalDataUrl, {
      rotation: newPage.rotation,
      filter: newPage.filter,
      brightness: newPage.brightness,
      contrast: newPage.contrast,
      cropRect: newPage.cropRect
    });

    newPage.enhancedDataUrl = newEnhanced;

    setPages(prev => {
      const copy = [...prev];
      copy[activePageIndex] = newPage;
      return copy;
    });
  };

  // Rotate active page 90 degrees
  const handleRotate = (degrees: number) => {
    const curr = pages[activePageIndex];
    if (!curr) return;
    const newRot = (((curr.rotation + degrees) % 360) + 360) % 360;
    updateActivePageEnhancement({ rotation: newRot });
  };

  // Apply Filter change
  const handleFilterChange = (filter: ImageFilterMode) => {
    setActiveFilter(filter);
    updateActivePageEnhancement({ filter });
  };

  // Apply Brightness / Contrast sliders
  const handleSlidersChange = (newBrightness: number, newContrast: number) => {
    setBrightness(newBrightness);
    setContrast(newContrast);
    updateActivePageEnhancement({ brightness: newBrightness, contrast: newContrast });
  };

  // Page reordering
  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
    setActivePageIndex(toIndex);
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      setPages([]);
      setCurrentStep('capture');
      startCamera();
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
    setActivePageIndex(prev => Math.max(0, Math.min(prev, pages.length - 2)));
  };

  // Apply Crop rect
  const handleApplyCrop = async () => {
    await updateActivePageEnhancement({ cropRect: cropBox });
    setIsCropping(false);
  };

  // Reset Crop rect
  const handleResetCrop = async () => {
    await updateActivePageEnhancement({ cropRect: undefined });
    setIsCropping(false);
  };

  // Run Bengali & English OCR on all preprocessed pages
  const handleStartOcr = async () => {
    if (pages.length === 0) return;

    setCurrentStep('ocr_progress');
    setIsOcrRunning(true);
    setOcrError(null);

    try {
      const result = await recognizeDocumentPages(pages, ocrLanguage, info => {
        setOcrProgress(info);
      });

      setOcrScanResult(result);
      setEditedText(result.fullText);
      setDocTitle(result.title);
      setCurrentStep('review_compare');
    } catch (err: any) {
      console.error('OCR execution failed:', err);
      setOcrError(err?.message || 'Bengali/English text recognition failed. Please ensure the document is clear and well-lit.');
    } finally {
      setIsOcrRunning(false);
    }
  };

  // Sync edited text with HTML formatting
  const handleTextChange = (newText: string) => {
    setEditedText(newText);
    if (ocrScanResult) {
      const formatted = formatOcrTextToHtml(newText);
      setOcrScanResult({
        ...ocrScanResult,
        fullText: newText,
        contentHtml: formatted.html
      });
    }
  };

  // Copy recognized text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
    }
  };

  // Assemble full HTML document (with optional original scan image embedded)
  const getFinalDocumentHtml = (): string => {
    let html = ocrScanResult ? formatOcrTextToHtml(editedText).html : '';

    if (embedOriginalImages && pages.length > 0) {
      const imagesHtml = pages
        .map((p, idx) => `
          <div style="margin-top: 16pt; margin-bottom: 12pt; text-align: center;">
            <p style="font-size: 9pt; color: #64748b; margin-bottom: 4pt; font-family: sans-serif;">— Scanned Page ${idx + 1} Original Image —</p>
            <img src="${p.enhancedDataUrl || p.originalDataUrl}" alt="Scanned Document Page ${idx + 1}" style="max-width: 100%; height: auto; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);" />
          </div>
        `)
        .join('\n');

      html = html + `\n<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 24pt 0 16pt 0;" />\n` + imagesHtml;
    }

    return html;
  };

  // Complete and Open inside Wordora Editor
  const handleConfirmOpenInEditor = () => {
    const finalHtml = getFinalDocumentHtml();
    const finalTitle = docTitle.trim() || 'Scanned Document';

    if (isInsideEditor && onInsertIntoActiveDoc) {
      onInsertIntoActiveDoc(finalHtml);
    } else {
      onOpenInEditor(finalHtml, finalTitle, pages);
    }
    handleCloseModal();
  };

  // Export directly as DOCX
  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const stats = calculateTextStats(getFinalDocumentHtml());
      const tempDoc: DocumentModel = {
        id: 'export_' + Date.now(),
        title: docTitle.trim() || 'Scanned Document',
        contentHtml: getFinalDocumentHtml(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pageSettings: { ...DEFAULT_PAGE_SETTINGS },
        favorite: false,
        inTrash: false,
        tags: ['Scanned', 'OCR'],
        wordCount: stats.words,
        charCount: stats.charactersWithSpaces
      };

      const blob = await exportToDocx(tempDoc);
      downloadFile(blob, `${tempDoc.title.replace(/[/\\?%*:|"<>]/g, '_')}.docx`);
    } catch (err) {
      console.error('Export DOCX failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export directly as PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Create offscreen container styled like Wordora print page
      const container = document.createElement('div');
      container.className = 'print-page';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.padding = '25.4mm';
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#000000';
      container.style.fontFamily = '"Noto Sans Bengali", sans-serif';
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.innerHTML = `
        <h2 style="font-size: 16pt; font-weight: bold; margin-bottom: 12pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 6pt;">
          ${docTitle || 'Scanned Document'}
        </h2>
        <div>${getFinalDocumentHtml()}</div>
      `;
      document.body.appendChild(container);

      const blob = await exportToPdf(container, docTitle || 'Scanned Document');
      document.body.removeChild(container);
      downloadFile(blob, `${(docTitle || 'Scanned_Document').replace(/[/\\?%*:|"<>]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export plain text
  const handleExportTxt = () => {
    const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${(docTitle || 'Scanned_Document').replace(/[/\\?%*:|"<>]/g, '_')}.txt`);
  };

  // Download scanned images as JPEG
  const handleDownloadImages = () => {
    pages.forEach((p, idx) => {
      const link = document.createElement('a');
      link.href = p.enhancedDataUrl || p.originalDataUrl;
      link.download = `scan_page_${idx + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Close modal and cleanup
  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  const activePage = pages[activePageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[94vh] max-h-[880px] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Smart Document Scanner
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  বাংলা ও ইংরেজি OCR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentStep === 'capture' && 'Point camera at printed Bengali/English document or upload'}
                {currentStep === 'adjust' && `Adjust Page ${activePageIndex + 1} of ${pages.length} · Crop, enhance & straighten`}
                {currentStep === 'ocr_progress' && 'Recognizing characters with multilingual OCR engine...'}
                {currentStep === 'review_compare' && 'Side-by-side comparison & correction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Step navigation breadcrumb or cancel */}
            {currentStep === 'adjust' && (
              <button
                onClick={() => {
                  setCurrentStep('capture');
                  startCamera();
                }}
                className="py-1 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            )}

            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: CAMERA VIEWFINDER & CAPTURE */}
        {currentStep === 'capture' && (
          <div className="flex-1 flex flex-col bg-slate-950 text-white relative overflow-hidden">
            {/* Live Camera Viewfinder */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
              {isCameraActive ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Alignment Frame Overlay */}
                  <div className="absolute inset-8 sm:inset-12 border-2 border-emerald-400/70 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Corner Guides */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    {/* Center crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10 shadow-lg">
                        <ScanLine className="w-4 h-4 mx-auto mb-1 text-emerald-400 animate-pulse" />
                        ডকুমেন্ট ফ্রেমের মধ্যে সোজা রাখুন (Hold page steady)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Camera className="w-8 h-8" />
                  </div>
                  {cameraError ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-rose-400">Camera Access Notice</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">Camera Standby</p>
                      <p className="text-xs text-slate-400">Click below to start live scanning or choose a photo</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <Camera className="w-4 h-4" /> Start Camera
                    </button>
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4" /> Choose from Gallery
                    </button>
                  </div>
                </div>
              )}

              {/* Top Viewfinder Controls */}
              {isCameraActive && (
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    {hasTorch && (
                      <button
                        onClick={handleToggleTorch}
                        className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                          isTorchOn ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                        title="Toggle Flashlight / Torch"
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleSwitchCamera}
                      className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors"
                      title="Switch Front/Rear Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[11px] px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 font-medium">
                    {pages.length > 0 ? `${pages.length} page(s) captured` : 'Ready to capture'}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Shutter & Action Bar */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              {/* Quick Sample Test Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1 shrink-0">
                  Quick Samples:
                </span>
                <button
                  onClick={() => handleLoadSample('application')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  ছুটির আবেদন (Bangla)
                </button>
                <button
                  onClick={() => handleLoadSample('bilingual_memo')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  প্রত্যয়নপত্র (Bilingual)
                </button>
              </div>

              {/* Shutter Capture Button */}
              <div className="flex items-center justify-center gap-4">
                {/* Gallery Picker Fallback */}
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Upload from Gallery"
                >
                  <Upload className="w-5 h-5" />
                </button>

                {/* Main Shutter */}
                <button
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive}
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                    isCameraActive
                      ? 'border-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/40 text-white cursor-pointer'
                      : 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Capture Document Page"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white/70 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                </button>

                {/* Native Android Camera Intent Fallback */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Native Android Camera Intent"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Right Side: Proceed to Adjust if pages already exist */}
              <div className="w-full sm:w-auto flex justify-end">
                {pages.length > 0 && (
                  <button
                    onClick={() => {
                      setCurrentStep('adjust');
                      stopCamera();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <span>View {pages.length} Page(s)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Hidden Input Elements */}
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>
        )}

        {/* STEP 2: ADJUST, CROP, FILTER & REORDER PAGES */}
        {currentStep === 'adjust' && activePage && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* Left / Top: Multi-page Thumbnail Sidebar */}
            <div className="w-full md:w-56 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <div className="hidden md:flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pages ({pages.length})
                </span>
                <button
                  onClick={() => {
                    setCurrentStep('capture');
                    startCamera();
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 font-semibold text-xs flex items-center gap-1"
                  title="Add another page"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`group relative rounded-xl border-2 p-1.5 flex md:flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${
                    activePageIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-20 md:w-full md:h-32 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src={p.enhancedDataUrl || p.originalDataUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-bold">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Move Up / Down & Delete controls on thumbnail */}
                  <div className="flex md:w-full items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Page {idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMovePage(idx, idx - 1);
                        }}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Page Left/Up"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMovePage(idx, idx + 1);
                        }}
                        disabled={idx === pages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Page Right/Down"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeletePage(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Delete this page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile "Add Page" pill */}
              <button
                onClick={() => {
                  setCurrentStep('capture');
                  startCamera();
                }}
                className="md:hidden flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-semibold shrink-0"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span>Add</span>
              </button>
            </div>

            {/* Center: Main Preview & Interactive Crop Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Active Page Tools Header */}
              <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRotate(-90)}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Rotate 90° Left"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Rotate L</span>
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Rotate 90° Right"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Rotate R</span>
                  </button>
                  <button
                    onClick={() => setIsCropping(!isCropping)}
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium ${
                      isCropping
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Crop Document Boundaries"
                  >
                    <Crop className="w-4 h-4" />
                    <span>{isCropping ? 'Cropping...' : 'Crop'}</span>
                  </button>
                  <button
                    onClick={() => setShowAdjustControls(!showAdjustControls)}
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium ${
                      showAdjustControls
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Adjust Brightness & Contrast"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Filters & Light</span>
                  </button>
                </div>

                {/* Filter Selector Chips */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'document_bw', label: 'B&W Enhanced' },
                    { id: 'magic_color', label: 'Magic Color' },
                    { id: 'grayscale', label: 'Grayscale' },
                    { id: 'original', label: 'Original' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleFilterChange(f.id as ImageFilterMode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        activePage.filter === f.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Sliders Panel */}
              {showAdjustControls && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                      <span>Brightness (উজ্জ্বলতা):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={brightness}
                      onChange={e => handleSlidersChange(parseInt(e.target.value), contrast)}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                      <span>Contrast (স্পষ্টতা):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="50"
                      value={contrast}
                      onChange={e => handleSlidersChange(brightness, parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Crop Actions Banner if active */}
              {isCropping && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 px-4">
                  <span>Adjust crop boundaries or click Apply:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCrop}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                    >
                      Reset Full Page
                    </button>
                    <button
                      onClick={handleApplyCrop}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] shadow-xs"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              )}

              {/* Main Image Viewport */}
              <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-slate-200/60 dark:bg-slate-950/80">
                <div className="relative max-h-full max-w-full rounded-xl shadow-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <img
                    src={activePage.enhancedDataUrl || activePage.originalDataUrl}
                    alt={`Preview Page ${activePageIndex + 1}`}
                    className="max-h-[60vh] max-w-full object-contain"
                  />

                  {/* Interactive Crop Frame Overlay */}
                  {isCropping && (
                    <div
                      className="absolute border-2 border-dashed border-emerald-400 bg-emerald-500/10"
                      style={{
                        top: `${cropBox.y * 100}%`,
                        left: `${cropBox.x * 100}%`,
                        width: `${cropBox.width * 100}%`,
                        height: `${cropBox.height * 100}%`
                      }}
                    >
                      {/* Interactive crop handles */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs cursor-nwse-resize" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs cursor-nesw-resize" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs cursor-nesw-resize" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs cursor-nwse-resize" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer for Step 2 */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                {/* Language Selection */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                    <Languages className="w-3.5 h-3.5 text-indigo-500" />
                    ভাষা (OCR Language):
                  </span>
                  <select
                    value={ocrLanguage}
                    onChange={e => setOcrLanguage(e.target.value as OcrLanguage)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ben+eng">বাংলা ও ইংরেজি (Bengali + English) ★</option>
                    <option value="ben">শুধুমাত্র বাংলা (Bengali Only)</option>
                    <option value="eng">English Only</option>
                  </select>
                </div>

                {/* Next Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setCurrentStep('capture');
                      startCamera();
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Another Page</span>
                  </button>

                  <button
                    onClick={handleStartOcr}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Recognize Text ({pages.length} Pages)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: OCR EXECUTION PROGRESS & STATUS */}
        {currentStep === 'ocr_progress' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400/40 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                <ScanLine className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md text-xs font-bold">
                {ocrProgress?.progress || 10}%
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {ocrLanguage.includes('ben') ? 'বাংলা ও ইংরেজি টেক্সট রিকগনিশন চলছে...' : 'Recognizing Document Text...'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {ocrProgress?.message || 'Processing scanned pages with high-accuracy Tesseract multilingual model...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm space-y-1.5">
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, ocrProgress?.progress || 10)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Phase: {ocrProgress?.phase || 'Initializing'}</span>
                <span>{ocrProgress?.progress || 10}% Complete</span>
              </div>
            </div>

            {ocrError ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 max-w-md text-left space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>OCR Recognition Notice</span>
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400">{ocrError}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleStartOcr}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                  >
                    Retry OCR
                  </button>
                  <button
                    onClick={() => setCurrentStep('adjust')}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back to Pages
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 max-w-xs text-center shadow-2xs">
                🔒 Privacy guaranteed: Text is transcribed locally inside your browser/device. No document contents are sent to external third parties without consent.
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SIDE-BY-SIDE COMPARISON, PROOFREADING & EXPORT */}
        {currentStep === 'review_compare' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Top Verification Alert Banner */}
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="leading-tight">
                  OCR may contain minor inaccuracies. Compare original scan with text on the right and edit typos before opening in Wordora.
                </span>
              </div>

              {/* View Switcher on mobile */}
              <div className="flex items-center gap-1 shrink-0 md:hidden">
                <button
                  onClick={() => setComparisonViewMode('split')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comparisonViewMode === 'split' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setComparisonViewMode('image')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comparisonViewMode === 'image' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setComparisonViewMode('text')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comparisonViewMode === 'text' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>

            {/* Document Title Bar */}
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Document Title:
                </span>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Scanned Document Title..."
                  className="flex-1 py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={embedOriginalImages}
                    onChange={e => setEmbedOriginalImages(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Attach Scanned Images</span>
                </label>

                <button
                  onClick={handleCopyText}
                  className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Copy Recognized Text"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split Comparison View: Left Scanned Image, Right Editable Text */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Original Scanned Page Preview */}
              {(comparisonViewMode === 'split' || comparisonViewMode === 'image') && (
                <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <div className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-between shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      Original Scanned Image (Page {activePageIndex + 1} of {pages.length})
                    </span>

                    {/* Page Switcher if multi-page */}
                    {pages.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                          disabled={activePageIndex === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-semibold">{activePageIndex + 1}/{pages.length}</span>
                        <button
                          onClick={() => setActivePageIndex(p => Math.min(pages.length - 1, p + 1))}
                          disabled={activePageIndex === pages.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-3 flex items-center justify-center overflow-auto">
                    {pages[activePageIndex] && (
                      <img
                        src={pages[activePageIndex].enhancedDataUrl || pages[activePageIndex].originalDataUrl}
                        alt="Scanned original"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-md border border-slate-300 dark:border-slate-700"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Right Column: Transcribed Editable Bengali & English Text */}
              {(comparisonViewMode === 'split' || comparisonViewMode === 'text') && (
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-between shrink-0">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      Transcribed Text (সম্পাদনাযোগ্য বাংলা ও ইংরেজি)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {editedText.split(/\s+/).filter(Boolean).length} words · {editedText.length} chars
                    </span>
                  </div>

                  <div className="flex-1 p-3 overflow-hidden flex flex-col">
                    <textarea
                      value={editedText}
                      onChange={e => handleTextChange(e.target.value)}
                      placeholder="Transcribed text will appear here..."
                      className="w-full h-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans"
                      style={{ fontFamily: '"Noto Sans Bengali", "Plus Jakarta Sans", sans-serif' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Final Actions: Open in Wordora or Export Directly */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Direct Export Group */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1 shrink-0">
                  Quick Export:
                </span>
                <button
                  onClick={handleExportDocx}
                  disabled={isExporting}
                  className="py-1.5 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Export as Microsoft Word .docx"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Word (.docx)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Export as PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportTxt}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Download as Text File"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
                <button
                  onClick={handleDownloadImages}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Save original scanned images"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Images</span>
                </button>
              </div>

              {/* Main Commit Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setCurrentStep('adjust')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Back to Adjust
                </button>

                <button
                  onClick={handleConfirmOpenInEditor}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isInsideEditor ? 'Insert into Current Document' : 'Open in Wordora Editor'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
