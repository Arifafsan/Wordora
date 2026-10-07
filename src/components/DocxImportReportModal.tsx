/**
 * DOCX Import Compatibility Report Dialog
 * 
 * Shows users transparent details of imported Word files:
 * - Detected fonts (Times New Roman, Arial, Calibri, Noto Sans Bengali, SutonnyMJ)
 * - Extracted tables, images, headers, footers, page orientation, margins
 * - Bangla text encoding analysis (Unicode vs SutonnyMJ/Bijoy)
 * - Compatibility audit & alerts for non-standard elements (macros, shapes, SmartArt)
 * - One-click Bijoy to Unicode converter toggle
 */

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Layers, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Type, 
  Compass, 
  ArrowRight, 
  X,
  Sparkles,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { DocxImportReport } from '../utils/docxParser';

interface DocxImportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DocxImportReport;
  onConfirmOpen: (convertSutonny: boolean) => void;
}

export const DocxImportReportModal: React.FC<DocxImportReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onConfirmOpen
}) => {
  const [shouldConvertSutonny, setShouldConvertSutonny] = useState<boolean>(report.hasSutonnyMJ);

  if (!isOpen) return null;

  const fileSizeKb = Math.round(report.fileSize / 1024);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Word Document Imported
                </h3>
                {report.isFullySupported ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> 100% Compatible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    <Info className="w-3 h-3" /> Compatible with notes
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[260px] sm:max-w-md">
                {report.fileName} ({fileSizeKb} KB)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* SutonnyMJ / Bijoy Notice Banner if detected */}
          {report.hasSutonnyMJ && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-2xl space-y-2.5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-100 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>কম্পিউটার বিজয়ী / নষ্ট বাংলা ফন্ট চিহ্নিত হয়েছে</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium">Bijoy / SutonnyMJ</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-800/90 dark:text-amber-200/90 mt-0.5 leading-relaxed">
                    কম্পিউটার ফাইলটিতে পুরোনো SutonnyMJ (Bijoy ANSI) ফন্ট রয়েছে যা ব্রাউজারে নষ্ট বা অদ্ভুত অক্ষরের মতো দেখায়। আমরা এটি <strong>১-ক্লিকে আধুনিক পরিষ্কার বাংলা ইউনিকোডে</strong> রূপান্তর করে দিচ্ছি যাতে সব ডিভাইসে সঠিকভাবে দেখা যায়।
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-300 dark:border-amber-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    নষ্ট ফন্ট মেরামত করুন (স্বয়ংক্রিয় ইউনিকোড রূপান্তর)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ সুপারিশকৃত (Recommended for correct display)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={shouldConvertSutonny} 
                    onChange={e => setShouldConvertSutonny(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Words / Pages</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {report.wordCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">({report.pageCountEstimate} p.)</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Page Layout</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 capitalize flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                {report.orientation}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tables Found</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
                {report.tableCount} table{report.tableCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Images Extracted</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                {report.imageCount} image{report.imageCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Typography & Fonts Section */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>Fonts in this Document:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {report.detectedFonts.length > 0 ? (
                report.detectedFonts.map((font, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
                  >
                    {font}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Standard document fonts (Calibri / Arial)</span>
              )}
              {report.hasBanglaUnicode && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
                  Bangla Unicode
                </span>
              )}
            </div>
          </div>

          {/* Margins & Headers/Footers */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">Margins:</span>
              <span>Top: {report.margins.top}mm, Bottom: {report.margins.bottom}mm, Left: {report.margins.left}mm, Right: {report.margins.right}mm</span>
            </div>
            {report.headerText && (
              <div className="flex justify-between truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">Header:</span>
                <span className="truncate max-w-[200px] text-right">{report.headerText}</span>
              </div>
            )}
            {report.footerText && (
              <div className="flex justify-between truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">Footer:</span>
                <span className="truncate max-w-[200px] text-right">{report.footerText}</span>
              </div>
            )}
          </div>

          {/* Unsupported Features / Compatibility Warnings */}
          {report.unsupportedFeatures.length > 0 && (
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200 text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Non-standard features safely adapted:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300/90">
                {report.unsupportedFeatures.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmOpen(shouldConvertSutonny)}
            className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            <span>Open & Edit Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
