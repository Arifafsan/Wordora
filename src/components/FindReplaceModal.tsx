/**
 * Find and Replace Panel
 * Supports find next/previous, replace, replace all, case sensitivity, and whole word search.
 */

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Replace, X } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (term: string, caseSensitive: boolean, wholeWord: boolean) => { total: number; current: number };
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: (replacement: string) => void;
  onReplaceAll: (searchTerm: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) => number;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  onFind,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchStats, setMatchStats] = useState({ total: 0, current: 0 });

  if (!isOpen) return null;

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const stats = onFind(term, caseSensitive, wholeWord);
      setMatchStats(stats);
    } else {
      setMatchStats({ total: 0, current: 0 });
    }
  };

  const handleOptionsChange = (newCase: boolean, newWhole: boolean) => {
    setCaseSensitive(newCase);
    setWholeWord(newWhole);
    if (searchTerm.trim()) {
      const stats = onFind(searchTerm, newCase, newWhole);
      setMatchStats(stats);
    }
  };

  const handleReplaceAllClick = () => {
    if (!searchTerm) return;
    const count = onReplaceAll(searchTerm, replaceTerm, caseSensitive, wholeWord);
    setMatchStats({ total: 0, current: 0 });
    alert(`Replaced ${count} occurrence${count === 1 ? '' : 's'}.`);
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-40 px-3 py-2 pointer-events-none">
      <div 
        className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3.5 pointer-events-auto space-y-2.5 animate-in slide-in-from-top-3 duration-150"
      >
        {/* Find Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Find in document..."
              className="w-full text-xs pl-9 pr-14 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            {matchStats.total > 0 && (
              <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-400">
                {matchStats.current}/{matchStats.total}
              </span>
            )}
          </div>

          <button
            onClick={onFindPrev}
            disabled={matchStats.total === 0}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Previous Match"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onFindNext}
            disabled={matchStats.total === 0}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Next Match"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Replace Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Replace className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={replaceTerm}
              onChange={e => setReplaceTerm(e.target.value)}
              placeholder="Replace with..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => onReplace(replaceTerm)}
            disabled={!searchTerm || matchStats.total === 0}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAllClick}
            disabled={!searchTerm}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 whitespace-nowrap transition-colors"
          >
            All
          </button>
        </div>

        {/* Search Options */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={e => handleOptionsChange(e.target.checked, wholeWord)}
              className="rounded-xs text-indigo-600 accent-indigo-600"
            />
            Match case (Aa)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={e => handleOptionsChange(caseSensitive, e.target.checked)}
              className="rounded-xs text-indigo-600 accent-indigo-600"
            />
            Whole word
          </label>
        </div>
      </div>
    </div>
  );
};
