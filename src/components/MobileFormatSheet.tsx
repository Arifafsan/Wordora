/**
 * Comprehensive Mobile Touch Formatting Bottom Sheet
 * 
 * Provides accessible, large touch targets for all formatting options on mobile:
 * - Text styling (Fonts, Size, B/I/U/S, Sub/Superscript, Text color palette, Highlight color, Case, Clear)
 * - Paragraph formatting (Alignment, Lists, Indents)
 * - Insert options (Tables, Images, Camera, Links, Symbols, Dates)
 * - Bangla tools (Bijoy <-> Unicode converter, Bangla fonts)
 * - Page & View settings (Mobile view, Paper sizes, Themes, Zoom)
 */

import React, { useState } from 'react';
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table as TableIcon,
  Image as ImageIcon,
  Camera,
  Link,
  Minus,
  Calendar,
  Sparkles,
  RefreshCw,
  BookOpen,
  Sun,
  Type,
  RemoveFormatting,
  Palette,
  Maximize2
} from 'lucide-react';
import { PageSettings, PaperTheme } from '../types/document';

interface MobileFormatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExecCommand: (command: string, value?: string) => void;
  currentFont: string;
  onOpenFontManager: () => void;
  onOpenTableModal: () => void;
  onOpenSymbolsModal: () => void;
  onInsertImage: (file: File) => void;
  onInsertLink: () => void;
  onInsertDateTime: (format: 'en' | 'bn') => void;
  onConvertSelectionToBijoy: () => void;
  onConvertSelectionToUnicode: () => void;
  onConvertAllToBijoy: () => void;
  onConvertAllToUnicode: () => void;
  pageSettings: PageSettings;
  onUpdatePageSettings: (settings: Partial<PageSettings>) => void;
  isContinuousView: boolean;
  onToggleContinuousView: () => void;
  paperTheme: PaperTheme;
  onChangePaperTheme: (theme: PaperTheme) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
}

