/**
 * Document Storage, Persistence & Templates Manager
 */

import { DocumentModel, PageSettings } from '../types/document';
import { getTemplateById, recordTemplateUsage } from './templateStorage';
import { DocumentTemplate } from '../types/template';

const DOCUMENTS_STORAGE_KEY = 'lipiword_documents_v1';
const AUTOSAVE_PREFIX = 'lipiword_autosave_';
const SETTINGS_STORAGE_KEY = 'lipiword_app_settings_v1';

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 }, // 1 inch standard
  headerText: 'Wordora Document',
  footerText: 'Confidential & Proprietary',
  showPageNumber: true,
  pageNumberPosition: 'bottom-center',
  differentFirstPage: false
};

// IndexedDB Configuration for unlimited local persistence
const IDB_NAME = 'lipiword_db_v1';
const IDB_STORE = 'documents';
const IDB_VERSION = 1;

let idbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbPromise;
}

// In-memory cache for synchronous reads
let memoryDocsCache: DocumentModel[] | null = null;

async function persistToIDB(doc: DocumentModel): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(doc);
  } catch (err) {
    console.warn('IDB write failed:', err);
  }
}

async function deleteFromIDB(id: string): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(id);
  } catch (err) {
    console.warn('IDB delete failed:', err);
  }
}

/**
 * Attempts to clear old autosaves and trash items from localStorage when quota is tight
 */
function tryFreeLocalStorageSpace(): void {
  try {
    // 1. Remove all autosave keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(AUTOSAVE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. Filter out trashed docs from localStorage representation
    if (memoryDocsCache) {
      const nonTrash = memoryDocsCache.filter(d => !d.inTrash);
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(nonTrash));
    }
  } catch (e) {
    console.warn('Unable to free localStorage space:', e);
  }
}

/**
 * Safely writes documents array to localStorage with fallback handling
 */
