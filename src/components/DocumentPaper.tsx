/**
 * Document Paper Viewport
 * 
 * Renders the realistic word-processor page layout or continuous mobile view.
 * Handles contentEditable bindings, table click awareness, selection monitoring,
 * and page background themes.
 * 
 * Features mobile-first auto-fit, full-width continuous typing mode, and
 * prevents CSS overflow data-loss truncation.
 */

import React, { useRef, useEffect, useState } from 'react';
import { PageSettings, PaperTheme } from '../types/document';

interface DocumentPaperProps {
  contentHtml: string;
  onChangeContent: (html: string) => void;
  pageSettings: PageSettings;
  isContinuousView: boolean;
  paperTheme: PaperTheme;
  zoomLevel: number;
  onActiveCellChange: (cell: HTMLElement | null) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  paperContainerRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const DocumentPaper: React.FC<DocumentPaperProps> = ({
  contentHtml,
  onChangeContent,
  pageSettings,
  isContinuousView,
  paperTheme,
  zoomLevel,
  onActiveCellChange,
  editorRef,
  paperContainerRef,
  onKeyDown
}) => {
  const isInternalUpdate = useRef(false);
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

  // Measure container width for responsive page sheet scaling
  useEffect(() => {
    if (!paperContainerRef.current) return;
    const updateWidth = () => {
      if (paperContainerRef.current) {
        setContainerWidth(paperContainerRef.current.clientWidth);
      }
    };
    updateWidth();

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(paperContainerRef.current);
    return () => observer.disconnect();
  }, [paperContainerRef]);

  // Sync initial content once or on external document switch
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml;
      }
    }
    isInternalUpdate.current = false;
  }, [contentHtml, editorRef]);

  // Handle click / cursor movements inside contentEditable to track active table cell
  const handleEditorClick = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLElement | null;
    onActiveCellChange(cell);
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      onChangeContent(html);
    }
  };

  // Paper styling based on theme
  const getPaperThemeClasses = () => {
    switch (paperTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#2c1d11] border-[#e8d5b5] shadow-sm';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-800 shadow-sm';
      case 'white':
      default:
        return 'bg-white text-slate-900 border-slate-200 shadow-sm sm:shadow-lg';
    }
  };

  // Convert mm to px approx (1 mm ~ 3.78px on 96dpi display)
  const margins = pageSettings.margins;
  const paddingStyle = isContinuousView
    ? { padding: '20px 16px' }
    : {
        paddingTop: `${Math.round(margins.top * 2.8)}px`,
        paddingRight: `${Math.round(margins.right * 2.8)}px`,
        paddingBottom: `${Math.round(margins.bottom * 2.8)}px`,
        paddingLeft: `${Math.round(margins.left * 2.8)}px`
      };

  // Paper dimensions
  const getPaperDimensions = () => {
    if (isContinuousView) {
      return 'w-full max-w-3xl min-h-[calc(100dvh-200px)] rounded-xl sm:rounded-2xl';
    }

    const isLandscape = pageSettings.orientation === 'landscape';
    if (pageSettings.paperSize === 'letter') {
      return isLandscape ? 'w-[279mm] min-h-[216mm]' : 'w-[216mm] min-h-[279mm]';
    } else if (pageSettings.paperSize === 'legal') {
      return isLandscape ? 'w-[356mm] min-h-[216mm]' : 'w-[216mm] min-h-[356mm]';
    }
    // Default A4
    return isLandscape ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]';
  };

  // Calculate smart zoom factor:
  // In continuous view, scale is 100% (fits full width natively).
  // In page view on mobile screens (< 768px), auto-fit the full A4 sheet to screen width so it's NEVER cut off!
  const sheetWidthPx = pageSettings.orientation === 'landscape' ? 1122 : 794;
  const autoMobileFitScale = containerWidth < 768
    ? Math.min(1, Math.max(0.38, (containerWidth - 28) / sheetWidthPx))
    : 1;

  const effectiveZoom = isContinuousView
    ? 100
    : Math.round((zoomLevel / 100) * autoMobileFitScale * 100);

  return (
    <div 
      className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200/70 dark:bg-slate-950/90 p-2 sm:p-6 pb-44 sm:pb-28 select-text flex flex-col items-center"
      ref={paperContainerRef}
    >
      <div
        className="w-full flex flex-col items-center transition-transform origin-top my-auto sm:my-0"
        style={{
          transform: isContinuousView ? 'none' : `scale(${effectiveZoom / 100})`,
          transformOrigin: 'top center'
        }}
      >
        {/* The Realistic Document Page Sheet */}
        <div
          className={`print-page relative border transition-colors duration-200 flex flex-col ${getPaperDimensions()} ${getPaperThemeClasses()}`}
          style={paddingStyle}
        >
          {/* Top Header Section (Word processor header) */}
          {!isContinuousView && pageSettings.headerText && (
            <div className="absolute top-4 left-6 sm:left-8 right-6 sm:right-8 flex items-center justify-between text-[11px] text-slate-400 border-b border-dashed border-slate-300/60 pb-1 select-none pointer-events-none">
              <span>{pageSettings.headerText}</span>
              <span className="font-mono text-[10px]">Wordora</span>
            </div>
          )}

          {/* Core ContentEditable Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onClick={handleEditorClick}
            onKeyUp={handleEditorClick}
            onKeyDown={onKeyDown}
            className="document-content flex-1 text-sm sm:text-base leading-relaxed focus:outline-none w-full"
            style={{
              minHeight: isContinuousView ? '60vh' : '750px',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans Bengali", sans-serif'
            }}
          />

          {/* Bottom Footer Section with Dynamic Page Number */}
          {!isContinuousView && (
            <div className="absolute bottom-4 left-6 sm:left-8 right-6 sm:right-8 flex items-center justify-between text-[11px] text-slate-400 border-t border-dashed border-slate-300/60 pt-1 select-none pointer-events-none">
              <span>{pageSettings.footerText}</span>
              {pageSettings.showPageNumber && (
                <span className="font-mono text-[10px] font-semibold text-slate-500">
                  Page 1 of 1
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
