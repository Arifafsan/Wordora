/**
 * Save as Template Modal
 * 
 * Allows users to turn the currently open document into a custom reusable template.
 */

import React, { useState } from 'react';
import { 
  X, 
  FolderHeart, 
  Check, 
  Sparkles, 
  Layers, 
  Globe 
} from 'lucide-react';
import { DocumentModel } from '../types/document';
import { DocumentTemplate, TemplateCategory } from '../types/template';
import { extractPlaceholdersFromHtml, saveUserCustomTemplate } from '../utils/templateStorage';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
  onSavedSuccess?: () => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  document,
  onSavedSuccess
}) => {
  const [name, setName] = useState(document.title);
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('applications_letters');
  const [language, setLanguage] = useState<'bn' | 'en' | 'mixed'>('bn');
  const [description, setDescription] = useState('Custom user created template');

  if (!isOpen) return null;

  const detectedPlaceholders = extractPlaceholdersFromHtml(document.contentHtml);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a template name.');
      return;
    }

    const newTemplate: DocumentTemplate = {
      id: 'custom_tpl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      category,
      categoryName: category === 'deed_dolil' ? 'Deed & Dolil' : 'My Templates',
      categoryNameBn: 'আমার টেমপ্লেট',
      language,
      description: description.trim(),
      contentHtml: document.contentHtml,
      pageSettings: { ...document.pageSettings },
      placeholders: detectedPlaceholders,
      version: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      isCustom: true,
      tags: ['Custom', 'UserTemplate', name.trim()]
    };

    saveUserCustomTemplate(newTemplate);
    alert(`Template "${name}" saved to My Templates!`);
    if (onSavedSuccess) onSavedSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Save as Template
              </h2>
              <p className="text-[11px] text-slate-500">
                Save this document layout to reuse anytime
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
        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Template Name (English/Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Monthly Marketing Report"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bengali Name / বাংলা নাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={e => setNameBn(e.target.value)}
              placeholder="যেমন: মাসিক মার্কেটিং রিপোর্ট"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TemplateCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="applications_letters">Applications & Letters</option>
                <option value="personal_letters">Personal Letters</option>
                <option value="business_office">Business & Office</option>
                <option value="education">Education</option>
                <option value="legal_official">Official / Legal</option>
                <option value="deed_dolil">Deed & Dolil (দলিল)</option>
                <option value="custom">My Custom Templates</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="bn">বাংলা (Bangla)</option>
                <option value="en">English</option>
                <option value="mixed">দ্বিভাষিক (Mixed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {detectedPlaceholders.length > 0 && (
            <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-[11px] text-indigo-700 dark:text-indigo-300">
              <span className="font-semibold">Auto-detected {detectedPlaceholders.length} placeholders: </span>
              {detectedPlaceholders.slice(0, 4).join(', ')}
              {detectedPlaceholders.length > 4 ? '...' : ''}
            </div>
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

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save to Templates</span>
          </button>
        </div>

      </div>
    </div>
  );
};