function safeSaveToLocalStorage(docs: DocumentModel[]): boolean {
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    return true;
  } catch (err) {
    console.warn('LocalStorage quota exceeded, running cleanup routine...');
    tryFreeLocalStorageSpace();
    try {
      // Try again with smaller payload if possible
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
      return true;
    } catch {
      console.warn('LocalStorage still full. Retaining in IndexedDB and memory cache.');
      return false;
    }
  }
}
export const TEMPLATES = [
  {
    id: 'tpl_blank',
    title: 'Blank Document',
    description: 'Start fresh with standard margins and clean formatting',
    tags: ['Basic'],
    contentHtml: `<p><span style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11pt;">Start typing your document here...</span></p>`
  },
  {
    id: 'tpl_bangla_application',
    title: 'দরখাস্ত (Official Application)',
    description: 'Formal Bengali administrative application for leave or office request',
    tags: ['Bangla', 'Official'],
    contentHtml: `
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>৬ অক্টোবর, ২০২৬</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহাপরিচালক</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">আইসিটি অধিদপ্তর, আগারগাঁও, ঢাকা।</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: অগ্রিম ছুটির অনুমোদনের জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহোদয়,</span></p>
      <p style="text-align: justify; line-height: 1.5; margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, আমি আপনার কার্যালয়ে সহকারী প্রোগ্রামার হিসেবে কর্মরত আছি। আমার ব্যক্তিগত পারিবারিক বিশেষ প্রয়োজনে আগামী ১০ অক্টোবর থেকে ১৪ অক্টোবর পর্যন্ত মোট ৫ (পাঁচ) দিনের নৈমিত্তিক ছুটি প্রয়োজন। উক্ত সময়ে আমার সহকর্মী জনাব রফিকুল ইসলাম আমার দায়িত্ব পালন করবেন।</span></p>
      <p style="text-align: justify; line-height: 1.5; margin-bottom: 20pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, বিনীত প্রার্থনা এই যে, আমার উল্লিখিত ৫ দিনের ছুটি মঞ্জুর করে বাধিত করবেন।</span></p>
      <p style="margin-bottom: 4pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>মো. আরিফুল ইসলাম</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #4b5563;">সহকারী প্রোগ্রামার, আইসিটি সেল</span></p>
    `
  },
  {
    id: 'tpl_bangla_cv',
    title: 'জীবনবৃত্তান্ত (Bengali Resume / Bio-Data)',
    description: 'Clean two-tone Bengali Curriculum Vitae layout with contact & skills table',
    tags: ['Bangla', 'Career'],
    contentHtml: `
      <h1 style="text-align: center; color: #1e3a8a; margin-bottom: 4pt; font-family: 'Noto Serif Bengali', serif; font-size: 20pt;">জীবনবৃত্তান্ত (Curriculum Vitae)</h1>
      <p style="text-align: center; color: #4b5563; margin-bottom: 16pt; font-size: 10.5pt;"><strong>নাজমুল হাসান</strong> · ঢাকা, বাংলাদেশ · +৮৮০১৭১২-৩৪৫৬৭৮ · nazmul@example.com</p>
      <hr style="border: none; border-top: 1.5pt solid #1e3a8a; margin-bottom: 14pt;" />
      <h3 style="color: #1e3a8a; margin-bottom: 6pt; font-size: 13pt;"><strong>১. শিক্ষাগত যোগ্যতা</strong></h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14pt;" border="1">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: left;">পরীক্ষার নাম</th>
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: left;">বিভাগ / বিষয়</th>
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">পাসের সন</th>
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">সিজিপিএ / গ্রেড</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">বি.এস.সি (কম্পিউটার সায়েন্স)</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">সিএসই</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">২০২৪</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">৩.৮৫</td>
          </tr>
          <tr>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">এইচ.এস.সি</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">বিজ্ঞান</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">২০২০</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">৫.০০</td>
          </tr>
        </tbody>
      </table>
      <h3 style="color: #1e3a8a; margin-bottom: 6pt; font-size: 13pt;"><strong>২. প্রযুক্তিগত দক্ষতা</strong></h3>
      <p style="margin-bottom: 6pt; line-height: 1.5;"><span style="font-size: 10.5pt;"><strong>প্রোগ্রামিং ও ফ্রেমওয়ার্ক:</strong> JavaScript, TypeScript, React, Node.js, Python</span></p>
      <p style="margin-bottom: 14pt; line-height: 1.5;"><span style="font-size: 10.5pt;"><strong>টাইপোগ্রাফি ও ভাষা:</strong> বাংলা ইউনিকোড (Avro), সুতন্নী এমজে (Bijoy), ইংরেজি দ্রুত টাইপিং</span></p>
    `
  },
  {
    id: 'tpl_mixed_demo',
    title: 'দ্বিভাষিক নথি (Bilingual English & Bangla)',
    description: 'Demonstrates mixed English and Bengali typography with SutonnyMJ compatibility',
    tags: ['Bilingual', 'Showcase'],
    contentHtml: `
      <h2 style="color: #0f172a; margin-bottom: 8pt; font-family: 'Times New Roman', Times, serif; font-size: 18pt;"><strong>Bilingual Document / দ্বিভাষিক নথি</strong></h2>
      <p style="line-height: 1.6; margin-bottom: 12pt; text-align: justify;">
        <span style="font-family: 'Times New Roman', Times, serif; font-size: 11pt;">This document demonstrates high-precision typography in <strong>Wordora</strong>. You can seamlessly type both modern English and Bengali in the same paragraph without font conflict.</span>
      </p>
      <p style="line-height: 1.8; margin-bottom: 14pt; text-align: justify;">
        <span style="font-family: 'Noto Serif Bengali', serif; font-size: 12pt; color: #1e3a8a;"><strong>বাংলাদেশ আমার প্রিয় মাতৃভূমি।</strong> এখানে বাংলা ভাষার সৌন্দর্য ও ব্যাকরণ সম্পূর্ণ নির্ভুলভাবে সংরক্ষিত থাকে। সুতন্নী এমজে (SutonnyMJ) এবং আধুনিক ইউনিকোড উভয় ফন্টেই কাজ করা সম্ভব।</span>
      </p>
      <div style="background-color: #f8fafc; border-left: 3pt solid #3b82f6; padding: 10pt; margin-bottom: 14pt;">
        <p style="margin-bottom: 4pt; font-size: 10pt; color: #1e293b;"><strong>Font Matrix in Wordora:</strong></p>
        <p style="margin-bottom: 2pt; font-size: 10pt; font-family: 'Times New Roman', Times, serif;">• English Body: Times New Roman (11pt Serif)</p>
        <p style="margin-bottom: 2pt; font-size: 10pt; font-family: 'Noto Sans Bengali', sans-serif;">• বাংলা শিরোনাম: Noto Sans Bengali (12pt)</p>
        <p style="margin-bottom: 0pt; font-size: 10pt; font-family: 'SutonnyMJ', sans-serif;">• লেগ্যাসি বিজয়: SutonnyMJ ANSI Converter ready</p>
      </div>
    `
  },
  {
    id: 'tpl_executive_report',
    title: 'Executive Project Report',
    description: 'Modern corporate document with executive summary and KPI metrics',
    tags: ['Business', 'Report'],
    contentHtml: `
      <h1 style="color: #0f172a; margin-bottom: 4pt; font-size: 22pt; font-family: 'Plus Jakarta Sans', sans-serif;"><strong>Quarterly Project Deliverable</strong></h1>
      <p style="color: #64748b; margin-bottom: 16pt; font-size: 11pt;">Prepared by Product Engineering · October 2026</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 16pt;" />
      <h3 style="color: #0f172a; font-size: 13pt; margin-bottom: 6pt;"><strong>1. Executive Summary</strong></h3>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 14pt; font-size: 10.5pt;">The Q3 product initiative delivered high-performance mobile document processing capabilities across Android and web targets. Key outcomes include 100% on-device auto-save resilience, multi-font typography support for both Latin and Indic scripts, and zero-loss DOCX binary export.</p>
      <h3 style="color: #0f172a; font-size: 13pt; margin-bottom: 6pt;"><strong>2. Strategic Outcomes</strong></h3>
      <ul style="margin-bottom: 14pt; padding-left: 20pt; line-height: 1.6; font-size: 10.5pt;">
        <li>Engineered low-latency mobile touch toolbar for one-handed formatting.</li>
        <li>Implemented bidirectional Unicode ↔ SutonnyMJ ANSI conversion.</li>
        <li>Preserved full table editing, column scaling, and cell background shading.</li>
      </ul>
    `
  }
];

