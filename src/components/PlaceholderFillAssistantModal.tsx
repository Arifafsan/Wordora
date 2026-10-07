/**
 * Placeholder Fill Assistant Modal
 * 
 * Scans the current document for [TAG] placeholders,
 * allows quick bulk replacing of variables (e.g., [NAME], [DATE], [ORGANIZATION]),
 * and provides one-tap replacement.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Calendar, 
  ArrowRight, 
  Tag, 
  Highlighter, 
  RotateCcw 
} from 'lucide-react';
import { extractPlaceholdersFromHtml, replacePlaceholdersInHtml } from '../utils/templateStorage';

interface PlaceholderFillAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentHtml: string;
  onApplyReplacements: (newHtml: string) => void;
}

export const PlaceholderFillAssistantModal: React.FC<PlaceholderFillAssistantModalProps> = ({
  isOpen,
  onClose,
  contentHtml,
  onApplyReplacements
}) => {
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const detected = extractPlaceholdersFromHtml(contentHtml);
      setPlaceholders(detected);
      // Initialize values map
      const initial: Record<string, string> = {};
      detected.forEach(p => {
        initial[p] = '';
      });
      setValues(initial);
    }
  }, [isOpen, contentHtml]);

  if (!isOpen) return null;

  const handleInputChange = (token: string, val: string) => {
    setValues(prev => ({ ...prev, [token]: val }));
  };

  const handleSetTodayDate = (token: string) => {
    const todayBn = new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long' }).format(new Date());
    const todayEn = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
    const isBn = /[অ-হ]/.test(token);
    setValues(prev => ({ ...prev, [token]: isBn ? todayBn : todayEn }));
  };

  const handleApply = () => {
    const updated = replacePlaceholdersInHtml(contentHtml, values);
    onApplyReplacements(updated);
    onClose();
  };

  const filledCount = Object.values(values).filter(v => v.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Fill Placeholders / তথ্য পূরণ
              </h2>
              <p className="text-[11px] text-slate-500">
                Replace template fields ([NAME], [DATE], etc.) across the document
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {placeholders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No placeholders found!
              </p>
              <p className="text-slate-400 mt-1">
                All fields like [NAME] or [তারিখ] have already been filled or none are present in this document.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>
                  Found <strong>{placeholders.length}</strong> fields · <strong>{filledCount}</strong> filled
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  One-tap replace
                </span>
              </div>

              <div className="space-y-3">
                {placeholders.map(token => {
                  const isDate = token.toLowerCase().includes('date') || token.includes('তারিখ');
                  return (
                    <div 
                      key={token}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                          {token}
                        </label>
                        {isDate && (
                          <button
                            type="button"
                            onClick={() => handleSetTodayDate(token)}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Calendar className="w-3 h-3" />
                            Set Today's Date
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={values[token] || ''}
                        onChange={e => handleInputChange(token, e.target.value)}
                        placeholder={`Enter replacement for ${token}...`}
                        className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          {placeholders.length > 0 && (
            <button
              onClick={handleApply}
              disabled={filledCount === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all ${
                filledCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Replace Filled Fields ({filledCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
