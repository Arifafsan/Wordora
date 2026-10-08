/**
 * Document Manager Home Screen
 * 
 * Features:
 * - Template gallery (Blank, Bangla Application, CV, Bilingual, Executive Report)
 * - Tabs: Recent, All, Favorites, Trash
 * - Search & Filter
 * - Sort by Date, Name, Size
 * - Grid & List view
 * - Document operations: Open, Rename, Duplicate, Trash, Restore, Delete, Password Lock
 * - Import existing DOCX / TXT files directly from mobile storage
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Clock, 
  Grid, 
  List as ListIcon, 
  MoreVertical, 
  Upload, 
  Lock, 
  Settings, 
  Copy, 
  FileSpreadsheet, 
  Download, 
  FolderOpen, 
  ArrowUpDown, 
  RotateCcw, 
  Sparkles, 
  Cloud, 
  Loader2, 
  HardDrive, 
  Layers, 
  Scroll, 
  BookOpen,
  Scale,
  Briefcase,
  GraduationCap,
  Info,
  Heart,
  ScanLine
} from 'lucide-react';
import { DocumentModel, PageSettings } from '../types/document';
import { TEMPLATES } from '../utils/storage';
import { importDocxFile } from '../utils/docxExport';
import { parseDocxFile, DocxImportResult, convertDocumentSutonnyToUnicode } from '../utils/docxParser';
import { detectCorruptedBanglaOrBijoy, bijoyToUnicode } from '../utils/banglaConverter';
import { DocxImportReportModal } from './DocxImportReportModal';
import { CloudImportModal } from './CloudImportModal';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { ExportShareModal } from './ExportShareModal';
import { DocumentTemplate } from '../types/template';
import { BUILT_IN_TEMPLATES, CATEGORIES_CONFIG } from '../data/builtInTemplates';
import { getAllTemplates } from '../utils/templateStorage';

interface HomeScreenProps {
  documents: DocumentModel[];
  onOpenDocument: (doc: DocumentModel) => void;
  onCreateNew: (templateId?: string) => void;
  onImportDocument: (html: string, title: string, pageSettings?: PageSettings) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenScanner?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  documents,
  onOpenDocument,
  onCreateNew,
  onImportDocument,
  onToggleFavorite,
  onMoveToTrash,
  onRestoreFromTrash,
  onPermanentlyDelete,
  onDuplicate,
  onRename,
  onOpenSettings,
  onOpenAbout,
  onOpenScanner
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'favorites' | 'trash'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'words'>('updated');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [exportingDoc, setExportingDoc] = useState<DocumentModel | null>(null);

  // Ready-Made Templates state
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [initialTemplateCategory, setInitialTemplateCategory] = useState<string>('all');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<DocumentTemplate | null>(null);

  // All templates count & featured selection for carousel
  const allTemplatesList: DocumentTemplate[] = useMemo(() => getAllTemplates(), []);
  const allTemplatesCount = allTemplatesList.length;
  const featuredTemplates: DocumentTemplate[] = useMemo(() => {
    // Pick diverse top templates for the carousel
    const ids = [
      'app_leave_application',
      'app_job_application_cover_letter',
      'biz_invoice_tax',
      'deed_agreement_bayna',
      'edu_assignment_cover',
      'biz_meeting_minutes',
      'leg_general_agreement',
      'deed_saf_kabala_layout',
      'biz_money_receipt',
      'let_formal_letter_en'
    ];
    return ids.map(id => allTemplatesList.find((t: DocumentTemplate) => t.id === id)).filter(Boolean) as DocumentTemplate[];
  }, [allTemplatesList]);

  // DOCX Import & Cloud state
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [pendingImportResult, setPendingImportResult] = useState<DocxImportResult | null>(null);
  const [isParsingDocx, setIsParsingDocx] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Process a DOCX or TXT file with audit report
  const processImportFile = async (file: File) => {
    setIsParsingDocx(true);
    try {
      if (file.name.toLowerCase().endsWith('.docx') || file.type.includes('wordprocessingml')) {
        const result = await parseDocxFile(file);
        // Show compatibility report modal before entering editor
        setPendingImportResult(result);
      } else if (file.name.toLowerCase().endsWith('.txt') || file.type.includes('text/plain')) {
        const text = await file.text();
        const cleanedText = detectCorruptedBanglaOrBijoy(text) ? bijoyToUnicode(text) : text;
        const html = `<p>${cleanedText.replace(/\n/g, '<br/>')}</p>`;
        const title = file.name.replace(/\.[^/.]+$/, '');
        onImportDocument(html, title);
      } else {
        alert('Please select a Word (.docx) or plain text (.txt) file.');
      }
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      alert('Could not parse Word document. Please ensure it is a valid .docx file.');
    } finally {
      setIsParsingDocx(false);
    }
  };

  // Handle .docx or .txt file upload import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImportFile(file);
    if (e.target) e.target.value = '';
  };

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImportFile(file);
    }
  };

  const handleConfirmDocxOpen = (convertSutonny: boolean) => {
    if (!pendingImportResult) return;
    let finalHtml = pendingImportResult.html;
    if (convertSutonny) {
      finalHtml = convertDocumentSutonnyToUnicode(finalHtml);
    }
    onImportDocument(finalHtml, pendingImportResult.title, pendingImportResult.pageSettings);
    setPendingImportResult(null);
  };

  // Filter documents based on active tab and search query
  const filteredDocs = documents
    .filter(doc => {
      if (activeTab === 'trash') {
        return doc.inTrash;
      }
      if (doc.inTrash) return false;

      if (activeTab === 'favorites') {
        return doc.favorite;
      }
      return true;
    })
    .filter(doc => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) || (doc.tags || []).some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'words') return b.wordCount - a.wordCount;
      return b.updatedAt - a.updatedAt;
    });

  const handleStartRename = (doc: DocumentModel) => {
    setRenamingDocId(doc.id);
    setRenameText(doc.title);
    setActiveMenuDocId(null);
  };

  const handleSaveRename = (id: string) => {
    if (renameText.trim()) {
      onRename(id, renameText.trim());
    }
    setRenamingDocId(null);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-blue-400/20 bg-blue-950 shrink-0">
            <img 
              src="/wordora-logo.png" 
              alt="Wordora App Icon" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Wordora
            </h1>
            <p className="text-[11px] text-slate-500">Mobile Word Processor</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Smart Document Scanner (OCR) Button */}
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold transition-colors shadow-2xs"
              title="Smart Document Scanner (Bengali & English OCR)"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan OCR</span>
            </button>
          )}

          {/* Ready-Made Templates Button */}
          <button
            onClick={() => {
              setInitialTemplateCategory('all');
              setShowTemplateLibrary(true);
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold transition-colors shadow-2xs"
            title="Browse Ready-Made Templates Library"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          {/* Quick Open Word DOCX button */}
          <button
            onClick={() => setShowCloudModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold transition-colors"
            title="Open Word .docx Document"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open DOCX</span>
          </button>

          {/* Direct File input button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Import from Device Storage"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Hidden File Input for Device / Android File Manager */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* About Developer & App */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative group"
            title="About Developer (Arif Ahmed Adi) & App"
            aria-label="About Developer and App"
          >
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="sr-only">About</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container with Drag-and-Drop */}
      <main 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex-1 max-w-4xl w-full mx-auto p-4 space-y-5 transition-colors ${
          isDragOver ? 'ring-2 ring-blue-500 ring-offset-4 bg-blue-50/20 dark:bg-blue-950/20 rounded-2xl' : ''
        }`}
      >
        {/* Parsing Loader Alert */}
        {isParsingDocx && (
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs shadow-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold">Reading Word Document (.docx)...</p>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                Extracting paragraphs, fonts, tables, images, margins, and checking Bangla encoding...
              </p>
            </div>
          </div>
        )}

        {/* Word Document Compatibility Hero Banner */}
        {activeTab !== 'trash' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40 border border-blue-200/70 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 shrink-0 border border-blue-400/30">
                <img 
                  src="/wordora-logo.png" 
                  alt="Wordora Engine" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Word Document Compatibility Engine
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                    v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Open DOCX files from Windows PC, Android Storage, Google Drive or OneDrive. Preserves Bangla Unicode, SutonnyMJ, tables, images & margins.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Open from Device</span>
              </button>
              <button
                onClick={() => setShowCloudModal(true)}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Cloud & Samples</span>
              </button>
            </div>
          </div>
        )}
        {/* Dedicated Ready-Made Templates Section */}
        {activeTab !== 'trash' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Ready-Made Templates
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    রেডি-মেড টেমপ্লেট
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Professional applications, legal deeds, business invoices & letters ready to use
                </p>
              </div>

              <button
                onClick={() => {
                  setInitialTemplateCategory('all');
                  setShowTemplateLibrary(true);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <span>Browse All ({allTemplatesCount}+)</span>
                <span>→</span>
              </button>
            </div>

            {/* Quick Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'All / সব' },
                { id: 'applications_letters', label: 'Applications (আবেদন)' },
                { id: 'business_office', label: 'Business & Office' },
                { id: 'education', label: 'Education (শিক্ষা)' },
                { id: 'legal_official', label: 'Legal (আইনগত)' },
                { id: 'deed_dolil', label: 'Deed & Dolil (দলিল)' },
                { id: 'favorites', label: 'Starred' },
                { id: 'recent', label: 'Recent' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setInitialTemplateCategory(cat.id);
                    setShowTemplateLibrary(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 whitespace-nowrap transition-colors font-medium shadow-2xs"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Horizontal Carousel of Featured Templates */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
              {/* 1. Blank Document */}
              <button
                onClick={() => onCreateNew('tpl_blank')}
                className="flex-shrink-0 w-36 sm:w-44 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                    Blank Document
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                    Start fresh with standard margins and clean formatting
                  </p>
                </div>
              </button>

              {/* 2. Smart Document Scanner (OCR) */}
              {onOpenScanner && (
                <button
                  onClick={onOpenScanner}
                  className="flex-shrink-0 w-36 sm:w-44 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/70 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs shadow-emerald-600/30">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        Smart Scanner
                      </h3>
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold rounded">
                        OCR
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                      Scan documents with Bengali & English OCR
                    </p>
                  </div>
                </button>
              )}

              {/* Curated Top Ready-Made Templates */}
              {featuredTemplates.map((tpl: DocumentTemplate) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedPreviewTemplate(tpl)}
                  className="flex-shrink-0 w-40 sm:w-48 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all group flex flex-col justify-between shadow-2xs cursor-pointer relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {tpl.category === 'deed_dolil' ? (
                          <Scroll className="w-4 h-4" />
                        ) : tpl.category === 'legal_official' ? (
                          <Scale className="w-4 h-4" />
                        ) : tpl.category === 'business_office' ? (
                          <Briefcase className="w-4 h-4" />
                        ) : tpl.category === 'education' ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tpl.language === 'bn' ? 'বাংলা' : tpl.language === 'en' ? 'EN' : 'দ্বিভাষিক'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tpl.name}
                    </h3>
                    {tpl.nameBn && (
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">
                        {tpl.nameBn}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{tpl.placeholders.length} fields</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateNew(tpl.id);
                      }}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}

              {/* View All Card */}
              <button
                onClick={() => {
                  setInitialTemplateCategory('all');
                  setShowTemplateLibrary(true);
                }}
                className="flex-shrink-0 w-36 sm:w-44 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 text-center transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    Browse All Templates
                  </h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {allTemplatesCount}+ Ready Formats
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents or tags..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Filter Navigation Tabs & Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
            {(
              [
                { id: 'recent', label: 'Recent' },
                { id: 'all', label: 'All Docs' },
                { id: 'favorites', label: 'Starred' },
                { id: 'trash', label: 'Trash' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="updated">Recently Modified</option>
              <option value="title">Title (A-Z)</option>
              <option value="words">Word Count</option>
            </select>

            {/* Grid / List Mode */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Document Grid / List */}
        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {activeTab === 'trash' ? 'Trash is empty' : 'No documents found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'trash'
                ? 'Deleted documents will appear here.'
                : 'Create a new document from the templates above or tap the button below.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-2xs"
              >
                {/* Card Top Action Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-1">
                    {!doc.inTrash && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFavorite(doc.id);
                        }}
                        className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          doc.favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Menu trigger */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body (Clickable to open) */}
                <div 
                  onClick={() => renamingDocId !== doc.id && onOpenDocument(doc)}
                  className="cursor-pointer flex-1"
                >
                  {renamingDocId === doc.id ? (
                    <div className="my-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameText}
                        onChange={e => setRenameText(e.target.value)}
                        onBlur={() => handleSaveRename(doc.id)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename(doc.id)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-indigo-500 rounded-lg"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                      {doc.title}
                    </h3>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
                    <span>{doc.wordCount} words</span>
                    <span>·</span>
                    <span>{formatTime(doc.updatedAt)}</span>
                  </div>
                </div>

                {/* Dropdown Menu Popup */}
                {activeMenuDocId === doc.id && (
                  <div 
                    className="absolute right-2 top-10 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-in fade-in zoom-in-95"
                    onClick={e => e.stopPropagation()}
                  >
                    {!doc.inTrash ? (
                      <>
                        <button
                          onClick={() => {
                            onOpenDocument(doc);
                            setActiveMenuDocId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-blue-500" /> Open Document
                        </button>
                        <button
                          onClick={() => handleStartRename(doc)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" /> Rename
                        </button>
                        <button
                          onClick={() => {
                            onDuplicate(doc.id);
                            setActiveMenuDocId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setExportingDoc(doc);
                            setActiveMenuDocId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-500" /> Export to Phone
                        </button>
                        <button
                          onClick={() => {
                            onMoveToTrash(doc.id);
                            setActiveMenuDocId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onRestoreFromTrash(doc.id);
                            setActiveMenuDocId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete "${doc.title}"? This cannot be undone.`)) {
                              onPermanentlyDelete(doc.id);
                              setActiveMenuDocId(null);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{doc.wordCount} words</span>
                      <span>·</span>
                      <span>{formatTime(doc.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  {!doc.inTrash && (
                    <button
                      onClick={() => onToggleFavorite(doc.id)}
                      className={`p-1.5 rounded-lg ${doc.favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (doc.inTrash) onRestoreFromTrash(doc.id);
                      else onMoveToTrash(doc.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  >
                    {doc.inTrash ? <RotateCcw className="w-4 h-4 text-emerald-500" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Wordora & Copyright Footer */}
        <footer className="pt-8 pb-8 text-center max-w-md mx-auto space-y-3 px-2">
          <button
            onClick={onOpenAbout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-800 transition-all shadow-2xs group"
          >
            <span>Made with passion by <strong className="text-slate-900 dark:text-white">Arif Ahmed Adi</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">About & Contacts</span>
          </button>

          {/* About Wordora Section */}
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
            <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              About Wordora
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Wordora is a document productivity application. The original content, branding, and code are protected by applicable intellectual property laws where applicable.
            </p>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            © 2026 Wordora. All Rights Reserved.
          </p>
        </footer>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => onCreateNew()}
          className="h-14 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> New Document
        </button>
      </div>

      {/* Cloud & Device Storage Import Hub Modal */}
      <CloudImportModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        onSelectLocalFile={() => fileInputRef.current?.click()}
        onImportFromBlob={processImportFile}
      />

      {/* Word DOCX Compatibility Audit Report Modal */}
      {pendingImportResult && (
        <DocxImportReportModal
          isOpen={true}
          onClose={() => setPendingImportResult(null)}
          report={pendingImportResult.report}
          onConfirmOpen={handleConfirmDocxOpen}
        />
      )}

      {/* Ready-Made Template Library Modal */}
      <TemplateLibraryModal
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        initialCategory={initialTemplateCategory}
        onSelectTemplate={(tpl) => {
          onCreateNew(tpl.id);
        }}
      />

      {/* Selected Template Preview Modal */}
      {selectedPreviewTemplate && (
        <TemplatePreviewModal
          isOpen={true}
          onClose={() => setSelectedPreviewTemplate(null)}
          template={selectedPreviewTemplate}
          onUseTemplate={(tpl) => {
            onCreateNew(tpl.id);
            setSelectedPreviewTemplate(null);
          }}
        />
      )}

      {/* Export & Share Modal */}
      {exportingDoc && (
        <ExportShareModal
          isOpen={true}
          onClose={() => setExportingDoc(null)}
          document={exportingDoc}
        />
      )}
    </div>
  );
};
