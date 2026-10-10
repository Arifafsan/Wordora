/**
 * Full Mobile Document Editor Viewport & Coordinator
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Undo2, 
  Redo2, 
  Search, 
  Share2, 
  MoreVertical, 
  Check, 
  Lock, 
  FileText, 
  Printer, 
  Trash2,
  BarChart3,
  Sparkles,
  RefreshCw,
  Eye,
  Smartphone,
  BookOpen,
  FolderHeart,
  Info,
  ScanLine,
  Download
} from 'lucide-react';
import { DocumentModel, PageSettings, PaperTheme, DocumentStats } from '../types/document';
import { RibbonToolbar } from './RibbonToolbar';
import { BottomThumbBar } from './BottomThumbBar';
import { DocumentPaper } from './DocumentPaper';
import { MobileFormatSheet } from './MobileFormatSheet';
import { FontManagerModal } from './FontManagerModal';
import { TableEditorModal } from './TableEditorModal';
import { FindReplaceModal } from './FindReplaceModal';
import { ExportShareModal } from './ExportShareModal';
import { DocumentStatsModal } from './DocumentStatsModal';
import { SymbolsModal } from './SymbolsModal';
import { PasswordPromptModal } from './PasswordPromptModal';
import { PlaceholderFillAssistantModal } from './PlaceholderFillAssistantModal';
import { SaveAsTemplateModal } from './SaveAsTemplateModal';
import { SmartDocumentScannerModal } from './SmartDocumentScannerModal';
import { PrintPreviewModal } from './PrintPreviewModal';
import { extractPlaceholdersFromHtml } from '../utils/templateStorage';
import { unicodeToBijoy, bijoyToUnicode, detectCorruptedBanglaOrBijoy } from '../utils/banglaConverter';
import { convertDocumentSutonnyToUnicode } from '../utils/docxParser';
import { saveDocument, autoSaveDraft, calculateTextStats } from '../utils/storage';

interface EditorScreenProps {
  document: DocumentModel;
  onBackToHome: () => void;
  onSaveDocument: (doc: DocumentModel) => void;
  bengaliTypingAid: boolean;
  onOpenAbout?: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  document: initialDoc,
  onBackToHome,
  onSaveDocument,
  bengaliTypingAid,
  onOpenAbout
}) => {
  // Document state
  const [doc, setDoc] = useState<DocumentModel>(initialDoc);
  const [contentHtml, setContentHtml] = useState<string>(initialDoc.contentHtml);
  const [title, setTitle] = useState<string>(initialDoc.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // History stack for custom undo / redo
  const [history, setHistory] = useState<string[]>([initialDoc.contentHtml]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active toolbar tabs & view options
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'bangla' | 'view'>('home');
  const [currentFont, setCurrentFont] = useState<string>('Noto Sans Bengali');
  const [fontSize, setFontSize] = useState<number>(11);
  const [isContinuousView, setIsContinuousView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return true;
  });
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('white');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Contextual selection tracking
  const [activeCell, setActiveCell] = useState<HTMLElement | null>(null);

  // Modals state
  const [showMobileFormatSheet, setShowMobileFormatSheet] = useState(false);
  const [showFontManager, setShowFontManager] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPlaceholderAssistant, setShowPlaceholderAssistant] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSutonnyBanner, setShowSutonnyBanner] = useState<boolean>(() => {
    return initialDoc.contentHtml.includes('SutonnyMJ') || detectCorruptedBanglaOrBijoy(initialDoc.contentHtml);
  });

  // References
  const editorRef = useRef<HTMLDivElement>(null);
  const paperContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const savingTransitionTimer = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (savingTransitionTimer.current) clearTimeout(savingTransitionTimer.current);
    };
  }, []);

  // Save changes helper
  const handlePersist = useCallback((newHtml: string, newTitle?: string, newSettings?: PageSettings) => {
    const updated: DocumentModel = {
      ...doc,
      title: newTitle || title,
      contentHtml: newHtml,
      pageSettings: newSettings || doc.pageSettings,
      updatedAt: Date.now()
    };
    setDoc(updated);
    saveDocument(updated);
    onSaveDocument(updated);
    setSaveStatus('saved');
  }, [doc, title, onSaveDocument]);

  // Handle content changes
  const handleContentChange = (newHtml: string) => {
    setContentHtml(newHtml);
    setSaveStatus('unsaved');

    // Add to history stack (debounced)
    if (newHtml !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newHtml);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Auto-save debounced every 1.5s with explicit 'Saving...' -> 'Saved' transition
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (savingTransitionTimer.current) clearTimeout(savingTransitionTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus('saving');
      // Persist draft immediately to local storage
      autoSaveDraft(doc.id, newHtml, doc.pageSettings);

      // Keep 'Saving...' indicator visible during persistence before confirming 'Saved'
      savingTransitionTimer.current = setTimeout(() => {
        handlePersist(newHtml);
        setSaveStatus('saved');
      }, 500);
    }, 1500);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      const html = history[prev];
      setContentHtml(html);
      if (editorRef.current) editorRef.current.innerHTML = html;
      handlePersist(html);
    } else {
      window.document.execCommand('undo');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const html = history[next];
      setContentHtml(html);
      if (editorRef.current) editorRef.current.innerHTML = html;
      handlePersist(html);
    } else {
      window.document.execCommand('redo');
    }
  };

  // ExecCommand execution with formatting update
  const handleExecCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    window.document.execCommand(command, false, value);
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Change font size
  const handleChangeFontSize = (size: number) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      // Apply style inline to selection
      const span = window.document.createElement('span');
      span.style.fontSize = `${size}pt`;
      const range = selection.getRangeAt(0);
      try {
        range.surroundContents(span);
      } catch {
        handleExecCommand('fontSize', '3');
      }
    } else {
      handleExecCommand('fontSize', '3');
    }
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Insert Table
  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;" border="1"><tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; min-width: 40px;">Cell ${r + 1},${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;

    handleExecCommand('insertHTML', tableHtml);
  };

  // Table action handler
  const handleTableAction = (action: string, param?: string) => {
    if (!activeCell) return;
    const tableCell = activeCell as HTMLTableCellElement;
    const row = tableCell.closest('tr') as HTMLTableRowElement | null;
    const table = tableCell.closest('table') as HTMLTableElement | null;
    if (!table || !row) return;

    if (action === 'addRowAbove') {
      const newRow = table.insertRow(row.rowIndex);
      for (let i = 0; i < row.cells.length; i++) {
        const cell = newRow.insertCell(i);
        cell.style.cssText = 'padding: 8px 10px; border: 1px solid #cbd5e1; min-width: 40px;';
        cell.innerHTML = 'New cell';
      }
    } else if (action === 'addRowBelow') {
      const newRow = table.insertRow(row.rowIndex + 1);
      for (let i = 0; i < row.cells.length; i++) {
        const cell = newRow.insertCell(i);
        cell.style.cssText = 'padding: 8px 10px; border: 1px solid #cbd5e1; min-width: 40px;';
        cell.innerHTML = 'New cell';
      }
    } else if (action === 'deleteRow') {
      table.deleteRow(row.rowIndex);
      if (table.rows.length === 0) table.remove();
    } else if (action === 'addColLeft' || action === 'addColRight') {
      const colIdx = tableCell.cellIndex + (action === 'addColRight' ? 1 : 0);
      for (let r = 0; r < table.rows.length; r++) {
        const cell = table.rows[r].insertCell(colIdx);
        cell.style.cssText = 'padding: 8px 10px; border: 1px solid #cbd5e1; min-width: 40px;';
        cell.innerHTML = 'New';
      }
    } else if (action === 'deleteCol') {
      const colIdx = tableCell.cellIndex;
      for (let r = 0; r < table.rows.length; r++) {
        if (table.rows[r].cells.length > colIdx) {
          table.rows[r].deleteCell(colIdx);
        }
      }
    } else if (action === 'deleteTable') {
      table.remove();
      setActiveCell(null);
    } else if (action === 'setBg' && param) {
      activeCell.style.backgroundColor = param;
    }

    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Compress image to prevent exceeding browser storage quotas
  const compressImage = (file: File, maxWidth = 900, quality = 0.75): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Insert Image from device file / camera
  const handleInsertImage = async (file: File) => {
    try {
      const dataUrl = await compressImage(file);
      if (!dataUrl) return;
      const imgHtml = `<p><img src="${dataUrl}" alt="Inserted Image" style="max-width: 100%; border-radius: 6px; margin: 8px 0;" /></p><p><br/></p>`;
      handleExecCommand('insertHTML', imgHtml);
    } catch (err) {
      console.warn('Image insertion failed:', err);
    }
  };

  // Insert Link
  const handleInsertLink = () => {
    const url = prompt('Enter Web URL (e.g. https://example.com):');
    if (url) {
      handleExecCommand('createLink', url);
    }
  };

  // Insert Date / Time
  const handleInsertDateTime = (format: 'en' | 'bn') => {
    const d = new Date();
    if (format === 'bn') {
      const banglaDate = d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      handleExecCommand('insertText', banglaDate);
    } else {
      const enDate = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      handleExecCommand('insertText', enDate);
    }
  };

  // Insert Special Symbol / Bengali Diacritic at cursor
  const handleInsertSymbol = (sym: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    window.document.execCommand('insertText', false, sym);
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Insert Scanned Document OCR text into document
  const handleInsertScanIntoDoc = (scanHtml: string) => {
    const updatedHtml = (contentHtml ? contentHtml + '<br/>' : '') + scanHtml;
    setContentHtml(updatedHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = updatedHtml;
    }
    handlePersist(updatedHtml);
    setToastMessage('স্ক্যান টেক্সট ডকুমেন্টে যুক্ত করা হয়েছে (Scan inserted)');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SutonnyMJ / Bijoy ↔ Unicode Conversions
  const handleConvertSelectionToBijoy = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString();
    if (!text) {
      alert('Please select the Bengali text you wish to convert to SutonnyMJ (Bijoy).');
      return;
    }
    const converted = unicodeToBijoy(text);
    // Insert with SutonnyMJ font family
    const spanHtml = `<span style="font-family: 'SutonnyMJ', sans-serif;">${converted}</span>`;
    window.document.execCommand('insertHTML', false, spanHtml);
    if (editorRef.current) handleContentChange(editorRef.current.innerHTML);
  };

  const handleConvertSelectionToUnicode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString();
    if (!text) {
      alert('Please select the Bijoy text you wish to convert to Unicode.');
      return;
    }
    const converted = bijoyToUnicode(text);
    const spanHtml = `<span style="font-family: 'Noto Sans Bengali', sans-serif;">${converted}</span>`;
    window.document.execCommand('insertHTML', false, spanHtml);
    if (editorRef.current) handleContentChange(editorRef.current.innerHTML);
  };

  const handleConvertAllToBijoy = () => {
    if (!editorRef.current) return;
    const raw = editorRef.current.innerText;
    const converted = unicodeToBijoy(raw);
    const newHtml = `<p style="font-family: 'SutonnyMJ', sans-serif;">${converted.replace(/\n/g, '<br/>')}</p>`;
    editorRef.current.innerHTML = newHtml;
    handleContentChange(newHtml);
  };

  const handleConvertAllToUnicode = () => {
    const converted = convertDocumentSutonnyToUnicode(contentHtml);
    setContentHtml(converted);
    if (editorRef.current) editorRef.current.innerHTML = converted;
    setCurrentFont('Noto Sans Bengali');
    handlePersist(converted);
    setShowSutonnyBanner(false);
    setToastMessage('বাংলা ফন্ট সফলভাবে ঠিক করা হয়েছে (Converted to Unicode)');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find & Replace Engine
  const handleFind = (term: string, caseSensitive: boolean, wholeWord: boolean) => {
    if (!term || !editorRef.current) return { total: 0, current: 0 };
    const text = editorRef.current.innerText;
    const flags = caseSensitive ? 'g' : 'gi';
    const patternStr = wholeWord ? `\\b${term}\\b` : term;
    try {
      const re = new RegExp(patternStr, flags);
      const matches = text.match(re);
      return { total: matches ? matches.length : 0, current: matches ? 1 : 0 };
    } catch {
      return { total: 0, current: 0 };
    }
  };

  const handleFindNext = () => {
    // Uses window.find API where available
    if (typeof (window as any).find === 'function') {
      (window as any).find();
    }
  };

  const handleFindPrev = () => {
    if (typeof (window as any).find === 'function') {
      (window as any).find(null, false, true);
    }
  };

  const handleReplaceSingle = (replacement: string) => {
    window.document.execCommand('insertText', false, replacement);
    if (editorRef.current) handleContentChange(editorRef.current.innerHTML);
  };

  const handleReplaceAll = (searchTerm: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => {
    if (!editorRef.current) return 0;
    const flags = caseSensitive ? 'g' : 'gi';
    const patternStr = wholeWord ? `\\b${searchTerm}\\b` : searchTerm;
    const re = new RegExp(patternStr, flags);
    const html = editorRef.current.innerHTML;
    const matchCount = (html.match(re) || []).length;
    const newHtml = html.replace(re, replacement);
    editorRef.current.innerHTML = newHtml;
    handleContentChange(newHtml);
    return matchCount;
  };

  // Physical & External keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
          if (savingTransitionTimer.current) clearTimeout(savingTransitionTimer.current);
          setSaveStatus('saving');
          savingTransitionTimer.current = setTimeout(() => {
            handlePersist(contentHtml);
            setSaveStatus('saved');
            setToastMessage('Wordora অ্যাপে সংরক্ষিত হয়েছে (Saved)');
            setTimeout(() => setToastMessage(null), 2500);
          }, 350);
          break;
        case 'b':
          e.preventDefault();
          handleExecCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          handleExecCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          handleExecCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'f':
          e.preventDefault();
          setShowFindReplace(true);
          break;
        case 'p':
          e.preventDefault();
          setShowPrintPreview(true);
          break;
      }
    }
  };

  // Text statistics & Placeholders detection
  const stats: DocumentStats = calculateTextStats(contentHtml);
  const detectedPlaceholders = extractPlaceholdersFromHtml(contentHtml);

  return (
    <div className={`h-[100dvh] max-h-[100dvh] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between shadow-2xs safe-top">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 max-w-[50%] sm:max-w-md">
          <button
            onClick={() => {
              if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
              if (savingTransitionTimer.current) clearTimeout(savingTransitionTimer.current);
              handlePersist(contentHtml);
              onBackToHome();
            }}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  handlePersist(contentHtml, title);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    handlePersist(contentHtml, title);
                  }
                }}
                className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-indigo-500 rounded-md text-slate-900 dark:text-white"
                autoFocus
              />
            ) : (
              <div 
                onClick={() => setIsEditingTitle(true)}
                className="cursor-pointer flex items-center gap-1.5 group"
                title="Tap to rename document"
              >
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-xs group-hover:text-indigo-600 transition-colors">
                  {title}
                </h2>
                {doc.isPasswordProtected && <Lock className="w-3 h-3 text-amber-500" />}
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span>{stats.words} words</span>
              <span>·</span>
              <span 
                className={`inline-flex items-center gap-1 transition-colors ${
                  saveStatus === 'saving' 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : saveStatus === 'saved'
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-amber-600 dark:text-amber-400 font-medium'
                }`}
                title={
                  saveStatus === 'saving'
                    ? 'Automatically saving changes to local storage...'
                    : saveStatus === 'saved'
                    ? 'All changes automatically saved to local storage'
                    : 'Unsaved changes'
                }
              >
                {saveStatus === 'saving' && (
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-500" />
                )}
                {saveStatus === 'saved' && (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                )}
                {saveStatus === 'unsaved' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                <span>
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : saveStatus === 'saved'
                    ? 'Saved'
                    : 'Unsaved'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Status Indicator Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all shrink-0 ${
              saveStatus === 'saving'
                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-2xs'
                : saveStatus === 'saved'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
            title={
              saveStatus === 'saving'
                ? 'Automatically saving changes to local storage...'
                : saveStatus === 'saved'
                ? 'All changes saved to local storage'
                : 'Unsaved changes'
            }
          >
            {saveStatus === 'saving' && (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
            )}
            {saveStatus === 'saved' && (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            )}
            {saveStatus === 'unsaved' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
            <span className="text-[11px] font-semibold leading-none">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
            </span>
          </div>

          {/* Quick Fill Placeholders button if tags exist */}
          {detectedPlaceholders.length > 0 && (
            <button
              onClick={() => setShowPlaceholderAssistant(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shrink-0 shadow-2xs"
              title="Fill document placeholders ([NAME], [DATE], etc.)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Fill Fields</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-800 text-[10px] font-bold">
                {detectedPlaceholders.length}
              </span>
            </button>
          )}

          {/* Quick View Mode Toggle Pill (Mobile Fit vs A4 Sheet) */}
          <button
            onClick={() => setIsContinuousView(!isContinuousView)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
            title={isContinuousView ? 'Switch to A4 Print Sheet' : 'Switch to Mobile Fit View'}
          >
            {isContinuousView ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">মোবাইল ভিউ</span>
                <span className="sm:hidden text-[11px]">Mobile</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">এ৪ পেজ</span>
                <span className="sm:hidden text-[11px]">A4</span>
              </>
            )}
          </button>

          {/* Quick Find */}
          <button
            onClick={() => setShowFindReplace(prev => !prev)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Save (App Persistence) */}
          <button
            onClick={() => {
              if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
              if (savingTransitionTimer.current) clearTimeout(savingTransitionTimer.current);
              setSaveStatus('saving');
              savingTransitionTimer.current = setTimeout(() => {
                handlePersist(contentHtml);
                setSaveStatus('saved');
                setToastMessage('Wordora অ্যাপে সংরক্ষিত হয়েছে (Saved in App) · ফোনে ফাইল পেতে Export ট্যাপ করুন');
                setTimeout(() => setToastMessage(null), 3500);
              }, 350);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Save in App (Ctrl+S) - Tap Export to save to phone"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Export / Share to Phone Storage */}
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Export to Phone (PDF, TXT, DOCX) & Share"
          >
            <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOverflowMenu && (
              <div 
                className="absolute right-0 top-10 z-40 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-in fade-in overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700/80 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-blue-400/20">
                    <img src="/wordora-logo.png" alt="Wordora" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Wordora</span>
                </div>
                <button
                  onClick={() => {
                    setShowExportModal(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <Download className="w-4 h-4" /> Export to Phone (PDF, TXT)
                </button>
                {detectedPlaceholders.length > 0 && (
                  <button
                    onClick={() => {
                      setShowPlaceholderAssistant(true);
                      setShowOverflowMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Sparkles className="w-4 h-4" /> Fill Placeholders ({detectedPlaceholders.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSaveAsTemplate(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <FolderHeart className="w-4 h-4 text-indigo-500" /> Save as Template
                </button>
                <button
                  onClick={() => {
                    setShowScannerModal(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <ScanLine className="w-4 h-4 text-emerald-500" /> Smart Scanner (OCR)
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  onClick={() => {
                    setShowStatsModal(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <BarChart3 className="w-4 h-4 text-blue-500" /> Document Info & Stats
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <Lock className="w-4 h-4 text-amber-500" /> Password Lock
                </button>
                <button
                  onClick={() => {
                    setShowPrintPreview(true);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium text-blue-600 dark:text-blue-400"
                >
                  <Printer className="w-4 h-4" /> Print Preview & Print
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  onClick={() => {
                    setShowOverflowMenu(false);
                    if (onOpenAbout) onOpenAbout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <Info className="w-4 h-4 text-indigo-500" /> About Developer & App
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ribbon Toolbar */}
      <RibbonToolbar
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        onExecCommand={handleExecCommand}
        currentFont={currentFont}
        onOpenFontManager={() => setShowFontManager(true)}
        onOpenTableModal={() => setShowTableModal(true)}
        onOpenSymbolsModal={() => setShowSymbolsModal(true)}
        onOpenStatsModal={() => setShowStatsModal(true)}
        onInsertImage={handleInsertImage}
        onInsertLink={handleInsertLink}
        onInsertDateTime={handleInsertDateTime}
        onOpenSmartScanner={() => setShowScannerModal(true)}
        onConvertSelectionToBijoy={handleConvertSelectionToBijoy}
        onConvertSelectionToUnicode={handleConvertSelectionToUnicode}
        onConvertAllToBijoy={handleConvertAllToBijoy}
        onConvertAllToUnicode={handleConvertAllToUnicode}
        pageSettings={doc.pageSettings}
        onUpdatePageSettings={settings => {
          const updated = { ...doc.pageSettings, ...settings };
          const newDoc = { ...doc, pageSettings: updated };
          setDoc(newDoc);
          handlePersist(contentHtml, title, updated);
        }}
        isContinuousView={isContinuousView}
        onToggleContinuousView={() => setIsContinuousView(!isContinuousView)}
        paperTheme={paperTheme}
        onChangePaperTheme={setPaperTheme}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        fontSize={fontSize}
        onChangeFontSize={handleChangeFontSize}
        onOpenMobileSheet={() => setShowMobileFormatSheet(true)}
        onOpenPrintPreview={() => setShowPrintPreview(true)}
      />

      {/* SutonnyMJ / Bijoy Quick Conversion Notice Banner */}
      {showSutonnyBanner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/90 dark:to-orange-950/80 border-b-2 border-amber-400 dark:border-amber-700 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-100 font-medium">
            <div className="p-1 rounded-md bg-amber-500 text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>নষ্ট বা বিজয়ী বাংলা ফন্ট চিহ্নিত হয়েছে!</strong> লেখাগুলো পরিষ্কারভাবে পড়তে ১-ক্লিকে ইউনিকোডে রূপান্তর করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleConvertAllToUnicode}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg shadow-sm text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ফন্ট ঠিক করুন</span>
            </button>
            <button
              onClick={() => setShowSutonnyBanner(false)}
              className="p-1.5 px-2 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded text-slate-600 dark:text-slate-300 text-xs font-medium"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Document Paper Canvas */}
      <DocumentPaper
        contentHtml={contentHtml}
        onChangeContent={handleContentChange}
        pageSettings={doc.pageSettings}
        isContinuousView={isContinuousView}
        paperTheme={paperTheme}
        zoomLevel={zoomLevel}
        onActiveCellChange={setActiveCell}
        editorRef={editorRef}
        paperContainerRef={paperContainerRef}
        onKeyDown={handleKeyDown}
      />

      {/* Mobile Bottom Thumb Bar */}
      <BottomThumbBar
        onExecCommand={handleExecCommand}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        bengaliTypingAid={bengaliTypingAid}
        onInsertChar={handleInsertSymbol}
        fontSize={fontSize}
        onChangeFontSize={handleChangeFontSize}
        onOpenTableModal={() => setShowTableModal(true)}
        onOpenFontManager={() => setShowFontManager(true)}
        onOpenMobileSheet={() => setShowMobileFormatSheet(true)}
      />

      {/* Touch-Friendly Mobile Format Drawer / Sheet */}
      <MobileFormatSheet
        isOpen={showMobileFormatSheet}
        onClose={() => setShowMobileFormatSheet(false)}
        onExecCommand={handleExecCommand}
        currentFont={currentFont}
        onOpenFontManager={() => {
          setShowMobileFormatSheet(false);
          setShowFontManager(true);
        }}
        onOpenTableModal={() => {
          setShowMobileFormatSheet(false);
          setShowTableModal(true);
        }}
        onOpenSymbolsModal={() => {
          setShowMobileFormatSheet(false);
          setShowSymbolsModal(true);
        }}
        onInsertImage={handleInsertImage}
        onInsertLink={handleInsertLink}
        onInsertDateTime={handleInsertDateTime}
        onOpenSmartScanner={() => setShowScannerModal(true)}
        onConvertSelectionToBijoy={handleConvertSelectionToBijoy}
        onConvertSelectionToUnicode={handleConvertSelectionToUnicode}
        onConvertAllToBijoy={handleConvertAllToBijoy}
        onConvertAllToUnicode={handleConvertAllToUnicode}
        pageSettings={doc.pageSettings}
        onUpdatePageSettings={settings => {
          const updated = { ...doc.pageSettings, ...settings };
          const newDoc = { ...doc, pageSettings: updated };
          setDoc(newDoc);
          handlePersist(contentHtml, title, updated);
        }}
        isContinuousView={isContinuousView}
        onToggleContinuousView={() => setIsContinuousView(!isContinuousView)}
        paperTheme={paperTheme}
        onChangePaperTheme={setPaperTheme}
        fontSize={fontSize}
        onChangeFontSize={handleChangeFontSize}
      />

      {/* Find & Replace Floating Panel */}
      <FindReplaceModal
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        onFind={handleFind}
        onFindNext={handleFindNext}
        onFindPrev={handleFindPrev}
        onReplace={handleReplaceSingle}
        onReplaceAll={handleReplaceAll}
      />

      {/* Font Manager Dialog */}
      <FontManagerModal
        isOpen={showFontManager}
        onClose={() => setShowFontManager(false)}
        currentFont={currentFont}
        onSelectFont={(family, name) => {
          setCurrentFont(name);
          handleExecCommand('fontName', family);
        }}
      />

      {/* Table Editor Dialog */}
      <TableEditorModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsertTable={handleInsertTable}
        activeCell={activeCell}
        onTableAction={handleTableAction}
      />

      {/* Special Symbols Modal */}
      <SymbolsModal
        isOpen={showSymbolsModal}
        onClose={() => setShowSymbolsModal(false)}
        onInsertSymbol={handleInsertSymbol}
      />

      {/* Document Stats Modal */}
      <DocumentStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
        documentTitle={title}
      />

      {/* Export & Share Dialog */}
      <ExportShareModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        document={doc}
        editorContainerRef={paperContainerRef}
        onTogglePasswordProtection={() => {
          setShowExportModal(false);
          setShowPasswordModal(true);
        }}
        onOpenPrintPreview={() => {
          setShowExportModal(false);
          setShowPrintPreview(true);
        }}
      />

      {/* Password Protection Modal */}
      <PasswordPromptModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isSettingPassword={true}
        expectedHash={doc.passwordHash}
        onSuccess={hash => {
          const updatedDoc = {
            ...doc,
            isPasswordProtected: true,
            passwordHash: hash
          };
          setDoc(updatedDoc);
          saveDocument(updatedDoc);
          alert('Document password has been updated!');
        }}
        onRemovePassword={() => {
          const updatedDoc = {
            ...doc,
            isPasswordProtected: false,
            passwordHash: undefined
          };
          setDoc(updatedDoc);
          saveDocument(updatedDoc);
          alert('Password protection removed!');
        }}
      />

      {/* Placeholder Fill Assistant Modal */}
      <PlaceholderFillAssistantModal
        isOpen={showPlaceholderAssistant}
        onClose={() => setShowPlaceholderAssistant(false)}
        contentHtml={contentHtml}
        onApplyReplacements={(newHtml) => {
          setContentHtml(newHtml);
          if (editorRef.current) {
            editorRef.current.innerHTML = newHtml;
          }
          handlePersist(newHtml);
        }}
      />

      {/* Save as Reusable Template Modal */}
      <SaveAsTemplateModal
        isOpen={showSaveAsTemplate}
        onClose={() => setShowSaveAsTemplate(false)}
        document={doc}
      />

      {/* Smart Document Scanner Modal */}
      <SmartDocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        isInsideEditor={true}
        onInsertIntoActiveDoc={handleInsertScanIntoDoc}
        onOpenInEditor={(html, _scanTitle) => {
          handleInsertScanIntoDoc(html);
        }}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        document={doc}
        onUpdatePageSettings={settings => {
          const updated = { ...doc.pageSettings, ...settings };
          const newDoc = { ...doc, pageSettings: updated };
          setDoc(newDoc);
          handlePersist(contentHtml, title, updated);
        }}
      />
    </div>
  );
};
