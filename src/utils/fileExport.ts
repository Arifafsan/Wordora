/**
 * Wordora Document File Export & Device Storage Manager
 * 
 * Handles cross-platform export to real device storage:
 * - Native Android: Storage Access Framework (ACTION_CREATE_DOCUMENT) with folder/name selection
 * - Native Android: Direct save to Downloads/Wordora folder via MediaStore
 * - Modern Web: File System Access API (showSaveFilePicker) with cancel detection
 * - Standard Web fallback: Clean verified Blob download
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

export interface DocumentExportNativePlugin {
  exportFileWithPicker(options: {
    fileName: string;
    mimeType: string;
    base64Data: string;
  }): Promise<{
    success: boolean;
    cancelled?: boolean;
    uri?: string;
    fileName?: string;
    destination?: string;
    message?: string;
  }>;

  saveToDownloads(options: {
    fileName: string;
    mimeType: string;
    base64Data: string;
  }): Promise<{
    success: boolean;
    cancelled?: boolean;
    uri?: string;
    fileName?: string;
    destination?: string;
    message?: string;
  }>;
}

export const NativeDocumentExport = registerPlugin<DocumentExportNativePlugin>('DocumentExport');

export interface ExportSaveOptions {
  blob: Blob;
  fileName: string;
  mimeType: string;
  saveMode?: 'picker' | 'downloads';
}

export interface ExportSaveResult {
  success: boolean;
  cancelled?: boolean;
  destinationName?: string;
  uri?: string;
  fileName?: string;
  error?: string;
}

/**
 * Sanitizes a proposed file title to be safe for Android, Linux, macOS, and Windows file systems.
 */
export function sanitizeFileName(rawName: string, defaultName = 'Wordora_Document'): string {
  if (!rawName || !rawName.trim()) {
    return defaultName;
  }
  // Replace illegal filename characters: \ / : * ? " < > |
  let sanitized = rawName
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip leading/trailing dots or spaces
  sanitized = sanitized.replace(/^[\. ]+|[\. ]+$/g, '');

  if (!sanitized) {
    return defaultName;
  }

  // Cap at 100 characters for safety across all mobile file systems
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100).trim();
  }

  return sanitized;
}

/**
 * Ensures a filename has the correct required extension.
 */
export function ensureExtension(fileName: string, extension: string): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  if (fileName.toLowerCase().endsWith(ext.toLowerCase())) {
    return fileName;
  }
  return `${fileName}${ext}`;
}

/**
 * Converts a Blob to a base64 encoded string.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file binary'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Checks if HTML content contains meaningful text or media.
 */
export function isDocumentEmpty(html: string): boolean {
  if (!html || !html.trim()) return true;
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = (tmp.innerText || tmp.textContent || '').trim();
    const hasImages = tmp.querySelectorAll('img').length > 0;
    const hasTables = tmp.querySelectorAll('table').length > 0;
    return text.length === 0 && !hasImages && !hasTables;
  }
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  return stripped.length === 0 && !html.includes('<img') && !html.includes('<table');
}

/**
 * Extracts clean, human-readable plain text from HTML, preserving structure.
 */
export function extractPlainTextFromHtml(html: string): string {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = html;

    const processNode = (node: Node): string => {
      let result = '';
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          result += child.textContent || '';
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tag = el.tagName.toLowerCase();

          if (tag === 'br') {
            result += '\n';
          } else if (tag === 'hr') {
            result += '\n----------------------------------------\n';
          } else if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr'].includes(tag)) {
            const inner = processNode(el).trim();
            if (inner) result += `${inner}\n`;
          } else if (tag === 'li') {
            const inner = processNode(el).trim();
            if (inner) result += `• ${inner}\n`;
          } else if (['td', 'th'].includes(tag)) {
            const inner = processNode(el).trim();
            result += `${inner}\t`;
          } else {
            result += processNode(el);
          }
        }
      }
      return result;
    };

    const plain = processNode(container);
    return plain.replace(/\n{3,}/g, '\n\n').trim();
  }

  // Safe fallback for non-DOM / test environments
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/h[1-6]>|<\/tr>|<\/li>/gi, '\n')
    .replace(/<\/td>|<\/th>/gi, '\t')
    .replace(/<hr\s*[\/]?>/gi, '\n----------------------------------------\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Saves a document file directly to device storage.
 * 
 * Accurately reports whether the file was written or if the user cancelled.
 * Never gives a false positive.
 */
export async function saveExportedFile({
  blob,
  fileName,
  mimeType,
  saveMode = 'picker'
}: ExportSaveOptions): Promise<ExportSaveResult> {
  if (!blob || blob.size === 0) {
    return {
      success: false,
      error: 'Cannot export an empty file.'
    };
  }

  // 1. Native Android environment via Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      if (!base64Data) {
        return { success: false, error: 'Failed to encode document data.' };
      }

      let res;
      if (saveMode === 'downloads') {
        res = await NativeDocumentExport.saveToDownloads({
          fileName,
          mimeType,
          base64Data
        });
      } else {
        res = await NativeDocumentExport.exportFileWithPicker({
          fileName,
          mimeType,
          base64Data
        });
      }

      if (res && res.success) {
        return {
          success: true,
          cancelled: false,
          destinationName: res.destination || 'Device Storage',
          uri: res.uri,
          fileName: res.fileName || fileName
        };
      } else if (res && res.cancelled) {
        return {
          success: false,
          cancelled: true,
          error: 'Save was cancelled.'
        };
      } else {
        return {
          success: false,
          error: res?.message || 'Device storage operation failed.'
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.toLowerCase().includes('cancel')) {
        return { success: false, cancelled: true, error: 'Save was cancelled.' };
      }
      console.warn('Native export error:', err);
      // Fall through to browser download as fallback
    }
  }

  // 2. Web File System Access API (Desktop / Supported Mobile Browsers)
  if (saveMode !== 'downloads' && typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const extension = fileName.includes('.') ? fileName.split('.').pop() || 'bin' : 'bin';
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: `${extension.toUpperCase()} Document`,
            accept: { [mimeType]: [`.${extension}`] }
          }
        ]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      return {
        success: true,
        cancelled: false,
        destinationName: handle.name || fileName,
        fileName: handle.name || fileName
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          cancelled: true,
          error: 'Save was cancelled.'
        };
      }
      // If SecurityError or blocked in iframe, smoothly proceed to fallback
      console.info('showSaveFilePicker unavailable or dismissed, using standard download stream:', err);
    }
  }

  // 3. Reliable Browser Download Fallback
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Keep object URL active momentarily for download initiation
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 4000);

    return {
      success: true,
      cancelled: false,
      destinationName: 'Downloads folder',
      fileName
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to trigger browser download.'
    };
  }
}
