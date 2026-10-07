/**
 * Mobile Bottom Thumb Bar (Touch Ergonomics)
 * 
 * Sits comfortably in the Natural Reach Zone (Bottom 40% of screen).
 * Includes high-frequency actions:
 * - Undo / Redo
 * - Bold / Italic / Underline
 * - Alignment toggle
 * - Font size quick bump
 * - Quick Bengali Diacritics strip (কার ও চিহ্ন) for touch typing with collapse toggle
 * - All Options (Formatting Sheet) trigger
 */

import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Type,
  Table as TableIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BottomThumbBarProps {
  onExecCommand: (command: string, value?: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  bengaliTypingAid: boolean;
  onInsertChar: (char: string) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  onOpenTableModal: () => void;
  onOpenFontManager: () => void;
  onOpenMobileSheet?: () => void;
}

const BENGALI_QUICK_CHARS = ['্', 'ৎ', 'ং', 'ঃ', 'ঁ', 'া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', '৷', '৳'];

export const BottomThumbBar: React.FC<BottomThumbBarProps> = ({
  onExecCommand,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  bengaliTypingAid,
  onInsertChar,
  fontSize,
  onChangeFontSize,
  onOpenTableModal,
  onOpenFontManager,
  onOpenMobileSheet
}) => {
  const [isAidCollapsed, setIsAidCollapsed] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl safe-bottom select-none">
      {/* Quick Bengali Kar & Diacritics Strip (Optional / Enabled by default) */}
      {bengaliTypingAid && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40">
          {!isAidCollapsed ? (
            <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setIsAidCollapsed(true)}
                className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 px-1 py-1 rounded hover:bg-indigo-100 shrink-0"
                title="Collapse Bangla Aid"
              >
                <span>বাংলা</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {BENGALI_QUICK_CHARS.map(ch => (
                <button
                  key={ch}
                  onClick={() => onInsertChar(ch)}
                  className="min-w-[32px] h-7 px-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-indigo-100 active:scale-95 flex items-center justify-center shrink-0 shadow-2xs"
                >
                  {ch}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-0.5">
              <button
                onClick={() => setIsAidCollapsed(false)}
                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 py-0.5"
              >
                <span>বাংলা কার ও চিহ্ন দেখান</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Touch Formatting Controls */}
      <div className="flex items-center justify-between px-2 py-1 max-w-lg mx-auto">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Font styling */}
        <div className="flex items-center">
          <button
            onClick={() => onExecCommand('bold')}
            className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => onExecCommand('italic')}
            className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => onExecCommand('underline')}
            className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Size */}
        <div className="flex items-center">
          <button
            onClick={() => onChangeFontSize(Math.max(8, fontSize - 1))}
            className="w-8 h-10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-95"
            title="Decrease font size"
          >
            A-
          </button>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-0.5">
            {fontSize}
          </span>
          <button
            onClick={() => onChangeFontSize(fontSize + 1)}
            className="w-8 h-10 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95"
            title="Increase font size"
          >
            A+
          </button>
        </div>

        {/* Shortcuts: Font Manager, Table & All Options Sheet */}
        <div className="flex items-center">
          <button
            onClick={onOpenFontManager}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Font Manager"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenTableModal}
            className="w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-400 active:scale-95 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40"
            title="Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {onOpenMobileSheet && (
            <button
              onClick={onOpenMobileSheet}
              className="w-10 h-10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:scale-95 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              title="All Formatting Options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
