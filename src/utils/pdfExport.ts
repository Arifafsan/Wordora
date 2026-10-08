/**
 * PDF Generation, Print & Sharing System
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { DocumentModel } from '../types/document';
import { downloadFile } from './docxExport';

/**
 * Renders the document paper container or HTML string to a high-resolution PDF file.
 */
export async function exportToPdf(
  source: HTMLElement | string, 
  filename?: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  pageSettings?: DocumentModel['pageSettings']
): Promise<Blob> {
  let cleanupTemp: (() => void) | null = null;
  let pageElement: HTMLElement;

  if (typeof source === 'string') {
    const tempDiv = document.createElement('div');
    tempDiv.className = 'print-page';
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = orientation === 'landscape' ? '297mm' : '210mm';
    tempDiv.style.minHeight = orientation === 'landscape' ? '210mm' : '297mm';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#0f172a';
    const topM = pageSettings?.margins?.top ?? 25.4;
    const rightM = pageSettings?.margins?.right ?? 25.4;
    const bottomM = pageSettings?.margins?.bottom ?? 25.4;
    const leftM = pageSettings?.margins?.left ?? 25.4;
    tempDiv.style.padding = `${Math.round(topM * 2.8)}px ${Math.round(rightM * 2.8)}px ${Math.round(bottomM * 2.8)}px ${Math.round(leftM * 2.8)}px`;
    tempDiv.style.fontFamily = '"Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.innerHTML = source;
    document.body.appendChild(tempDiv);
    pageElement = tempDiv;
    cleanupTemp = () => {
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    };
  } else {
    pageElement = (source.querySelector('.print-page') as HTMLElement) || source;
  }

  try {
    // Capture with html2canvas-pro with scale 2 for crisp vector-like text rendering
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (_clonedDoc, clonedElement) => {
        // Ensure transforms are reset so page is captured at full natural resolution without mobile scaling
        clonedElement.style.transform = 'none';
        clonedElement.style.boxShadow = 'none';
        if (clonedElement.parentElement) {
          clonedElement.parentElement.style.transform = 'none';
        }
        
        // Remove any focus rings or outlines from interactive editing
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((node) => {
          const el = node as HTMLElement;
          if (el.style) {
            el.style.outline = 'none';
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm
    const isLandscape = orientation === 'landscape';
    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate scaled height on A4
    const imgHeightOnPdf = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeightOnPdf;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf);
    heightLeft -= pdfHeight;

    // Multi-page splitting if content exceeds one page
    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf);
      heightLeft -= pdfHeight;
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } finally {
    if (cleanupTemp) {
      cleanupTemp();
    }
  }
}

/**
 * Triggers native mobile print dialog.
 */
export function printDocument(): void {
  window.print();
}

/**
 * Native mobile sharing using Web Share API if available.
 */
export async function shareDocument(doc: DocumentModel, blob?: Blob, mimeType?: string, fileName?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      if (blob && navigator.canShare && fileName) {
        const file = new File([blob], fileName, { type: mimeType || 'application/octet-stream' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: doc.title,
            text: `Document from Wordora: ${doc.title}`,
            files: [file]
          });
          return true;
        }
      }

      // Fallback share text
      await navigator.share({
        title: doc.title,
        text: `${doc.title}\n\nCreated with Wordora.`
      });
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Native share failed:', err);
      }
      return false;
    }
  }
  return false;
}
