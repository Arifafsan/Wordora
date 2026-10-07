/**
 * Document Statistics & Word Count Dialog
 */

import React from 'react';
import { BarChart3, Clock, FileText, AlignLeft, X } from 'lucide-react';
import { DocumentStats } from '../types/document';

interface DocumentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DocumentStats;
  documentTitle: string;
}

export const DocumentStatsModal: React.FC<DocumentStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  documentTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Document Statistics</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{documentTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Words</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.words}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Estimated Pages</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">{stats.pageEstimate}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Characters (with spaces)
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">{stats.charactersWithSpaces}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Characters (no spaces)
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">{stats.charactersWithoutSpaces}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" /> Paragraphs
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">{stats.paragraphs}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Reading Time
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">~{stats.readingTimeMinutes} min</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