/**
 * Calculates word and character count stats from HTML text.
 */
export function calculateTextStats(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = (tmp.textContent || tmp.innerText || '').trim();

  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
  const paragraphs = text ? text.split(/\n+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const pageEstimate = Math.max(1, Math.ceil(words / 450));

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    paragraphs,
    readingTimeMinutes,
    pageEstimate
  };
}

/**
 * Retrieves all stored documents. If empty, seeds initial templates.
 */
export function getAllDocuments(): DocumentModel[] {
  if (memoryDocsCache && memoryDocsCache.length > 0) {
    return [...memoryDocsCache].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      const seeded = seedInitialDocuments();
      memoryDocsCache = seeded;
      return seeded;
    }
    const docs: DocumentModel[] = JSON.parse(raw);
    memoryDocsCache = docs;
    // Async populate IDB in background for backup
    docs.forEach(d => persistToIDB(d));
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.warn('Error reading documents from storage, initializing fallback cache:', err);
    if (!memoryDocsCache) {
      memoryDocsCache = seedInitialDocuments();
    }
    return memoryDocsCache;
  }
}

/**
 * Seeds initial documents if storage is completely empty.
 */
function seedInitialDocuments(): DocumentModel[] {
  const demoDoc: DocumentModel = {
    id: 'doc_welcome',
    title: 'স্বাগতম ও Wordora গাইড (User Guide)',
    contentHtml: TEMPLATES[3].contentHtml, // Bilingual Showcase
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    pageSettings: { ...DEFAULT_PAGE_SETTINGS },
    favorite: true,
    inTrash: false,
    tags: ['Bangla', 'Guide'],
    wordCount: 142,
    charCount: 980
  };

  const appDoc: DocumentModel = {
    id: 'doc_application_demo',
    title: 'সরকারি ছুটির আবেদনপত্র (নমুনা)',
    contentHtml: TEMPLATES[1].contentHtml,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 3600000,
    pageSettings: { ...DEFAULT_PAGE_SETTINGS },
    favorite: false,
    inTrash: false,
    tags: ['Bangla', 'Official'],
    wordCount: 120,
    charCount: 760
  };

  const initialDocs = [demoDoc, appDoc];
  memoryDocsCache = initialDocs;
  safeSaveToLocalStorage(initialDocs);
  initialDocs.forEach(d => persistToIDB(d));
  return initialDocs;
}

