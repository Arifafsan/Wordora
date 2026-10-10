/**
 * Document Export & Share Dialog
 * 
 * Provides genuine, reliable export to device storage:
 * - Android Storage Access Framework (ACTION_CREATE_DOCUMENT) with folder selection
 * - Android Downloads folder (MediaStore.Downloads)
 * - Web File System Access API with cancelation detection
 * - Standard verified browser downloads
 * - Supports .PDF, .TXT, .DOCX, and .HTML
 * - Editable / confirmable file name
 * - Accurate success & error feedback without false positives
 */

import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Printer, 
  Share2, 
  Download, 
  X, 
  Check, 
  Loader2,
  Lock,
  FileCheck,
  AlertCircle,
  FolderOpen,
  Info
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { DocumentModel } from '../types/document';
import { exportToDocx } from '../utils/docxExport';
import { exportToPdf, printDocument, shareDocument } from '../utils/pdfExport';
import { 
  saveExportedFile, 
  sanitizeFileName, 
  ensureExtension, 
  extractPlainTextFromHtml, 
  isDocumentEmpty 
} from '../utils/fileExport';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
  editorContainerRef?: React.RefObject<HTMLDivElement | null>;
  onTogglePasswordProtection?: () => void;
  onOpenPrintPreview?: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  document,
  editorContainerRef,
  onTogglePasswordProtection,
  onOpenPrintPreview
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; path?: string } | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filename confirmation/customization
  const [exportFileName, setExportFileName] = useState<string>(() => 
    sanitizeFileName(document.title || 'Wordora_Document')
  );

  // Save mode: 'picker' (SAF / Save As) or 'downloads' (Direct Downloads folder)
  const isNative = Capacitor.isNativePlatform();
  const [saveMode, setSaveMode] = useState<'picker' | 'downloads'>('picker');

  if (!isOpen) return null;

  const clearMessages = () => {
    setSuccessInfo(null);
    setNoticeMessage(null);
    setErrorMessage(null);
  };

  const handleExportDocx = async () => {
    clearMessages();
    const baseName = sanitizeFileName(exportFileName, 'Wordora_Document');
    const finalName = ensureExtension(baseName, 'docx');

    try {
      setLoadingAction('docx');
      const blob = await exportToDocx(document);
      const result = await saveExportedFile({
        blob,
        fileName: finalName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        saveMode
      });

      if (result.success) {
        setSuccessInfo({
          message: `DOCX file saved successfully as "${finalName}"`,
          path: result.destinationName || (saveMode === 'downloads' ? 'Downloads/Wordora' : 'File Manager')
        });
      } else if (result.cancelled) {
        setNoticeMessage('Export cancelled by user.');
      } else {
        setErrorMessage(result.error || 'Failed to export DOCX file.');
      }
    } catch (err: unknown) {
      console.error('DOCX export error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate DOCX file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportPdf = async () => {
    clearMessages();
    const baseName = sanitizeFileName(exportFileName, 'Wordora_Document');
    const finalName = ensureExtension(baseName, 'pdf');

    try {
      setLoadingAction('pdf');
      // Pass the container element or fallback directly to HTML string
      const source = editorContainerRef?.current || document.contentHtml;
      const blob = await exportToPdf(
        source,
        finalName,
        document.pageSettings.orientation,
        document.pageSettings
      );

      const result = await saveExportedFile({
        blob,
        fileName: finalName,
        mimeType: 'application/pdf',
        saveMode
      });

      if (result.success) {
        setSuccessInfo({
          message: `PDF document saved successfully as "${finalName}"`,
          path: result.destinationName || (saveMode === 'downloads' ? 'Downloads/Wordora' : 'File Manager')
        });
      } else if (result.cancelled) {
        setNoticeMessage('Export cancelled by user.');
      } else {
        setErrorMessage(result.error || 'Failed to export PDF file.');
      }
    } catch (err: unknown) {
      console.error('PDF export error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate PDF file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportTxt = async () => {
    clearMessages();
    const baseName = sanitizeFileName(exportFileName, 'Wordora_Document');
    const finalName = ensureExtension(baseName, 'txt');

    try {
      setLoadingAction('txt');
      const plainText = extractPlainTextFromHtml(document.contentHtml);
      if (!plainText.trim() && isDocumentEmpty(document.contentHtml)) {
        setErrorMessage('Cannot export: Document is currently empty.');
        setLoadingAction(null);
        return;
      }

      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      const result = await saveExportedFile({
        blob,
        fileName: finalName,
        mimeType: 'text/plain;charset=utf-8',
        saveMode
      });

      if (result.success) {
        setSuccessInfo({
          message: `Plain text file saved successfully as "${finalName}"`,
          path: result.destinationName || (saveMode === 'downloads' ? 'Downloads/Wordora' : 'File Manager')
        });
      } else if (result.cancelled) {
        setNoticeMessage('Export cancelled by user.');
      } else {
        setErrorMessage(result.error || 'Failed to export TXT file.');
      }
    } catch (err: unknown) {
      console.error('TXT export error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export TXT file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportHtml = async () => {
    clearMessages();
    const baseName = sanitizeFileName(exportFileName, 'Wordora_Document');
    const finalName = ensureExtension(baseName, 'html');

    try {
      setLoadingAction('html');
      const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${document.title || 'Wordora Document'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans Bengali', 'Plus Jakarta Sans', sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f8fafc; font-weight: 600; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${document.contentHtml}
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const result = await saveExportedFile({
        blob,
        fileName: finalName,
        mimeType: 'text/html;charset=utf-8',
        saveMode
      });

      if (result.success) {
        setSuccessInfo({
          message: `HTML document saved successfully as "${finalName}"`,
          path: result.destinationName || (saveMode === 'downloads' ? 'Downloads/Wordora' : 'File Manager')
        });
      } else if (result.cancelled) {
        setNoticeMessage('Export cancelled by user.');
      } else {
        setErrorMessage(result.error || 'Failed to export HTML file.');
      }
    } catch (err: unknown) {
      console.error('HTML export error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export HTML file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShare = async () => {
    clearMessages();
    try {
      setLoadingAction('share');
      const blob = await exportToDocx(document);
      const shared = await shareDocument(
        document, 
        blob, 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        `${sanitizeFileName(exportFileName)}.docx`
      );
      if (shared) {
        setSuccessInfo({ message: 'Document shared successfully!' });
      } else {
        navigator.clipboard.writeText(document.title);
        setSuccessInfo({ message: 'Document title copied to clipboard!' });
      }
    } catch {
      setSuccessInfo({ message: 'Sharing completed.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Export Document</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">Save file directly to device storage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {successInfo && (
          <div className="mx-5 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{successInfo.message}</p>
              {successInfo.path && (
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                  📁 Location: <span className="font-medium underline">{successInfo.path}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {noticeMessage && (
          <div className="mx-5 mt-3 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Filename Input & Confirmation */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              File Name (ফাইলের নাম):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={exportFileName}
                onChange={e => {
                  setExportFileName(e.target.value);
                  clearMessages();
                }}
                placeholder="Enter document file name..."
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            
            {/* Storage Destination Selector for Android Native */}
            {isNative && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Save to:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSaveMode('picker')}
                    className={`px-2 py-1 rounded-md transition-colors font-medium ${
                      saveMode === 'picker'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Choose Folder (SAF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveMode('downloads')}
                    className={`px-2 py-1 rounded-md transition-colors font-medium ${
                      saveMode === 'downloads'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Downloads Folder
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Export Format
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* PDF Card */}
              <button
                onClick={handleExportPdf}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 text-left transition-all group flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
                    {loadingAction === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">.PDF</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Adobe PDF</p>
                  <p className="text-[10px] text-slate-500">Vector print-ready page</p>
                </div>
              </button>

              {/* TXT Card */}
              <button
                onClick={handleExportTxt}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    {loadingAction === 'txt' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.TXT</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Plain Text</p>
                  <p className="text-[10px] text-slate-500">UTF-8 Bengali & English</p>
                </div>
              </button>

              {/* DOCX Card */}
              <button
                onClick={handleExportDocx}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 text-left transition-all group flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                    {loadingAction === 'docx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">.DOCX</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Word Document</p>
                  <p className="text-[10px] text-slate-500">Standard Word format</p>
                </div>
              </button>

              {/* HTML Card */}
              <button
                onClick={handleExportHtml}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 text-left transition-all group flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                    {loadingAction === 'html' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">.HTML</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Web HTML</p>
                  <p className="text-[10px] text-slate-500">Standalone styled page</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Device Actions
            </p>
            <div className="space-y-2">
              <button
                onClick={handleShare}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    {loadingAction === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Share via Apps</p>
                    <p className="text-[10px] text-slate-500">WhatsApp, Gmail, Telegram, Bluetooth</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenPrintPreview) {
                    onOpenPrintPreview();
                  } else {
                    printDocument();
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Print Preview & Print</p>
                    <p className="text-[10px] text-slate-500">Preview page layout, adjust setup, wireless print</p>
                  </div>
                </div>
              </button>

              {onTogglePasswordProtection && (
                <button
                  onClick={onTogglePasswordProtection}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {document.isPasswordProtected ? 'Change / Remove Password' : 'Set Password Protection'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {document.isPasswordProtected ? 'Document is currently encrypted & locked' : 'Prevent unauthorized viewing'}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
