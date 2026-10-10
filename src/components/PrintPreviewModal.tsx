/**
 * Print Preview Modal
 * 
 * Provides an authentic read-only print preview adhering strictly to document PageSettings:
 * - Real-world Paper sizes (A4, Letter, Legal, Custom)
 * - Orientation (Portrait & Landscape)
 * - Precise physical margins (in mm and px)
 * - Headers, Footers, and Dynamic Page Numbering
 * - Multi-page sheet splitting and continuous preview modes
 * - Responsive zoom controls (Fit Page, Fit Width, 50% - 150%)
 * - Native system print integration with optimized print media styles
 * - High-resolution PDF export option
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  Check,
  RotateCcw,
  BookOpen,
  Layers,
  Palette,
  Sliders,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText
} from 'lucide-react';
import { DocumentModel, PageSettings, PaperSize, PageOrientation, PageMargins } from '../types/document';
import { exportToPdf } from '../utils/pdfExport';
import { sanitizeFileName } from '../utils/fileExport';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
  onUpdatePageSettings?: (settings: Partial<PageSettings>) => void;
}

// 1 mm in pixels at standard 96 DPI
const MM_TO_PX = 3.779527559;

interface PaperDimensionMm {
  width: number;
  height: number;
}

const PAPER_DIMENSIONS_MM: Record<PaperSize, PaperDimensionMm> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
  custom: { width: 210, height: 297 }
};

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onUpdatePageSettings
}) => {
  // Local mutable copy of page settings for live preview & experimentation
  const [localSettings, setLocalSettings] = useState<PageSettings>(doc.pageSettings);
  const [zoom, setZoom] = useState<number>(85);
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | 'custom'>('fit-page');
  const [viewMode, setViewMode] = useState<'sheets' | 'continuous'>('sheets');
  const [grayscaleMode, setGrayscaleMode] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState<boolean>(false);

  // Measure content height for page calculation
  const [measuredContentHeight, setMeasuredContentHeight] = useState<number>(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sync when doc pageSettings change
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(doc.pageSettings);
      setHasUnsavedSettingsChanges(false);
    }
  }, [isOpen, doc.pageSettings]);

  // Paper physical dimensions based on orientation
  const paperDims = useMemo(() => {
    const base = PAPER_DIMENSIONS_MM[localSettings.paperSize] || PAPER_DIMENSIONS_MM.a4;
    const isLandscape = localSettings.orientation === 'landscape';
    const widthMm = isLandscape ? base.height : base.width;
    const heightMm = isLandscape ? base.width : base.height;

    return {
      widthMm,
      heightMm,
      widthPx: Math.round(widthMm * MM_TO_PX),
      heightPx: Math.round(heightMm * MM_TO_PX)
    };
  }, [localSettings.paperSize, localSettings.orientation]);

  // Printable content dimensions
  const printableDims = useMemo(() => {
    const margins = localSettings.margins;
    const headerHeightMm = localSettings.headerText ? 12 : 0;
    const footerHeightMm = (localSettings.footerText || localSettings.showPageNumber) ? 12 : 0;

    const printableWidthMm = Math.max(50, paperDims.widthMm - margins.left - margins.right);
    const printableHeightMm = Math.max(50, paperDims.heightMm - margins.top - margins.bottom - headerHeightMm - footerHeightMm);

    return {
      printableWidthMm,
      printableHeightMm,
      printableWidthPx: Math.round(printableWidthMm * MM_TO_PX),
      printableHeightPx: Math.round(printableHeightMm * MM_TO_PX),
      headerHeightMm,
      footerHeightMm
    };
  }, [localSettings.margins, localSettings.headerText, localSettings.footerText, localSettings.showPageNumber, paperDims]);

  // Measure content in offscreen container
  useEffect(() => {
    if (!isOpen) return;

    const measure = () => {
      if (measureRef.current) {
        setMeasuredContentHeight(measureRef.current.scrollHeight);
      }
    };

    // Small delay to ensure web fonts and images are calculated
    measure();
    const timer = setTimeout(measure, 150);
    return () => clearTimeout(timer);
  }, [isOpen, doc.contentHtml, printableDims.printableWidthPx]);

  // Compute total pages
  const totalPages = useMemo(() => {
    if (measuredContentHeight <= 0 || printableDims.printableHeightPx <= 0) return 1;
    return Math.max(1, Math.ceil(measuredContentHeight / printableDims.printableHeightPx));
  }, [measuredContentHeight, printableDims.printableHeightPx]);

  // Responsive Fit Page / Fit Width calculations
  useEffect(() => {
    if (!isOpen || !viewportRef.current) return;

    const updateAutoZoom = () => {
      if (!viewportRef.current) return;
      const viewportW = viewportRef.current.clientWidth - 48; // padding
      const viewportH = viewportRef.current.clientHeight - 48;

      if (zoomMode === 'fit-width') {
        const fitScale = Math.min(1.5, Math.max(0.3, viewportW / paperDims.widthPx));
        setZoom(Math.round(fitScale * 100));
      } else if (zoomMode === 'fit-page') {
        const fitScaleW = viewportW / paperDims.widthPx;
        const fitScaleH = viewportH / paperDims.heightPx;
        const fitScale = Math.min(1.2, Math.max(0.3, Math.min(fitScaleW, fitScaleH)));
        setZoom(Math.round(fitScale * 100));
      }
    };

    updateAutoZoom();
    window.addEventListener('resize', updateAutoZoom);
    return () => window.removeEventListener('resize', updateAutoZoom);
  }, [isOpen, zoomMode, paperDims.widthPx, paperDims.heightPx]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleNativePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Settings update helper
  const updateSetting = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedSettingsChanges(true);
  };

  const updateMargin = (side: keyof PageMargins, valueMm: number) => {
    setLocalSettings(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [side]: Math.max(0, valueMm)
      }
    }));
    setHasUnsavedSettingsChanges(true);
  };

  // Apply tweaked settings back to Document model
  const handleApplySettings = () => {
    if (onUpdatePageSettings) {
      onUpdatePageSettings(localSettings);
      setHasUnsavedSettingsChanges(false);
    }
  };

  // Trigger system print
  const handleNativePrint = () => {
    // Add print styles dynamically to document head
    const styleId = 'wordora-print-preview-styles';
    let styleEl = window.document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = window.document.createElement('style');
      styleEl.id = styleId;
      window.document.head.appendChild(styleEl);
    }

    const orientation = localSettings.orientation;
    const paperSize = localSettings.paperSize === 'custom' ? 'A4' : localSettings.paperSize.toUpperCase();

    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${paperSize} ${orientation};
          margin: 0;
        }
        body {
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        body * {
          visibility: hidden !important;
        }
        #wordora-print-root, #wordora-print-root * {
          visibility: visible !important;
        }
        #wordora-print-root {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
        }
        .no-print-element {
          display: none !important;
        }
        .print-sheet-page {
          page-break-after: always !important;
          break-after: page !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 auto !important;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Export high-resolution PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const safeTitle = sanitizeFileName(doc.title || 'Wordora_Document');
      await exportToPdf(
        doc.contentHtml,
        `${safeTitle}.pdf`,
        localSettings.orientation,
        localSettings
      );
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Page Numbers calculation helper
  const renderPageNumber = (pageIndex: number) => {
    if (!localSettings.showPageNumber) return null;
    if (localSettings.differentFirstPage && pageIndex === 1) return null;

    return (
      <span className="font-mono text-[10px] text-slate-500 font-semibold select-none">
        Page {pageIndex} of {totalPages}
      </span>
    );
  };

  // Header zone renderer
  const renderHeader = (pageIndex: number) => {
    const suppressHeader = localSettings.differentFirstPage && pageIndex === 1;
    if (suppressHeader && !localSettings.headerText) return null;

    const isTopRightNum = localSettings.showPageNumber && localSettings.pageNumberPosition === 'top-right';

    return (
      <div 
        className="flex items-center justify-between text-[11px] text-slate-400 border-b border-dashed border-slate-300 pb-1.5 mb-2 select-none"
        style={{
          paddingLeft: `${localSettings.margins.left}mm`,
          paddingRight: `${localSettings.margins.right}mm`,
          paddingTop: `${Math.max(4, localSettings.margins.top * 0.4)}mm`
        }}
      >
        <span className="truncate max-w-[70%] font-medium text-slate-600">
          {!suppressHeader ? localSettings.headerText : ''}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isTopRightNum && renderPageNumber(pageIndex)}
          {!isTopRightNum && (
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
              Wordora
            </span>
          )}
        </div>
      </div>
    );
  };

  // Footer zone renderer
  const renderFooter = (pageIndex: number) => {
    const isBottomCenter = localSettings.pageNumberPosition === 'bottom-center';
    const isBottomRight = localSettings.pageNumberPosition === 'bottom-right';

    return (
      <div 
        className="flex items-center justify-between text-[11px] text-slate-400 border-t border-dashed border-slate-300 pt-1.5 mt-2 select-none"
        style={{
          paddingLeft: `${localSettings.margins.left}mm`,
          paddingRight: `${localSettings.margins.right}mm`,
          paddingBottom: `${Math.max(4, localSettings.margins.bottom * 0.4)}mm`
        }}
      >
        <span className="truncate max-w-[50%] text-slate-500 font-medium">
          {localSettings.footerText}
        </span>

        {isBottomCenter && (
          <div className="flex-1 text-center">
            {renderPageNumber(pageIndex)}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {isBottomRight && renderPageNumber(pageIndex)}
          {!isBottomRight && !isBottomCenter && (
            <span className="text-[10px] text-slate-400">
              {new Date(doc.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md overflow-hidden text-slate-100 select-none animate-in fade-in duration-200">
      {/* Hidden container to measure real DOM content height for pagination */}
      <div
        ref={measureRef}
        className="absolute left-[-9999px] top-0 pointer-events-none opacity-0 document-content"
        style={{
          width: `${printableDims.printableWidthPx}px`,
          fontFamily: '"Plus Jakarta Sans", "Noto Sans Bengali", sans-serif',
          lineHeight: '1.6',
          fontSize: '11pt'
        }}
        dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
      />

      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between shrink-0 z-20 no-print-element shadow-md">
        {/* Left: Title & Page Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                Print Preview
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {localSettings.paperSize.toUpperCase()} · {localSettings.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-sm">
              {doc.title || 'Untitled Document'}
            </p>
          </div>
        </div>

        {/* Center: Zoom Controls (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
          <button
            onClick={() => {
              setZoomMode('custom');
              setZoom(z => Math.max(30, z - 10));
            }}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] font-semibold text-slate-200">
            {zoom}%
          </span>
          <button
            onClick={() => {
              setZoomMode('custom');
              setZoom(z => Math.min(180, z + 10));
            }}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <button
            onClick={() => setZoomMode('fit-page')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              zoomMode === 'fit-page' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fit Page
          </button>
          <button
            onClick={() => setZoomMode('fit-width')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              zoomMode === 'fit-width' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fit Width
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Page Settings Toggle on mobile */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showSettingsDrawer
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Page Layout Settings"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Page Setup</span>
          </button>

          {/* Export PDF Shortcut */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors disabled:opacity-50"
            title="Save as PDF document"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <FileDown className="w-4 h-4 text-emerald-400" />
            )}
            <span>PDF</span>
          </button>

          {/* Primary Print Button */}
          <button
            onClick={handleNativePrint}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Open system print dialog (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container: Settings Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Settings Drawer / Sidebar */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 w-full sm:w-80 shrink-0 flex flex-col z-10 transition-all duration-300 ${
            showSettingsDrawer
              ? 'absolute sm:relative inset-y-0 left-0 shadow-2xl'
              : 'hidden sm:flex'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Print Setup & Layout
              </h3>
            </div>
            {showSettingsDrawer && (
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
            {/* Paper Size */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Paper Size (কাগজের আকার)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['a4', 'letter', 'legal'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updateSetting('paperSize', size)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold uppercase transition-all ${
                      localSettings.paperSize === size
                        ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Orientation (কাগজের দিক)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('orientation', 'portrait')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    localSettings.orientation === 'portrait'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="w-3.5 h-4.5 border-2 border-current rounded-xs" />
                  <span>Portrait</span>
                </button>
                <button
                  onClick={() => updateSetting('orientation', 'landscape')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    localSettings.orientation === 'landscape'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="w-4.5 h-3.5 border-2 border-current rounded-xs" />
                  <span>Landscape</span>
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Margins (মার্জিন)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {localSettings.margins.top}mm / {Math.round(localSettings.margins.top / 25.4 * 10) / 10}"
                </span>
              </div>

              {/* Quick Margin Presets */}
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <button
                  onClick={() => {
                    updateSetting('margins', { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 });
                  }}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-medium text-center ${
                    localSettings.margins.top === 25.4
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Normal (1")
                </button>
                <button
                  onClick={() => {
                    updateSetting('margins', { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 });
                  }}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-medium text-center ${
                    localSettings.margins.top === 12.7
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Narrow (0.5")
                </button>
                <button
                  onClick={() => {
                    updateSetting('margins', { top: 18, right: 18, bottom: 18, left: 18 });
                  }}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-medium text-center ${
                    localSettings.margins.top === 18
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Compact
                </button>
              </div>

              {/* Custom Margin Sliders */}
              <div className="grid grid-cols-2 gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Top</span>
                    <span>{localSettings.margins.top}mm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={localSettings.margins.top}
                    onChange={e => updateMargin('top', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Bottom</span>
                    <span>{localSettings.margins.bottom}mm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={localSettings.margins.bottom}
                    onChange={e => updateMargin('bottom', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Left</span>
                    <span>{localSettings.margins.left}mm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={localSettings.margins.left}
                    onChange={e => updateMargin('left', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Right</span>
                    <span>{localSettings.margins.right}mm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={localSettings.margins.right}
                    onChange={e => updateMargin('right', Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Header & Footer Configuration */}
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                Header & Footer (হেডার ও ফুটার)
              </label>

              <div>
                <span className="text-[10px] text-slate-400 mb-1 block">Header Text</span>
                <input
                  type="text"
                  value={localSettings.headerText}
                  onChange={e => updateSetting('headerText', e.target.value)}
                  placeholder="e.g. Confidential · Wordora"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 mb-1 block">Footer Text</span>
                <input
                  type="text"
                  value={localSettings.footerText}
                  onChange={e => updateSetting('footerText', e.target.value)}
                  placeholder="e.g. All Rights Reserved"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Page Numbering Options */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Show Page Numbers</span>
                  <input
                    type="checkbox"
                    checked={localSettings.showPageNumber}
                    onChange={e => updateSetting('showPageNumber', e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                  />
                </label>

                {localSettings.showPageNumber && (
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['bottom-center', 'bottom-right', 'top-right'] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => updateSetting('pageNumberPosition', pos)}
                        className={`py-1 px-1 rounded text-[10px] font-medium capitalize truncate ${
                          localSettings.pageNumberPosition === pos
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer pt-1">
                  <span className="text-xs text-slate-300">Different First Page</span>
                  <input
                    type="checkbox"
                    checked={localSettings.differentFirstPage}
                    onChange={e => updateSetting('differentFirstPage', e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Preview Style Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                Preview Controls
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">View Mode</span>
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setViewMode('sheets')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      viewMode === 'sheets' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Sheets
                  </button>
                  <button
                    onClick={() => setViewMode('continuous')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      viewMode === 'continuous' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Continuous
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span className="text-xs text-slate-300">Grayscale / B&W Preview</span>
                <input
                  type="checkbox"
                  checked={grayscaleMode}
                  onChange={e => setGrayscaleMode(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Footer Save Changes button */}
          {hasUnsavedSettingsChanges && onUpdatePageSettings && (
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-[10px] text-amber-400">Settings adjusted</span>
              <button
                onClick={handleApplySettings}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Apply to Doc
              </button>
            </div>
          )}
        </aside>

        {/* Center: Scaled Printable Page Viewport */}
        <main
          ref={viewportRef}
          className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex flex-col items-center select-text"
        >
          {/* Zoom Level Pill Floating Bar on Mobile */}
          <div className="md:hidden flex items-center gap-2 mb-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs shadow-lg">
            <button
              onClick={() => {
                setZoomMode('custom');
                setZoom(z => Math.max(30, z - 10));
              }}
              className="p-1 text-slate-300"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] font-bold text-slate-200">{zoom}%</span>
            <button
              onClick={() => {
                setZoomMode('custom');
                setZoom(z => Math.min(150, z + 10));
              }}
              className="p-1 text-slate-300"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-[1px] bg-slate-700" />
            <button
              onClick={() => setZoomMode(zoomMode === 'fit-page' ? 'fit-width' : 'fit-page')}
              className="text-[10px] font-semibold text-blue-400 px-1"
            >
              {zoomMode === 'fit-page' ? 'Fit Width' : 'Fit Page'}
            </button>
          </div>

          {/* Scalable Container holding printable pages */}
          <div
            id="wordora-print-root"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              filter: grayscaleMode ? 'grayscale(100%) contrast(110%)' : 'none'
            }}
            className="flex flex-col items-center gap-8 pb-16 transition-transform duration-100 ease-out"
          >
            {/* View Mode: Multiple Individual Page Sheets */}
            {viewMode === 'sheets' ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <div key={pageNum} className="flex flex-col items-center">
                  {/* Page sheet header badge in preview */}
                  <div className="no-print-element mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Page {pageNum} of {totalPages}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">{paperDims.widthMm} × {paperDims.heightMm} mm</span>
                  </div>

                  {/* Physical Paper Sheet */}
                  <div
                    className="print-sheet-page relative bg-white text-slate-900 shadow-2xl border border-slate-300/80 flex flex-col overflow-hidden"
                    style={{
                      width: `${paperDims.widthPx}px`,
                      height: `${paperDims.heightPx}px`,
                      minHeight: `${paperDims.heightPx}px`,
                      maxHeight: `${paperDims.heightPx}px`
                    }}
                  >
                    {/* Top Running Header */}
                    {renderHeader(pageNum)}

                    {/* Content slice viewport for this exact page */}
                    <div
                      className="flex-1 overflow-hidden relative"
                      style={{
                        paddingLeft: `${localSettings.margins.left}mm`,
                        paddingRight: `${localSettings.margins.right}mm`,
                        paddingTop: `${localSettings.headerText ? 2 : localSettings.margins.top}mm`,
                        paddingBottom: `${(localSettings.footerText || localSettings.showPageNumber) ? 2 : localSettings.margins.bottom}mm`
                      }}
                    >
                      <div
                        className="document-content w-full"
                        style={{
                          transform: `translateY(-${(pageNum - 1) * printableDims.printableHeightPx}px)`,
                          fontFamily: '"Plus Jakarta Sans", "Noto Sans Bengali", sans-serif',
                          lineHeight: '1.6',
                          fontSize: '11pt',
                          color: '#0f172a'
                        }}
                        dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                      />
                    </div>

                    {/* Bottom Running Footer */}
                    {renderFooter(pageNum)}
                  </div>
                </div>
              ))
            ) : (
              /* View Mode: Continuous Document Sheet with Page Break Guides */
              <div className="flex flex-col items-center">
                <div className="no-print-element mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Continuous Roll Preview</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500">{paperDims.widthMm}mm Width</span>
                </div>

                <div
                  className="print-sheet-page relative bg-white text-slate-900 shadow-2xl border border-slate-300/80 flex flex-col"
                  style={{
                    width: `${paperDims.widthPx}px`,
                    minHeight: `${paperDims.heightPx}px`,
                    paddingTop: `${localSettings.margins.top}mm`,
                    paddingRight: `${localSettings.margins.right}mm`,
                    paddingBottom: `${localSettings.margins.bottom}mm`,
                    paddingLeft: `${localSettings.margins.left}mm`
                  }}
                >
                  {/* Top Running Header */}
                  {renderHeader(1)}

                  {/* Full Continuous Content */}
                  <div
                    className="document-content flex-1 w-full"
                    style={{
                      fontFamily: '"Plus Jakarta Sans", "Noto Sans Bengali", sans-serif',
                      lineHeight: '1.6',
                      fontSize: '11pt',
                      color: '#0f172a'
                    }}
                    dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                  />

                  {/* Bottom Running Footer */}
                  {renderFooter(1)}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
