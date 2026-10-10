/**
 * Desktop & Mobile-Adaptive Ribbon Toolbar
 * 
 * Features tabs:
 * - HOME (Typography, Styling, Colors, Case, Align, Spacing, Lists)
 * - INSERT (Table, Image, Camera, Link, Page Break, Rule, Symbols, Date)
 * - LAYOUT (Paper size, Orientation, Margins, Header/Footer, Mobile view toggle)
 * - BANGLA & FONTS (SutonnyMJ / Bijoy Converter, Font switchers)
 * - VIEW (Page View, Continuous, Paper Theme, Zoom, Fullscreen, Stats)
 * 
 * Includes mobile-first 2-row layout, collapsible panel, and full mobile format sheet trigger.
 */

import React, { useState } from 'react';
import {
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
  Columns,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sun,
  FileDown,
  BookOpen,
  Layout,
  Type,
  RemoveFormatting,
  SlidersHorizontal,
  Smartphone,
  ScanLine,
  Printer
} from 'lucide-react';
import { PageSettings, PaperTheme } from '../types/document';
import { BUILT_IN_FONTS } from '../utils/fontManager';

interface RibbonToolbarProps {
  activeTab: 'home' | 'insert' | 'layout' | 'bangla' | 'view';
  onTabChange: (tab: 'home' | 'insert' | 'layout' | 'bangla' | 'view') => void;
  // Formatting actions
  onExecCommand: (command: string, value?: string) => void;
  currentFont: string;
  onOpenFontManager: () => void;
  onOpenTableModal: () => void;
  onOpenSymbolsModal: () => void;
  onOpenStatsModal: () => void;
  onInsertImage: (file: File) => void;
  onInsertLink: () => void;
  onInsertDateTime: (format: 'en' | 'bn') => void;
  onOpenSmartScanner?: () => void;
  // Bangla conversions
  onConvertSelectionToBijoy: () => void;
  onConvertSelectionToUnicode: () => void;
  onConvertAllToBijoy: () => void;
  onConvertAllToUnicode: () => void;
  // Layout & View
  pageSettings: PageSettings;
  onUpdatePageSettings: (settings: Partial<PageSettings>) => void;
  isContinuousView: boolean;
  onToggleContinuousView: () => void;
  paperTheme: PaperTheme;
  onChangePaperTheme: (theme: PaperTheme) => void;
  zoomLevel: number;
  onChangeZoom: (zoom: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  onOpenMobileSheet?: () => void;
  onOpenPrintPreview?: () => void;
}

export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({
  activeTab,
  onTabChange,
  onExecCommand,
  currentFont,
  onOpenFontManager,
  onOpenTableModal,
  onOpenSymbolsModal,
  onOpenStatsModal,
  onInsertImage,
  onInsertLink,
  onInsertDateTime,
  onOpenSmartScanner,
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
  zoomLevel,
  onChangeZoom,
  isFullscreen,
  onToggleFullscreen,
  fontSize,
  onChangeFontSize,
  onOpenMobileSheet,
  onOpenPrintPreview
}) => {
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const colors = ['#000000', '#1e293b', '#1e3a8a', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
  const highlights = ['#ffffff', '#fef08a', '#bbf7d0', '#bae6fd', '#fed7aa', '#fbcfe8', '#e9d5ff'];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];

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
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none shadow-xs transition-all duration-200">
      {/* Ribbon Navigation Tabs */}
      <div className="flex items-center justify-between px-1.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center overflow-x-auto scrollbar-none py-0.5">
          {(
            [
              { id: 'home', label: 'Home' },
              { id: 'insert', label: 'Insert' },
              { id: 'layout', label: 'Layout' },
              { id: 'bangla', label: 'বাংলা' },
              { id: 'view', label: 'View' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Tab Actions: Mobile Sheet Button & Collapse Toggle */}
        <div className="flex items-center gap-1 shrink-0 px-1">
          {onOpenMobileSheet && (
            <button
              onClick={onOpenMobileSheet}
              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 sm:hidden hover:bg-indigo-100"
              title="Open all formatting tools"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>অপশন</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isCollapsed ? 'Expand Toolbar' : 'Collapse Toolbar'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab Panels (Hidden when collapsed) */}
      {!isCollapsed && (
        <div className="p-2 sm:p-2.5">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Row 1: Font, Size, Styles, Colors */}
              <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
                {/* Font Selector */}
                <button
                  onClick={onOpenFontManager}
                  className="flex items-center justify-between gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium max-w-[110px] sm:max-w-[140px] truncate shrink-0"
                  title="Change Font Family"
                >
                  <span className="truncate">{currentFont || 'Calibri'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Font Size controls */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => onChangeFontSize(Math.max(6, fontSize - 1))}
                    className="px-1.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                  >
                    -
                  </button>
                  <select
                    value={fontSize}
                    onChange={e => onChangeFontSize(Number(e.target.value))}
                    className="bg-transparent text-xs font-mono font-medium px-1 py-0.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {fontSizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onChangeFontSize(fontSize + 1)}
                    className="px-1.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                  >
                    +
                  </button>
                </div>

                {/* Quick Fix Bangla Font Button */}
                <button
                  onClick={onConvertAllToUnicode}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 hover:bg-amber-100 rounded-lg text-xs font-bold shrink-0 transition-colors"
                  title="কম্পিউটার বা বিজয়ী নষ্ট বাংলা ফন্ট ১-ক্লিকে ঠিক করুন (Repair Corrupted Bangla Font / Bijoy to Unicode)"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">ফন্ট ঠিক করুন</span>
                  <span className="sm:hidden">মেরামত</span>
                </button>

                <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

                {/* Basic Formatting */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => onExecCommand('bold')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('italic')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('underline')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('strikeThrough')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

                {/* Colors */}
                <div className="flex items-center gap-1 relative shrink-0">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                    className="px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Text Color"
                  >
                    <span>A</span>
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                  </button>

                  <button
                    onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')}
                    className="px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Text Highlight"
                  >
                    <span>ab</span>
                    <span className="w-2 h-2 rounded-sm bg-yellow-300 inline-block" />
                  </button>

                  {/* Color Picker Dropdown */}
                  {showColorPicker && (
                    <div className="fixed sm:absolute top-auto bottom-24 sm:bottom-auto sm:top-10 left-4 sm:left-0 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex gap-1.5 animate-in fade-in">
                      {(showColorPicker === 'text' ? colors : highlights).map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            if (showColorPicker === 'text') onExecCommand('foreColor', c);
                            else onExecCommand('hiliteColor', c);
                            setShowColorPicker(null);
                          }}
                          className="w-7 h-7 rounded-md border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Alignments, Lists, Indents, Case */}
              <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {/* Alignments */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => onExecCommand('justifyLeft')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyCenter')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyRight')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('justifyFull')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Justify"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-[1px] h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

                {/* Lists & Indents */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => onExecCommand('insertUnorderedList')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Bulleted List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('insertOrderedList')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('outdent')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Decrease Indent"
                  >
                    <Outdent className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExecCommand('indent')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
                    title="Increase Indent"
                  >
                    <Indent className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-[1px] h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

                {/* Case & Formatting */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCaseChange('upper')}
                    className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    title="UPPERCASE"
                  >
                    AA
                  </button>
                  <button
                    onClick={() => handleCaseChange('lower')}
                    className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    title="lowercase"
                  >
                    aa
                  </button>
                  <button
                    onClick={() => onExecCommand('removeFormat')}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500"
                    title="Clear Formatting"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INSERT TAB */}
          {activeTab === 'insert' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
                {/* Table */}
                <button
                  onClick={onOpenTableModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold shrink-0"
                >
                  <TableIcon className="w-3.5 h-3.5" /> টেবিল
                </button>

                {/* Photo */}
                <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> ছবি
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) onInsertImage(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Camera */}
                <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer shrink-0">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" /> ক্যামেরা
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) onInsertImage(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Smart Document Scanner (OCR) */}
                {onOpenSmartScanner && (
                  <button
                    onClick={onOpenSmartScanner}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold shrink-0"
                    title="Scan Document & OCR Text (Bengali & English)"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-emerald-600" /> স্ক্যানার (OCR)
                  </button>
                )}

                {/* Link */}
                <button
                  onClick={onInsertLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0"
                >
                  <Link className="w-3.5 h-3.5" /> লিঙ্ক
                </button>

                {/* Symbol */}
                <button
                  onClick={onOpenSymbolsModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-medium shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> প্রতীক
                </button>
              </div>

              {/* Row 2 on mobile: Date, Rule */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onInsertDateTime('bn')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-medium shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" /> তারিখ (বাংলা)
                </button>

                <button
                  onClick={() => onInsertDateTime('en')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date (EN)
                </button>

                <button
                  onClick={() => onExecCommand('insertHorizontalRule')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0"
                >
                  <Minus className="w-3.5 h-3.5" /> রেখা
                </button>
              </div>
            </div>
          )}

          {/* LAYOUT TAB */}
          {activeTab === 'layout' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {/* View Mode Toggle Button */}
                <button
                  onClick={onToggleContinuousView}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isContinuousView
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {isContinuousView ? '📱 মোবাইল ভিউ' : '📄 এ৪ পেজ'}
                </button>

                {/* Paper Size */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                  <span className="text-[10px] text-slate-400 px-1 font-medium">কাগজ:</span>
                  {(['a4', 'letter', 'legal'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdatePageSettings({ paperSize: size })}
                      className={`px-2 py-0.5 text-xs uppercase font-medium rounded ${
                        pageSettings.paperSize === size
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Orientation */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                  <button
                    onClick={() => onUpdatePageSettings({ orientation: 'portrait' })}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      pageSettings.orientation === 'portrait'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => onUpdatePageSettings({ orientation: 'landscape' })}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      pageSettings.orientation === 'landscape'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Margins & Headers */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                  <span className="text-[10px] text-slate-400 px-1 font-medium">মার্জিন:</span>
                  <button
                    onClick={() => onUpdatePageSettings({ margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 } })}
                    className={`px-2 py-0.5 text-xs rounded ${
                      pageSettings.margins.top === 25.4
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    নরমাল
                  </button>
                  <button
                    onClick={() => onUpdatePageSettings({ margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 } })}
                    className={`px-2 py-0.5 text-xs rounded ${
                      pageSettings.margins.top === 12.7
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ন্যারো
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="হেডার..."
                  value={pageSettings.headerText}
                  onChange={e => onUpdatePageSettings({ headerText: e.target.value })}
                  className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-24 shrink-0"
                />
                <input
                  type="text"
                  placeholder="ফুটার..."
                  value={pageSettings.footerText}
                  onChange={e => onUpdatePageSettings({ footerText: e.target.value })}
                  className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-24 shrink-0"
                />

                {onOpenPrintPreview && (
                  <button
                    onClick={onOpenPrintPreview}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 shrink-0 transition-colors"
                    title="Print Preview (প্রিন্ট প্রিভিউ)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট প্রিভিউ</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BANGLA & FONT TAB */}
          {activeTab === 'bangla' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 p-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl shrink-0">
                  <button
                    onClick={onConvertAllToUnicode}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="পুরো ডকুমেন্টের নষ্ট বিজয়ী ফন্ট ১-ক্লিকে ইউনিকোডে ঠিক করুন"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>নষ্ট ফন্ট মেরামত (সব ➔ ইউনিকোড)</span>
                  </button>
                  <button
                    onClick={onConvertSelectionToUnicode}
                    className="px-2 py-1 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="সিলেক্ট করা নষ্ট বিজয়ী লেখা ইউনিকোডে রূপান্তর করুন"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-600" /> সিলেকশন ➔ ইউনিকোড
                  </button>
                  <button
                    onClick={onConvertSelectionToBijoy}
                    className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                    title="সিলেক্ট করা লেখা বিজয়ে (SutonnyMJ) রূপান্তর করুন"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" /> সিলেকশন ➔ বিজয়
                  </button>
                </div>
              </div>

              {/* Bangla Font shortcuts */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onExecCommand('fontName', 'Noto Sans Bengali, sans-serif')}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 shrink-0"
                >
                  Noto Sans বাংলা
                </button>
                <button
                  onClick={() => onExecCommand('fontName', 'Kalpurush, sans-serif')}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 shrink-0"
                >
                  কালপুরুষ
                </button>
                <button
                  onClick={() => onExecCommand('fontName', '"SutonnyMJ", sans-serif')}
                  className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-bold hover:bg-amber-200 shrink-0"
                >
                  SutonnyMJ
                </button>
                <button
                  onClick={onOpenFontManager}
                  className="px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  ম্যানেজার ➔
                </button>
              </div>
            </div>
          )}

          {/* VIEW TAB */}
          {activeTab === 'view' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {/* View Mode Toggle */}
                <button
                  onClick={onToggleContinuousView}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isContinuousView
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {isContinuousView ? 'মোবাইল স্ক্রিন ফিট' : 'এ৪ পেজ ভিউ'}
                </button>

                {/* Paper Theme */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => onChangePaperTheme('white')}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      paperTheme === 'white' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => onChangePaperTheme('sepia')}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      paperTheme === 'sepia' ? 'bg-[#fbf0d9] text-amber-900 shadow-2xs font-bold' : 'text-slate-500'
                    }`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => onChangePaperTheme('dark')}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      paperTheme === 'dark' ? 'bg-slate-900 text-white shadow-2xs font-bold' : 'text-slate-500'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Zoom & Screen */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => onChangeZoom(Math.max(50, zoomLevel - 15))}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-medium px-1 text-slate-700 dark:text-slate-200">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => onChangeZoom(Math.min(200, zoomLevel + 15))}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={onToggleFullscreen}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 shrink-0"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  {isFullscreen ? 'Exit' : 'Full'}
                </button>

                <button
                  onClick={onOpenStatsModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> তথ্য
                </button>

                {onOpenPrintPreview && (
                  <button
                    onClick={onOpenPrintPreview}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold shrink-0 transition-colors"
                    title="Print Preview (প্রিন্ট প্রিভিউ)"
                  >
                    <Printer className="w-3.5 h-3.5" /> প্রিন্ট প্রিভিউ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