/**
 * Fetches a single document by ID.
 */
export function getDocumentById(id: string): DocumentModel | null {
  const docs = getAllDocuments();
  return docs.find(d => d.id === id) || null;
}

/**
 * Saves or updates a document safely.
 */
export function saveDocument(doc: DocumentModel): void {
  try {
    const stats = calculateTextStats(doc.contentHtml);
    const updatedDoc: DocumentModel = {
      ...doc,
      updatedAt: Date.now(),
      wordCount: stats.words,
      charCount: stats.charactersWithSpaces
    };

    const docs = getAllDocuments();
    const existingIndex = docs.findIndex(d => d.id === doc.id);

    if (existingIndex >= 0) {
      docs[existingIndex] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    // Update in-memory cache immediately
    memoryDocsCache = docs;

    // Persist to IDB for unlimited capacity
    persistToIDB(updatedDoc);

    // Persist to localStorage safely (catches QuotaExceededError and frees space)
    safeSaveToLocalStorage(docs);

    // Clear autosave draft after manual/saved commit
    try {
      localStorage.removeItem(AUTOSAVE_PREFIX + doc.id);
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('Failed to save document to localStorage, ensured in memory & IDB:', err);
    // Persist to IDB even if localStorage failed
    persistToIDB(doc);
  }
}

/**
 * Creates a brand new document from scratch or template.
 */
export function createNewDocument(templateId?: string, customTitle?: string): DocumentModel {
  // Check rich template library first
  if (templateId) {
    const readyMade = getTemplateById(templateId);
    if (readyMade) {
      return createDocumentFromTemplate(readyMade, customTitle);
    }
  }

  // Fallback to legacy minimal templates
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const newId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const title = customTitle || (template.id === 'tpl_blank' ? 'Untitled Document' : template.title);

  const stats = calculateTextStats(template.contentHtml);

  const doc: DocumentModel = {
    id: newId,
    title,
    contentHtml: template.contentHtml,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pageSettings: { ...DEFAULT_PAGE_SETTINGS },
    favorite: false,
    inTrash: false,
    tags: [...template.tags],
    wordCount: stats.words,
    charCount: stats.charactersWithSpaces
  };

  const docs = getAllDocuments();
  docs.unshift(doc);
  memoryDocsCache = docs;
  persistToIDB(doc);
  safeSaveToLocalStorage(docs);
  return doc;
}

/**
 * Creates a new document from a DocumentTemplate model with full professional formatting
 */
export function createDocumentFromTemplate(template: DocumentTemplate, customTitle?: string): DocumentModel {
  recordTemplateUsage(template.id);
  const newId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const title = customTitle || (template.nameBn ? `${template.name} (${template.nameBn})` : template.name);
  const stats = calculateTextStats(template.contentHtml);

  const doc: DocumentModel = {
    id: newId,
    title,
    contentHtml: template.contentHtml,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pageSettings: { ...template.pageSettings },
    favorite: false,
    inTrash: false,
    tags: [...(template.tags || []), template.categoryName],
    wordCount: stats.words,
    charCount: stats.charactersWithSpaces
  };

  const docs = getAllDocuments();
  docs.unshift(doc);
  memoryDocsCache = docs;
  persistToIDB(doc);
  safeSaveToLocalStorage(docs);
  return doc;
}

/**
 * Soft deletes a document to Trash.
 */
export function moveToTrash(id: string): void {
  const docs = getAllDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.inTrash = true;
    doc.trashDate = Date.now();
    memoryDocsCache = docs;
    persistToIDB(doc);
    safeSaveToLocalStorage(docs);
  }
}

/**
 * Restores a document from Trash.
 */
export function restoreFromTrash(id: string): void {
  const docs = getAllDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.inTrash = false;
    doc.trashDate = undefined;
    memoryDocsCache = docs;
    persistToIDB(doc);
    safeSaveToLocalStorage(docs);
  }
}

