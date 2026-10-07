/**
 * Document data types and interfaces for LipiWord Mobile
 */

export type PaperSize = 'a4' | 'letter' | 'legal' | 'custom';
export type PageOrientation = 'portrait' | 'landscape';
export type PaperTheme = 'white' | 'sepia' | 'dark';

export interface PageMargins {
  top: number;    // in mm
  right: number;  // in mm
  bottom: number; // in mm
  left: number;   // in mm
}

export interface PageSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  margins: PageMargins;
  customWidth?: number;  // in mm
  customHeight?: number; // in mm
  headerText: string;
  footerText: string;
  showPageNumber: boolean;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-right';
  differentFirstPage: boolean;
}

export interface DocumentModel {
  id: string;
  title: string;
  contentHtml: string;
  createdAt: number;
  updatedAt: number;
  pageSettings: PageSettings;
  favorite: boolean;
  inTrash: boolean;
  trashDate?: number;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  tags: string[];
  wordCount: number;
  charCount: number;
}

export interface CustomFont {
  id: string;
  name: string;
  familyName: string;
  format: 'ttf' | 'otf' | 'woff';
  blobDataUrl: string;
  isBangla?: boolean;
  createdAt: number;
}

export interface FontOption {
  name: string;
  family: string;
  category: 'bengali' | 'english' | 'legacy' | 'custom';
  description?: string;
}

export interface DocumentStats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  paragraphs: number;
  readingTimeMinutes: number;
  pageEstimate: number;
}
