/**
 * App Settings & Configuration Dialog
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Laptop, 
  Database, 
  Download, 
  Upload, 
  X, 
  Check, 
  ShieldCheck,
  Type,
  User,
  Sparkles,
  ChevronRight,
  Heart
} from 'lucide-react';
import { AppSettings, saveAppSettings, getAllDocuments } from '../utils/storage';
import { BUILT_IN_FONTS } from '../utils/fontManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRefreshDocs: () => void;
  onOpenAbout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRefreshDocs,
  onOpenAbout
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    saveAppSettings({ [key]: val });
    onUpdateSettings(updated);
  };

  const handleExportBackup = () => {
    const docs = getAllDocuments();
    const data = {
      version: '1.0',
      exportedAt: Date.now(),
      documents: docs,
      settings: localSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lipiword_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup file downloaded!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.documents && Array.isArray(parsed.documents)) {
          localStorage.setItem('lipiword_documents_v1', JSON.stringify(parsed.documents));
          onRefreshDocs();
          setStatusMessage(`Restored ${parsed.documents.length} documents!`);
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-xs border border-blue-400/20 bg-blue-950 flex items-center justify-center shrink-0">
              <img src="/wordora-logo.png" alt="Wordora Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Settings & Backup</h3>
              <p className="text-[11px] text-slate-500">Wordora Preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Appearance Theme */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Application Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleChange('theme', 'light')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                  localSettings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => handleChange('theme', 'dark')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                  localSettings.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                onClick={() => handleChange('theme', 'system')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                  localSettings.theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> System
              </button>
            </div>
          </div>

          {/* Default Typography */}
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Default Font for New Documents
              </label>
              <select
                value={localSettings.defaultFont}
                onChange={e => handleChange('defaultFont', e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {BUILT_IN_FONTS.map(f => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Default Font Size
              </label>
              <select
                value={localSettings.defaultFontSize}
                onChange={e => handleChange('defaultFontSize', Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {[9, 10, 11, 12, 14, 16, 18].map(s => (
                  <option key={s} value={s}>{s} pt</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bengali Typing Aid Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Bengali Typing & Kar Assistant</p>
                <p className="text-[11px] text-slate-400">Shows floating bar for Bengali diacritics and symbols</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.bengaliTypingAid}
                onChange={e => handleChange('bengaliTypingAid', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
            </label>
          </div>

          {/* Backup & Restore */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" /> Backup & Data
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export All Docs
              </button>
              <label className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Restore Backup
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* About Developer & Application Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div 
              onClick={() => {
                if (onOpenAbout) {
                  onClose();
                  onOpenAbout();
                }
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-800/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs font-bold text-xs shrink-0">
                  AAA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Arif Ahmed Adi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                      Founder & Developer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap to view About, bio, vision & direct contacts
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                Wordora · Made with passion by Arif Ahmed Adi
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              </p>
              <p>© 2026 Arif Ahmed Adi. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
