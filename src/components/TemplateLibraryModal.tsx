/**
 * Ready-Made Template Library Modal & Browser
 * 
 * Comprehensive browsable library for Wordora Mobile:
 * - Search bar with instant real-time filtering (Bangla & English keywords)
 * - Category navigation (Applications, Letters, Business, Education, Legal, Deed & Dolil, Custom, Favorites, Recent)
 * - Language filters (All, Bangla, English, Mixed)
 * - Interactive template cards with Preview, Favorite, and "Use This Template"
 * - Full preview dialog
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  Star, 
  Clock, 
  Layers, 
  Briefcase, 
  Mail, 
  GraduationCap, 
  Scale, 
  Scroll, 
  FolderHeart, 
  Sparkles, 
  Plus, 
  Tag, 
  Globe, 
  AlertTriangle,
  ArrowRight,
  Eye,
  Trash2
} from 'lucide-react';
import { DocumentTemplate, TemplateCategory } from '../types/template';
import { CATEGORIES_CONFIG } from '../data/builtInTemplates';
import { 
  getAllTemplates, 
  searchTemplates, 
  isTemplateFavorite, 
  toggleTemplateFavorite,
  deleteUserCustomTemplate,
  getRecentTemplateIds,
  getFavoriteTemplateIds
} from '../utils/templateStorage';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  initialCategory?: string;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  initialCategory = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bn' | 'en' | 'mixed'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync initialCategory
  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Query templates
  const filteredTemplates = useMemo(() => {
    // refreshTrigger is a dependency to re-read storage
    void refreshTrigger;
    return searchTemplates(searchQuery, activeCategory, languageFilter);
  }, [searchQuery, activeCategory, languageFilter, refreshTrigger]);

  const recentCount = useMemo(() => getRecentTemplateIds().length, [refreshTrigger]);
  const favCount = useMemo(() => getFavoriteTemplateIds().length, [refreshTrigger]);

  if (!isOpen) return null;

  const handleToggleFavorite = (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTemplateFavorite(tplId);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteCustom = (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this custom template?')) {
      deleteUserCustomTemplate(tplId);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Mail': return <Mail className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Scale': return <Scale className="w-4 h-4" />;
      case 'Scroll': return <Scroll className="w-4 h-4" />;
      case 'FolderHeart': return <FolderHeart className="w-4 h-4" />;
      case 'Star': return <Star className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-45 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[94vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready-Made Templates
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold">
                  টেমপ্লেট লাইব্রেরি
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Browse official applications, letters, invoices, educational formats & legal deeds
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

        {/* Search & Language Filters Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 'leave application', 'জমির দলিল', 'চাকরির আবেদন', 'ছুটির আবেদন', 'NOC', 'agreement', 'CV'..."
              className="w-full text-xs pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language filter pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All / সব' },
                { id: 'bn', label: 'বাংলা' },
                { id: 'en', label: 'English' },
                { id: 'mixed', label: 'দ্বিভাষিক' }
              ] as const
            ).map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguageFilter(lang.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  languageFilter === lang.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Horizontal Scrollbar */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORIES_CONFIG.map(cat => {
            const isActive = activeCategory === cat.id;
            const badge = 
              cat.id === 'favorites' ? favCount :
              cat.id === 'recent' ? recentCount :
              undefined;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Templates Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredTemplates.length === 0 ? (
            <div className="py-20 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching templates found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeCategory === 'custom'
                  ? 'You have not saved any custom templates yet. Open any document and choose "Save as Template" from the menu.'
                  : activeCategory === 'favorites'
                  ? 'You have not starred any templates yet. Tap the star icon on any template to add it to your favorites.'
                  : 'Try searching with different keywords like "leave", "আবেদন", "জমির দলিল", "invoice", "deed", or select "All Templates".'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTemplates.map(tpl => {
                const isFav = isTemplateFavorite(tpl.id);
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setPreviewTemplate(tpl)}
                    className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer relative"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                            {tpl.categoryName}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {tpl.language === 'bn' ? 'বাংলা' : tpl.language === 'en' ? 'English' : 'দ্বিভাষিক'}
                          </span>
                          {tpl.isDeedOrLegal && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> খসড়া
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {tpl.isCustom && (
                            <button
                              onClick={(e) => handleDeleteCustom(tpl.id, e)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                              title="Delete custom template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleToggleFavorite(tpl.id, e)}
                            className={`p-1 rounded-lg transition-colors ${
                              isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-slate-500'
                            }`}
                            title={isFav ? 'Starred' : 'Add to Starred'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {tpl.name}
                      </h3>
                      {tpl.nameBn && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          {tpl.nameBn}
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        <span>{tpl.placeholders.length} fields</span>
                        <span>·</span>
                        <span>{tpl.pageSettings.paperSize.toUpperCase()}</span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setPreviewTemplate(tpl)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                          title="Preview Template"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectTemplate(tpl);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                          title="Create Document from this Template"
                        >
                          <span>Use</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing {filteredTemplates.length} templates · All templates formatted with margins, tables, and Bangla typography
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>

      {/* Individual Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={true}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate}
          onUseTemplate={(t) => {
            onSelectTemplate(t);
            onClose();
          }}
          onFavoriteChanged={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};
