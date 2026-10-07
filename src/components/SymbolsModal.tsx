/**
 * Special Symbols & Characters Insert Modal
 */

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface SymbolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
}

const SYMBOL_CATEGORIES = [
  {
    name: 'Bengali Special',
    symbols: ['্', 'ৎ', 'ং', 'ঃ', 'ঁ', 'ঽ', 'ৗ', 'ঋ', 'ৠ', 'ঌ', 'ৡ', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০', '৳', '৷', '্য', '্র', '্ব']
  },
  {
    name: 'Currency & Math',
    symbols: ['৳', '$', '€', '£', '¥', '₹', '±', '×', '÷', '≠', '≈', '≤', '≥', '√', '∞', 'π', '∑', '∆', 'µ', '°', '‰', '%', '¼', '½', '¾']
  },
  {
    name: 'Typography & Bullets',
    symbols: ['•', '—', '–', '…', '“', '”', '‘', '’', '«', '»', '§', '¶', '©', '®', '™', '✓', '✕', '★', '☆', '◆', '◇', '▲', '▼', '→', '←', '↑', '↓']
  }
];

export const SymbolsModal: React.FC<SymbolsModalProps> = ({
  isOpen,
  onClose,
  onInsertSymbol
}) => {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Insert Special Symbol</h3>
              <p className="text-[11px] text-slate-500">Tap any character to insert at cursor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto">
          {SYMBOL_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === idx
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Symbol Grid */}
        <div className="p-5 grid grid-cols-6 sm:grid-cols-7 gap-2 overflow-y-auto max-h-[300px]">
          {SYMBOL_CATEGORIES[activeCategory].symbols.map((sym, i) => (
            <button
              key={i}
              onClick={() => {
                onInsertSymbol(sym);
                onClose();
              }}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-base font-medium flex items-center justify-center text-slate-800 dark:text-slate-100 active:scale-95 transition-all"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
