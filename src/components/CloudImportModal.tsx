/**
 * Cloud & Storage Import Hub (Android File Manager, Google Drive, OneDrive)
 * 
 * Supports:
 * - Direct native file browsing via Android File Manager & Device Storage
 * - Google Drive link import & Cloud Drive connector
 * - Microsoft OneDrive link import & Office 365 connector
 * - Built-in sample DOCX documents for testing Word compatibility immediately
 */

import React, { useState } from 'react';
import { 
  FolderOpen, 
  HardDrive, 
  Cloud, 
  ExternalLink, 
  X, 
  Check, 
  FileText, 
  Loader2, 
  Globe, 
  DownloadCloud,
  Sparkles,
  Link2
} from 'lucide-react';

interface CloudImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocalFile: () => void;
  onImportFromBlob: (file: File) => void;
}

export const CloudImportModal: React.FC<CloudImportModalProps> = ({
  isOpen,
  onClose,
  onSelectLocalFile,
  onImportFromBlob
}) => {
  const [activeTab, setActiveTab] = useState<'device' | 'gdrive' | 'onedrive' | 'samples'>('device');
  const [cloudUrl, setCloudUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle importing a DOCX file from an external URL (Google Drive export, OneDrive, or web link)
  const handleFetchUrl = async () => {
    if (!cloudUrl.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let downloadUrl = cloudUrl.trim();

      // Transform Google Drive share link to direct download link if needed
      // Format: https://drive.google.com/file/d/FILE_ID/view -> https://drive.google.com/uc?export=download&id=FILE_ID
      const gDriveMatch = downloadUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gDriveMatch && gDriveMatch[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file (Status ${response.status}). Please ensure link is publicly accessible.`);
      }

      const blob = await response.blob();
      const filename = cloudUrl.split('/').pop()?.split('?')[0] || 'Cloud_Document.docx';
      const file = new File([blob], filename.endsWith('.docx') ? filename : `${filename}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      onImportFromBlob(file);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching cloud document';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a rich sample DOCX on the fly to test Windows PC Word features
  const handleLoadSample = async (type: 'bilingual' | 'table_images' | 'bijoy') => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { exportToDocx } = await import('../utils/docxExport');
      let sampleTitle = 'Bilingual_Bangla_English_Sample';
      let sampleHtml = '';

      if (type === 'bilingual') {
        sampleTitle = 'Government_Office_Notice_Bilingual';
        sampleHtml = `
          <h1 style="text-align: center; color: #1e3a8a; font-family: 'Times New Roman', serif;">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h1>
          <h2 style="text-align: center; color: #475569; font-size: 14pt;">Government of the People's Republic of Bangladesh</h2>
          <hr/>
          <p style="text-align: justify; font-family: 'Noto Sans Bengali', sans-serif;">
            <strong>স্মারক নং:</strong> বিআর-২০২৬/০৮৯<br/>
            <strong>বিষয়:</strong> ডিজিটাল নথি প্রস্তুতকরণ ও মাইক্রোসফট ওয়ার্ড ফাইল সামঞ্জস্যতা সংক্রান্ত নির্দেশিকা।
          </p>
          <p style="text-align: justify; font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;">
            এতদ্বারা সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, দাপ্তরিক সকল কাজে বাংলা ইউনিকোড (Bangla Unicode) এবং ইংরেজি মিশ্রিত লেখার ক্ষেত্রে ফন্ট হিসেবে <em>Times New Roman</em> ও <em>Noto Sans Bengali</em> ব্যবহার বাধ্যতামূলক করা হয়েছে।
          </p>
          <p style="background-color: #fef08a; padding: 8px; border-left: 4px solid #ca8a04; font-size: 11pt;">
            <strong>বিশেষ দ্রষ্টব্য:</strong> পুরানো সুতন্মী এমজে (SutonnyMJ) ফাইলসমূহ স্বয়ংক্রিয়ভাবে ইউনিকোডে রূপান্তর করা যাবে।
          </p>
          <p style="margin-top: 20px;">
            স্বাক্ষরিত,<br/>
            <strong>উপ-পরিচালক (প্রশাসন)</strong>
          </p>
        `;
      } else if (type === 'table_images') {
        sampleTitle = 'Monthly_Project_Status_Report';
        sampleHtml = `
          <h1 style="color: #0f172a; font-family: Arial, sans-serif;">Monthly Performance & Financial Evaluation</h1>
          <p style="color: #64748b; font-size: 11pt;">Prepared on Windows PC Word Processor</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;" border="1">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Project Phase</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Lead Developer</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Completion</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Budget (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">DOCX Import Engine</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Mobile Core Team</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #16a34a; font-weight: bold;">100%</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">$4,500</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Bangla Unicode & SutonnyMJ</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Localization Unit</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #16a34a; font-weight: bold;">100%</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">$3,200</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Table & Image Rendering</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">UI/UX System</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #16a34a; font-weight: bold;">100%</td>
                <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">$2,800</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 11pt; color: #334155;">
            All targets successfully met for current milestone. Format fidelity confirmed for Word documents on Android and Windows PC.
          </p>
        `;
      } else {
        sampleTitle = 'SutonnyMJ_Bijoy_Legacy_File';
        sampleHtml = `
          <h1 style="font-family: 'SutonnyMJ', sans-serif; font-size: 22pt; color: #1e3a8a;">Avgvi †mvbvi evsjv</h1>
          <p style="font-family: 'SutonnyMJ', sans-serif; font-size: 14pt; line-height: 1.8;">
            Avgvi †mvbvi evsjv, Avwg †Zvgvq fv‡jvevwm|<br/>
            wPiw\`b †Zvgvi AvKvk, †Zvgvi evZvm, Avgvi cÖv‡Y evRvq euvwk|<br/>
            I gv, dv¸‡b †Zvgvi Avgvi e‡b NÖv‡Y cvMj K‡i, gwiv nvq, nvq †i|
          </p>
          <p style="font-size: 11pt; color: #64748b; font-family: Calibri, sans-serif;">
            (This paragraph contains classic SutonnyMJ ANSI text typically created on Windows PC Bijoy keyboards.)
          </p>
        `;
      }

      const dummyDoc = {
        id: 'sample_' + Date.now(),
        title: sampleTitle,
        contentHtml: sampleHtml,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pageSettings: {
          paperSize: 'a4' as const,
          orientation: 'portrait' as const,
          margins: { top: 25, right: 25, bottom: 25, left: 25 },
          headerText: 'LipiWord Test Document',
          footerText: 'Confidential Internal Review',
          showPageNumber: true,
          pageNumberPosition: 'bottom-center' as const,
          differentFirstPage: false
        },
        favorite: false,
        inTrash: false,
        tags: ['sample', 'word'],
        wordCount: 150,
        charCount: 900
      };

      const docxBlob = await exportToDocx(dummyDoc);
      const file = new File([docxBlob], `${sampleTitle}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      onImportFromBlob(file);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate sample';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Open Word Document</h3>
              <p className="text-[11px] text-slate-500">Device Storage, Cloud & Sample DOCX</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 pt-2 gap-1 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
          <button
            onClick={() => setActiveTab('device')}
            className={`py-2 px-3 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'device'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Device / Android
          </button>
          <button
            onClick={() => setActiveTab('gdrive')}
            className={`py-2 px-3 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gdrive'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Google Drive
          </button>
          <button
            onClick={() => setActiveTab('onedrive')}
            className={`py-2 px-3 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'onedrive'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            OneDrive
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-2 px-3 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Samples
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2 border border-red-200 dark:border-red-900">
              <span className="font-semibold">Error:</span> {errorMsg}
            </div>
          )}

          {/* Device / Android File Manager Tab */}
          {activeTab === 'device' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <HardDrive className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Android File Manager & Local Storage
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse internal storage, SD Card, Downloads folder, or WhatsApp Documents on your Android device.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSelectLocalFile();
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Files on Device</span>
              </button>

              <p className="text-[11px] text-slate-400">
                Supports .docx and .txt files created on Windows PC or Mac.
              </p>
            </div>
          )}

          {/* Google Drive Tab */}
          {activeTab === 'gdrive' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 rounded-xl">
                <div className="flex items-center gap-2 font-medium text-blue-900 dark:text-blue-200">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Google Drive Cloud Integration</span>
                </div>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                  Open any Word DOCX document stored in Google Drive. You can either paste a shareable link or pick files directly from Android's Drive app in the file picker.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Paste Google Drive File Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={cloudUrl}
                    onChange={e => setCloudUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-blue-500"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={isLoading || !cloudUrl.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
                    <span>Open</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSelectLocalFile();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Select via Google Drive in Android File Picker</span>
                </button>
              </div>
            </div>
          )}

          {/* OneDrive Tab */}
          {activeTab === 'onedrive' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/50 rounded-xl">
                <div className="flex items-center gap-2 font-medium text-sky-900 dark:text-sky-200">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>OneDrive Cloud Storage</span>
                </div>
                <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 mt-1 leading-relaxed">
                  Open Word DOCX documents synchronized from Windows PC via OneDrive or SharePoint.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Paste OneDrive Share Link / Web URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://1drv.ms/... or https://onedrive.live.com/..."
                    value={cloudUrl}
                    onChange={e => setCloudUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-blue-500"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={isLoading || !cloudUrl.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
                    <span>Open</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSelectLocalFile();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Select via OneDrive in Android File Picker</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Samples Tab */}
          {activeTab === 'samples' && (
            <div className="space-y-2.5 text-xs">
              <p className="text-slate-500 text-[11px]">
                Test Word DOCX parsing and formatting right now with realistic documents:
              </p>

              <button
                onClick={() => handleLoadSample('bilingual')}
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                    Bilingual Govt Circular (.docx)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Bangla + English</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tests mixed Times New Roman & Noto Sans Bengali typography, headings, highlight colors, and alignments.
                </p>
              </button>

              <button
                onClick={() => handleLoadSample('table_images')}
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                    Corporate Financial Table (.docx)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">Tables & Styles</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tests Word multi-column tables, cell borders, header row formatting, background shading, and numbers.
                </p>
              </button>

              <button
                onClick={() => handleLoadSample('bijoy')}
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                    SutonnyMJ Bijoy Classic (.docx)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">SutonnyMJ</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tests detection of legacy SutonnyMJ ANSI keyboard encoding and 1-click conversion to Unicode.
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
