/**
 * Font Management System
 * 
 * Supports:
 * - Built-in professional English & Bengali fonts
 * - SutonnyMJ legacy ANSI font integration
 * - Dynamic TTF / OTF font file importing and browser FontFace API registration
 * - Persistent storage of custom fonts in IndexedDB / LocalStorage
 */

import { CustomFont, FontOption } from '../types/document';

export const BUILT_IN_FONTS: FontOption[] = [
  // English standard fonts
  { name: 'Calibri', family: 'Calibri, sans-serif', category: 'english', description: 'Modern default word-processing sans' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif', category: 'english', description: 'Classic formal document serif' },
  { name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'english', description: 'Clean universal sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'english', description: 'Elegant editorial serif' },
  { name: 'Courier New', family: '"Courier New", Courier, monospace', category: 'english', description: 'Monospaced typewriter font' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'english', description: 'High-legibility screen sans' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif', category: 'english', description: 'Compact clean sans' },

  // Bengali Unicode Fonts
  { name: 'Noto Sans Bengali', family: '"Noto Sans Bengali", sans-serif', category: 'bengali', description: 'Clear Google Bengali Unicode sans' },
  { name: 'Noto Serif Bengali', family: '"Noto Serif Bengali", serif', category: 'bengali', description: 'Refined Bengali book serif' },
  { name: 'Kalpurush', family: '"Kalpurush", sans-serif', category: 'bengali', description: 'Popular Bengali desktop font' },
  { name: 'Tiro Bangla', family: '"Tiro Bangla", serif', category: 'bengali', description: 'High-contrast newspaper serif' },

  // Legacy Font
  { name: 'SutonnyMJ', family: '"SutonnyMJ", "Sutonny MJ", "SutonnyMJ Unicode", sans-serif', category: 'legacy', description: 'Classic Bijoy ANSI / SutonnyMJ Bengali Font' },
];

const CUSTOM_FONTS_STORAGE_KEY = 'lipiword_custom_fonts_v1';

/**
 * Loads custom user fonts from storage and registers them in document.fonts.
 */
export async function loadAndRegisterCustomFonts(): Promise<CustomFont[]> {
  try {
    const raw = localStorage.getItem(CUSTOM_FONTS_STORAGE_KEY);
    if (!raw) return [];
    const fonts: CustomFont[] = JSON.parse(raw);

    for (const font of fonts) {
      await registerFontFace(font.familyName, font.blobDataUrl);
    }

    return fonts;
  } catch (err) {
    console.warn('Failed to load custom fonts from storage:', err);
    return [];
  }
}

/**
 * Registers a font face in the browser using the CSS FontFace API.
 */
export async function registerFontFace(familyName: string, dataUrl: string): Promise<boolean> {
  try {
    if (typeof FontFace === 'undefined') return false;
    const font = new FontFace(familyName, `url(${dataUrl})`);
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    return true;
  } catch (err) {
    console.error(`Error registering font ${familyName}:`, err);
    return false;
  }
}

/**
 * Saves a new custom font (from file upload).
 */
export async function saveCustomFont(
  file: File, 
  customName?: string, 
  isBangla?: boolean
): Promise<{ success: boolean; font?: CustomFont; error?: string }> {
  try {
    const fontName = customName?.trim() || file.name.replace(/\.[^/.]+$/, '');
    const familyName = `Custom_${fontName.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Read file as Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Register font immediately
    const registered = await registerFontFace(familyName, dataUrl);
    if (!registered) {
      return { success: false, error: 'Could not register font face with browser.' };
    }

    // Persist in localStorage
    const raw = localStorage.getItem(CUSTOM_FONTS_STORAGE_KEY);
    const existing: CustomFont[] = raw ? JSON.parse(raw) : [];

    const newFont: CustomFont = {
      id: 'font_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: fontName,
      familyName,
      format: file.name.endsWith('.otf') ? 'otf' : 'ttf',
      blobDataUrl: dataUrl,
      isBangla: isBangla ?? (fontName.toLowerCase().includes('bangla') || fontName.toLowerCase().includes('bengali') || fontName.toLowerCase().includes('sutonny')),
      createdAt: Date.now()
    };

    const updated = [...existing.filter(f => f.name.toLowerCase() !== fontName.toLowerCase()), newFont];
    localStorage.setItem(CUSTOM_FONTS_STORAGE_KEY, JSON.stringify(updated));

    return { success: true, font: newFont };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error uploading font';
    return { success: false, error: message };
  }
}

/**
 * Removes a user-added font.
 */
export function deleteCustomFont(fontId: string): void {
  try {
    const raw = localStorage.getItem(CUSTOM_FONTS_STORAGE_KEY);
    if (!raw) return;
    const existing: CustomFont[] = JSON.parse(raw);
    const filtered = existing.filter(f => f.id !== fontId);
    localStorage.setItem(CUSTOM_FONTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete custom font:', err);
  }
}
