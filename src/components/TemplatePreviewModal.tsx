/**
 * Template Preview Modal
 * 
 * Shows full template details, metadata, disclaimer, placeholders,
 * realistic document sheet preview, and actions ("Use This Template", "Favorite").
 */

import React from 'react';
import { 
  X, 
  FileText, 
  Star, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  Tag, 
  Sparkles,
  ArrowRight,
  Globe,
  ExternalLink
} from 'lucide-react';
import { DocumentTemplate } from '../types/template';
import { isTemplateFavorite, toggleTemplateFavorite } from '../utils/templateStorage';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: DocumentTemplate | null;
  onUseTemplate: (template: DocumentTemplate) => void;
  onFavoriteChanged?: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
  onFavoriteChanged
}) => {
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    if (template) {
      setIsFav(isTemplateFavorite(template.id));
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleToggleFav = () => {
    const newState = toggleTemplateFavorite(template.id);
    setIsFav(newState);
    if (onFavoriteChanged) onFavoriteChanged();
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'bn': return 'বাংলা (Bangla)';
      case 'en': return 'English';
      case 'mixed': return 'দ্বিভাষিক (Bangla + English)';
      default: return lang;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {template.name}
                </h2>
                {template.nameBn && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    ({template.nameBn})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {template.categoryName} · {template.categoryNameBn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleFav}
              className={`p-2 rounded-xl transition-colors ${
                isFav 
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' 
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
              <Layers className="w-3 h-3" />
              {template.categoryName}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
              <Globe className="w-3 h-3" />
              {getLanguageLabel(template.language)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <Calendar className="w-3 h-3" />
              Updated: {template.lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
              <Tag className="w-3 h-3" />
              {template.placeholders.length} Editable Fields
            </span>
          </div>

          {/* Short Description */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">Description:</p>
            <p>{template.description}</p>
            {template.descriptionBn && <p className="text-slate-500 mt-1">{template.descriptionBn}</p>}
          </div>

          {/* Legal / Deed Disclaimer Notice */}
          {template.disclaimer && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">Drafting Format Notice / আইনি সতর্কতা</p>
                <p className="mt-0.5 leading-relaxed text-[11px] text-amber-800/90 dark:text-amber-200/90">
                  {template.disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Editable Placeholders Chips List */}
          {template.placeholders && template.placeholders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Editable Placeholder Fields ({template.placeholders.length})
                </span>
                <span className="text-[10px] text-slate-400">Easy to fill inside the editor</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                {template.placeholders.map((ph, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  >
                    {ph}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visual Document Page Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Document Layout Preview
              </span>
              <span className="text-[11px] text-slate-400">
                Paper: {template.pageSettings.paperSize.toUpperCase()} · Margins: {template.pageSettings.margins.top}mm
              </span>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-100 dark:bg-slate-950 p-3 sm:p-5 overflow-x-auto shadow-inner">
              <div 
                className="bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-md mx-auto max-w-full text-xs overflow-hidden"
                style={{
                  minHeight: '280px',
                  fontFamily: template.language === 'bn' ? "'Noto Sans Bengali', sans-serif" : "'Plus Jakarta Sans', sans-serif"
                }}
                dangerouslySetInnerHTML={{ __html: template.contentHtml }}
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onUseTemplate(template);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <span>Use This Template</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
