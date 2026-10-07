/**
 * Document Export & Share Dialog
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
  FileCheck
} from 'lucide-react';
import { DocumentModel } from '../types/document';
import { exportToDocx, downloadFile } from '../utils/docxExport';
import { exportToPdf, printDocument, shareDocument } from '../utils/pdfExport';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
  onTogglePasswordProtection?: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  document,
  editorContainerRef,
  onTogglePasswordProtection
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportDocx = async () => {
    try {
      setLoadingAction('docx');
      const blob = await exportToDocx(document);
      downloadFile(blob, `${document.title || 'document'}.docx`);
      showSuccess('DOCX document downloaded successfully!');
    } catch (err) {
      console.error('DOCX export error:', err);
      alert('Failed to generate DOCX file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportPdf = async () => {
    if (!editorContainerRef.current) return;
    try {
      setLoadingAction('pdf');
      const blob = await exportToPdf(
        editorContainerRef.current, 
        `${document.title}.pdf`, 
        document.pageSettings.orientation
      );
      downloadFile(blob, `${document.title || 'document'}.pdf`);
      showSuccess('PDF document downloaded successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportTxt = () => {
    const tmp = window.document.createElement('div');
    tmp.innerHTML = document.contentHtml;
    const plainText = tmp.innerText || tmp.textContent || '';
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${document.title || 'document'}.txt`);
    showSuccess('Plain text file downloaded!');
  };

  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
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
    downloadFile(blob, `${document.title || 'document'}.html`);
    showSuccess('HTML document downloaded!');
  };

  const handleShare = async () => {
    try {
      setLoadingAction('share');
      const blob = await exportToDocx(document);
      const shared = await shareDocument(document, blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', `${document.title}.docx`);
      if (shared) {
        showSuccess('Document shared successfully!');
      } else {
        // Fallback: copy link/text
        navigator.clipboard.writeText(document.title);
        showSuccess('Document title copied to clipboard!');
      }
    } catch {
      showSuccess('Sharing completed.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Export & Share</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{document.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Standard Formats
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* DOCX */}
              <button
                onClick={handleExportDocx}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                    {loadingAction === 'docx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">.DOCX</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Word Document</p>
                  <p className="text-[10px] text-slate-500">Standard DOCX format</p>
                </div>
              </button>

              {/* PDF */}
              <button
                onClick={handleExportPdf}
                disabled={loadingAction !== null}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 text-left transition-all group flex flex-col justify-between"
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

              {/* TXT */}
              <button
                onClick={handleExportTxt}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.TXT</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Plain Text</p>
                  <p className="text-[10px] text-slate-500">Clean unformatted text</p>
                </div>
              </button>

              {/* HTML */}
              <button
                onClick={handleExportHtml}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                    <Code className="w-4 h-4" />
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
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Share via Apps</p>
                    <p className="text-[10px] text-slate-500">WhatsApp, Gmail, Telegram, Bluetooth</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  printDocument();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Print or Save as PDF</p>
                    <p className="text-[10px] text-slate-500">Native Android wireless printer & PDF writer</p>
                  </div>
                </div>
              </button>

              {onTogglePasswordProtection && (
                <button
                  onClick={onTogglePasswordProtection}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
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