/**
 * Permanently deletes a document.
 */
export function permanentlyDelete(id: string): void {
  const docs = getAllDocuments();
  const filtered = docs.filter(d => d.id !== id);
  memoryDocsCache = filtered;
  deleteFromIDB(id);
  safeSaveToLocalStorage(filtered);
  try {
    localStorage.removeItem(AUTOSAVE_PREFIX + id);
  } catch {
    // ignore
  }
}

/**
 * Duplicates a document.
 */
export function duplicateDocument(id: string): DocumentModel | null {
  const orig = getDocumentById(id);
  if (!orig) return null;

  const newDoc: DocumentModel = {
    ...orig,
    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title: `${orig.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    favorite: false,
    inTrash: false
  };

  const docs = getAllDocuments();
  docs.unshift(newDoc);
  memoryDocsCache = docs;
  persistToIDB(newDoc);
  safeSaveToLocalStorage(docs);
  return newDoc;
}

/**
 * Toggles favorite state.
 */
export function toggleFavorite(id: string): boolean {
  const docs = getAllDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.favorite = !doc.favorite;
    memoryDocsCache = docs;
    persistToIDB(doc);
    safeSaveToLocalStorage(docs);
    return doc.favorite;
  }
  return false;
}

/**
 * Saves auto-save checkpoint.
 */
export function autoSaveDraft(id: string, contentHtml: string, pageSettings?: PageSettings): void {
  try {
    const payload = {
      id,
      contentHtml,
      pageSettings,
      savedAt: Date.now()
    };
    localStorage.setItem(AUTOSAVE_PREFIX + id, JSON.stringify(payload));
  } catch (e) {
    console.warn('Autosave quota exceeded or error:', e);
  }
}

/**
 * Retrieves recovery draft if one exists newer than saved doc.
 */
export function getAutoSaveRecovery(id: string): { contentHtml: string; pageSettings?: PageSettings; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears auto-save draft for doc.
 */
export function clearAutoSaveDraft(id: string): void {
  localStorage.removeItem(AUTOSAVE_PREFIX + id);
}

/**
 * App global settings interface & store.
 */
export interface AppSettings {
  defaultFont: string;
  defaultFontSize: number;
  defaultPaperSize: 'a4' | 'letter' | 'legal';
  autoSaveIntervalSeconds: number;
  theme: 'system' | 'light' | 'dark';
  enableHapticFeedback: boolean;
  bengaliTypingAid: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultFont: 'Calibri',
  defaultFontSize: 11,
  defaultPaperSize: 'a4',
  autoSaveIntervalSeconds: 3,
  theme: 'system',
  enableHapticFeedback: true,
  bengaliTypingAid: true
};

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
}