export const MobileFormatSheet: React.FC<MobileFormatSheetProps> = ({
  isOpen,
  onClose,
  onExecCommand,
  currentFont,
  onOpenFontManager,
  onOpenTableModal,
  onOpenSymbolsModal,
  onInsertImage,
  onInsertLink,
  onInsertDateTime,
  onConvertSelectionToBijoy,
  onConvertSelectionToUnicode,
  onConvertAllToBijoy,
  onConvertAllToUnicode,
  pageSettings,
  onUpdatePageSettings,
  isContinuousView,
  onToggleContinuousView,
  paperTheme,
  onChangePaperTheme,
  fontSize,
  onChangeFontSize
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'paragraph' | 'insert' | 'bangla' | 'page'>('text');

  if (!isOpen) return null;

  const colors = ['#000000', '#1e293b', '#1e3a8a', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
  const highlights = ['#ffffff', '#fef08a', '#bbf7d0', '#bae6fd', '#fed7aa', '#fbcfe8', '#e9d5ff'];

  const handleCaseChange = (mode: 'upper' | 'lower' | 'title') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = selection.toString();
    if (!text) return;

    let transformed = text;
    if (mode === 'upper') transformed = text.toUpperCase();
    else if (mode === 'lower') transformed = text.toLowerCase();
    else if (mode === 'title') {
      transformed = text.replace(/\b\w/g, c => c.toUpperCase());
    }

    document.execCommand('insertText', false, transformed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150 sm:hidden">
      <div 
        className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col max-h-[82vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              ফরমেটিং ও অপশন (Formatting Tools)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto scrollbar-none">
          {[
            { id: 'text', label: 'লেখা (Text)' },
            { id: 'paragraph', label: 'অনুচ্ছেদ (Paragraph)' },
            { id: 'insert', label: 'যোগ করুন (Insert)' },
            { id: 'bangla', label: 'বাংলা (Bangla)' },
            { id: 'page', label: 'পেজ (Page)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TEXT TAB */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Font Family & Size */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ফন্ট ও সাইজ:</span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFontManager();
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
                  >
                    <Type className="w-3.5 h-3.5" /> ফন্ট ম্যানেজার
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFontManager();
                    }}
                    className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 text-left truncate"
                  >
                    {currentFont}
                  </button>
                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                    <button
                      onClick={() => onChangeFontSize(Math.max(6, fontSize - 1))}
                      className="w-8 h-7 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm active:bg-slate-100 rounded"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {fontSize}pt
                    </span>
                    <button
                      onClick={() => onChangeFontSize(fontSize + 1)}
                      className="w-8 h-7 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm active:bg-slate-100 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Style Buttons */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">স্টাইল:</span>
                <div className="grid grid-cols-6 gap-2">
                  <button
                    onClick={() => onExecCommand('bold')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
                    title="Bold"
                  >
                    <Bold className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onExecCommand('italic')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center italic hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
                    title="Italic"
                  >
                    <Italic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onExecCommand('underline')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center underline hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
                    title="Underline"
                  >
                    <Underline className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onExecCommand('strikeThrough')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onExecCommand('subscript')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold"
                    title="Subscript"
                  >
                    X₂
                  </button>
                  <button
                    onClick={() => onExecCommand('superscript')}
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold"
                    title="Superscript"
                  >
                    X²
                  </button>
                </div>
              </div>

              {/* Text Color Swatches */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">কালার (Text Color):</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => onExecCommand('foreColor', c)}
                      className="w-9 h-9 rounded-xl shrink-0 border-2 border-white dark:border-slate-800 shadow-xs active:scale-90 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Highlight Color Swatches */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">হাইলাইট (Highlight Color):</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {highlights.map(c => (
                    <button
                      key={c}
                      onClick={() => onExecCommand('hiliteColor', c)}
                      className="w-9 h-9 rounded-xl shrink-0 border border-slate-300 dark:border-slate-600 shadow-xs active:scale-90 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Case & Formatting */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleCaseChange('upper')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold text-center"
                >
                  UPPERCASE
                </button>
                <button
                  onClick={() => handleCaseChange('lower')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold text-center"
                >
                  lowercase
                </button>
                <button
                  onClick={() => onExecCommand('removeFormat')}
                  className="py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1"
                >
                  <RemoveFormatting className="w-3.5 h-3.5" /> ক্লিয়ার
                </button>
              </div>
            </div>
          )}

          {/* PARAGRAPH TAB */}
          {activeTab === 'paragraph' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">অ্যালাইনমেন্ট (Alignment):</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => onExecCommand('justifyLeft')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <AlignLeft className="w-5 h-5" />
                    <span className="text-[10px]">Left</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyCenter')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <AlignCenter className="w-5 h-5" />
                    <span className="text-[10px]">Center</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyRight')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <AlignRight className="w-5 h-5" />
                    <span className="text-[10px]">Right</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyFull')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <AlignJustify className="w-5 h-5" />
                    <span className="text-[10px]">Justify</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">লিস্ট ও ইনডেন্ট (Lists & Indents):</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => onExecCommand('insertUnorderedList')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <List className="w-5 h-5" />
                    <span className="text-[10px]">বুলেট লিস্ট</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('insertOrderedList')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <ListOrdered className="w-5 h-5" />
                    <span className="text-[10px]">নম্বর লিস্ট</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('outdent')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <Outdent className="w-5 h-5" />
                    <span className="text-[10px]">ইনডেন্ট -</span>
                  </button>
                  <button
                    onClick={() => onExecCommand('indent')}
                    className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 hover:bg-slate-200"
                  >
                    <Indent className="w-5 h-5" />
                    <span className="text-[10px]">ইনডেন্ট +</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INSERT TAB */}
          {activeTab === 'insert' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenTableModal();
                  }}
                  className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-200 flex items-center gap-2.5 font-medium text-xs text-left"
                >
                  <TableIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-bold">টেবিল (Table)</p>
                    <p className="text-[10px] text-blue-600/80">রো ও কলাম যোগ</p>
                  </div>
                </button>

                <label className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-200 flex items-center gap-2.5 font-medium text-xs text-left cursor-pointer">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-bold">ছবি (Photo)</p>
                    <p className="text-[10px] text-indigo-600/80">ডিভাইস থেকে আনুন</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onInsertImage(file);
                        onClose();
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <label className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 font-medium text-xs text-left cursor-pointer">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold">ক্যামেরা (Camera)</p>
                    <p className="text-[10px] text-emerald-600/80">সরাসরি ছবি তুলুন</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onInsertImage(file);
                        onClose();
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSymbolsModal();
                  }}
                  className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-purple-800 dark:text-purple-200 flex items-center gap-2.5 font-medium text-xs text-left"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-bold">প্রতীক (Symbols)</p>
                    <p className="text-[10px] text-purple-600/80">টাকা, কার, চিহ্ন</p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onInsertDateTime('bn');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" /> তারিখ (বাংলা)
                </button>
                <button
                  onClick={() => {
                    onInsertDateTime('en');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-slate-500" /> Date (EN)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onInsertLink();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Link className="w-4 h-4 text-blue-600" /> হাইপারলিঙ্ক
                </button>
                <button
                  onClick={() => {
                    onExecCommand('insertHorizontalRule');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Minus className="w-4 h-4 text-slate-500" /> বিভাজক রেখা
                </button>
              </div>
            </div>
          )}

          {/* BANGLA TAB */}
          {activeTab === 'bangla' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>বাংলা ফন্ট মেরামত ও রূপান্তর</span>
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    SutonnyMJ / Bijoy
                  </span>
                </div>
                
                {/* 1-click Repair Button */}
                <button
                  onClick={() => {
                    onConvertAllToUnicode();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>নষ্ট ফন্ট মেরামত করুন (পুরো পেজ ➔ ইউনিকোড)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onConvertSelectionToUnicode();
                      onClose();
                    }}
                    className="py-2.5 px-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-200 text-center shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>সিলেকশন ➔ ইউনিকোড</span>
                  </button>
                  <button
                    onClick={() => {
                      onConvertSelectionToBijoy();
                      onClose();
                    }}
                    className="py-2.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 text-center shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>সিলেকশন ➔ বিজয়</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">দ্রুত বাংলা ফন্ট নির্বাচন:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onExecCommand('fontName', 'Noto Sans Bengali, sans-serif');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium text-left"
                  >
                    Noto Sans বাংলা
                  </button>
                  <button
                    onClick={() => {
                      onExecCommand('fontName', '"Noto Serif Bengali", serif');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium text-left font-serif"
                  >
                    Noto Serif বাংলা
                  </button>
                  <button
                    onClick={() => {
                      onExecCommand('fontName', 'Kalpurush, sans-serif');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium text-left"
                  >
                    কালপুরুষ (Kalpurush)
                  </button>
                  <button
                    onClick={() => {
                      onExecCommand('fontName', '"SutonnyMJ", sans-serif');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-950 dark:text-amber-200 text-xs font-bold text-left"
                  >
                    SutonnyMJ (বিজয়)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE & VIEW TAB */}
          {activeTab === 'page' && (
            <div className="space-y-4">
              {/* View mode toggle */}
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    {isContinuousView ? '📱 মোবাইল ভিউ (Fit to Screen)' : '📄 এ৪ প্রিন্ট পেজ (Paginated Sheet)'}
                  </p>
                  <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80">
                    {isContinuousView ? 'মোবাইলে সহজে টাইপ করার জন্য উপযুক্ত' : 'প্রিন্ট ও পেজ ব্রেক দেখার জন্য'}
                  </p>
                </div>
                <button
                  onClick={onToggleContinuousView}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
                >
                  {isContinuousView ? 'Switch to A4' : 'Switch to Mobile'}
                </button>
              </div>

              {/* Paper Theme */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">পেপারের থিম (Paper Theme):</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onChangePaperTheme('white')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                      paperTheme === 'white' ? 'border-indigo-600 bg-white text-slate-900 ring-2 ring-indigo-500/30' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    হোয়াইট (White)
                  </button>
                  <button
                    onClick={() => onChangePaperTheme('sepia')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                      paperTheme === 'sepia' ? 'border-amber-600 bg-[#fbf0d9] text-amber-950 ring-2 ring-amber-500/30' : 'bg-[#fbf0d9]/60 text-amber-900'
                    }`}
                  >
                    সেপিয়া (Sepia)
                  </button>
                  <button
                    onClick={() => onChangePaperTheme('dark')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                      paperTheme === 'dark' ? 'border-indigo-400 bg-slate-900 text-white ring-2 ring-indigo-400/30' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    ডার্ক (Dark)
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">কাগজের সাইজ (Paper Size):</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['a4', 'letter', 'legal'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdatePageSettings({ paperSize: size })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase text-center ${
                        pageSettings.paperSize === size
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">অরিয়েন্টেশন (Orientation):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdatePageSettings({ orientation: 'portrait' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                      pageSettings.orientation === 'portrait'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Portrait (উল্লম্ব)
                  </button>
                  <button
                    onClick={() => onUpdatePageSettings({ orientation: 'landscape' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                      pageSettings.orientation === 'landscape'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Landscape (অনুভূমিক)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
