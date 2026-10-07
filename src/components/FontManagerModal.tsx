/**
 * Font Manager Modal
 * 
 * Supports:
 * - Previewing standard English & Bengali fonts
 * - SutonnyMJ status and converter guidance
 * - Uploading custom TTF / OTF font files
 * - Browser FontFace API live registration and testing
 */

import React, { useState, useEffect } from 'react';
import { Type, Upload, Trash2, Check, X, Info } from 'lucide-react';
import { CustomFont, FontOption } from '../types/document';
import { BUILT_IN_FONTS, loadAndRegisterCustomFonts, saveCustomFont, deleteCustomFont } from '../utils/fontManager';

interface FontManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFont: string;
  onSelectFont: (fontFamily: string, fontName: string) => void;
}

export const FontManagerModal: React.FC<FontManagerModalProps> = ({
  isOpen,
  onClose,
  currentFont,
  onSelectFont
}) => {
  const [activeTab, setActiveTab] = useState<'bengali' | 'english' | 'custom'>('bengali');
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [previewText, setPreviewText] = useState('আমার সোনার বাংলা / The quick brown fox jumps');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAndRegisterCustomFonts().then(setCustomFonts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);

    const res = await saveCustomFont(file);
    setUploadLoading(false);

    if (res.success && res.font) {
      const updated = await loadAndRegisterCustomFonts();
      setCustomFonts(updated);
      onSelectFont(res.font.familyName, res.font.name);
    } else {
      setUploadError(res.error || 'Failed to upload font file.');
    }
  };

  const handleDeleteFont = (id: string, name: string) => {
    if (confirm(`Remove custom font "${name}"?`)) {
      deleteCustomFont(id);
      setCustomFonts(prev => prev.filter(f => f.id !== id));
    }
  };

  const bengaliFonts = BUILT_IN_FONTS.filter(f => f.category === 'bengali' || f.category === 'legacy');
  const englishFonts = BUILT_IN_FONTS.filter(f => f.category === 'english');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Font Manager & Typography</h3>
              <p className="text-[11px] text-slate-500">English, Bengali Unicode & SutonnyMJ legacy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('bengali')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'bengali'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              বাংলা (Bengali)
            </button>
            <button
              onClick={() => setActiveTab('english')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'english'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Custom ({customFonts.length})
            </button>
          </div>
        </div>

        {/* Live Preview Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
            placeholder="Type preview sample text..."
            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Font List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'bengali' && (
            <>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">SutonnyMJ & Bangla Compatibility</p>
                  <p>Modern typing uses Unicode (Avro/Gboard). If using SutonnyMJ, Wordora includes a built-in <strong>Bijoy Converter</strong> on the ribbon toolbar!</p>
                </div>
              </div>

              <div className="space-y-2">
                {bengaliFonts.map(font => (
                  <FontCard
                    key={font.name}
                    font={font}
                    currentFont={currentFont}
                    previewText={previewText}
                    onSelect={() => {
                      onSelectFont(font.family, font.name);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === 'english' && (
            <div className="space-y-2">
              {englishFonts.map(font => (
                <FontCard
                  key={font.name}
                  font={font}
                  currentFont={currentFont}
                  previewText={previewText}
                  onSelect={() => {
                    onSelectFont(font.family, font.name);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* Upload section */}
              <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/70 rounded-2xl p-4 text-center hover:bg-indigo-50/30 transition-colors">
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {uploadLoading ? 'Registering Font...' : 'Add Custom TTF or OTF Font'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Upload font files from your device (e.g. SutonnyMJ.ttf, SolaimanLipi.ttf)
                  </span>
                  <input
                    type="file"
                    accept=".ttf,.otf"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-xl text-xs">
                  {uploadError}
                </div>
              )}

              {customFonts.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No custom fonts added yet. Tap above to import any .ttf or .otf font.
                </p>
              ) : (
                <div className="space-y-2">
                  {customFonts.map(cf => (
                    <div 
                      key={cf.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 transition-all flex items-center justify-between"
                    >
                      <button
                        onClick={() => {
                          onSelectFont(cf.familyName, cf.name);
                          onClose();
                        }}
                        className="text-left flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-slate-900 dark:text-white">{cf.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {cf.format}
                          </span>
                        </div>
                        <p 
                          className="text-base text-slate-700 dark:text-slate-300 mt-1 truncate"
                          style={{ fontFamily: cf.familyName }}
                        >
                          {previewText}
                        </p>
                      </button>

                      <button
                        onClick={() => handleDeleteFont(cf.id, cf.name)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Font"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FontCardProps {
  font: FontOption;
  currentFont: string;
  previewText: string;
  onSelect: () => void;
}

const FontCard: React.FC<FontCardProps> = ({ font, currentFont, previewText, onSelect }) => {
  const isSelected = currentFont.toLowerCase().includes(font.name.toLowerCase());

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-900 dark:text-white">{font.name}</span>
          {font.category === 'legacy' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-medium">
              Bijoy ANSI
            </span>
          )}
        </div>
        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
      </div>
      {font.description && (
        <p className="text-[11px] text-slate-400 mb-1.5">{font.description}</p>
      )}
      <p 
        className="text-base text-slate-800 dark:text-slate-200 truncate"
        style={{ fontFamily: font.family }}
      >
        {previewText}
      </p>
    </button>
  );
};
