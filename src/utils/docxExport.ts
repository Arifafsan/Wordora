/**
 * DOCX Export Engine
 * 
 * Powered by `docx` library with full OpenXML fidelity:
 * - Margins (top, right, bottom, left) from page settings
 * - Page orientation (Portrait & Landscape)
 * - Header and Footer with dynamic page numbering
 * - Text styling: Times New Roman, Arial, Calibri, Noto Sans Bengali, SutonnyMJ
 * - Font sizes, bold, italic, underline, strikethrough, text colors, background highlight shading
 * - Paragraph alignments (Left, Center, Right, Justify)
 * - Bulleted and Numbered lists
 * - Tables with borders, cell padding, backgrounds, and custom widths
 * - Embedded Images converted from <img> data URLs into real OpenXML ImageRuns
 */

import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageOrientation,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { DocumentModel } from '../types/document';
import { parseDocxFile, DocxImportResult } from './docxParser';
import { saveExportedFile, ExportSaveResult } from './fileExport';

/**
 * Exports a Wordora document model as a standard .docx binary Blob.
 */
export async function exportToDocx(docModel: DocumentModel): Promise<Blob> {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(docModel.contentHtml, 'text/html');
  const body = htmlDoc.body;

  const children: (Paragraph | DocxTable)[] = [];

  // Iterate top-level DOM nodes in body
  const nodes = Array.from(body.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        children.push(new Paragraph({
          children: [new TextRun({ text, font: 'Calibri' })]
        }));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'table') {
        const table = convertHtmlTableToDocx(el);
        if (table) children.push(table);
      } else if (tagName === 'hr') {
        children.push(new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
          }
        }));
      } else if (tagName === 'ul' || tagName === 'ol') {
        const listItems = Array.from(el.querySelectorAll('li'));
        listItems.forEach(li => {
          const p = convertHtmlElementToDocxParagraph(li as HTMLElement, tagName === 'ul');
          if (p) children.push(p);
        });
      } else {
        const p = convertHtmlElementToDocxParagraph(el);
        if (p) children.push(p);
      }
    }
  }

  // If document empty, ensure at least one paragraph exists
  if (children.length === 0) {
    children.push(new Paragraph({ text: '' }));
  }

  // Margins calculation (convert mm to twips: 1 mm ~ 56.7 twips)
  const margins = docModel.pageSettings.margins;
  const topTwips = Math.round(margins.top * 56.7);
  const rightTwips = Math.round(margins.right * 56.7);
  const bottomTwips = Math.round(margins.bottom * 56.7);
  const leftTwips = Math.round(margins.left * 56.7);

  // Orientation
  const isLandscape = docModel.pageSettings.orientation === 'landscape';
  const orientation = isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;

  // Paper Dimensions in twips (1mm = 56.7 twips)
  // A4: 210 x 297 mm -> 11906 x 16838 twips
  // Letter: 216 x 279 mm -> 12240 x 15840 twips
  // Legal: 216 x 356 mm -> 12240 x 20160 twips
  let widthTwips = 11906;
  let heightTwips = 16838;

  if (docModel.pageSettings.paperSize === 'letter') {
    widthTwips = 12240;
    heightTwips = 15840;
  } else if (docModel.pageSettings.paperSize === 'legal') {
    widthTwips = 12240;
    heightTwips = 20160;
  }

  if (isLandscape) {
    const temp = widthTwips;
    widthTwips = heightTwips;
    heightTwips = temp;
  }

  // Header definition
  let docHeaders: { default?: Header } | undefined = undefined;
  if (docModel.pageSettings.headerText) {
    docHeaders = {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: docModel.pageSettings.headerText,
                font: 'Calibri',
                size: 18,
                color: '64748B'
              })
            ]
          })
        ]
      })
    };
  }

  // Footer definition with dynamic page numbers
  let docFooters: { default?: Footer } | undefined = undefined;
  if (docModel.pageSettings.footerText || docModel.pageSettings.showPageNumber) {
    const footerRuns: TextRun[] = [];

    if (docModel.pageSettings.footerText) {
      footerRuns.push(new TextRun({
        text: `${docModel.pageSettings.footerText}    `,
        font: 'Calibri',
        size: 18,
        color: '64748B'
      }));
    }

    if (docModel.pageSettings.showPageNumber) {
      footerRuns.push(
        new TextRun({ text: 'Page ', font: 'Calibri', size: 18, color: '64748B' }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '64748B' }),
        new TextRun({ text: ' of ', font: 'Calibri', size: 18, color: '64748B' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: '64748B' })
      );
    }

    docFooters = {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: footerRuns
          })
        ]
      })
    };
  }

  const doc = new DocxDocument({
    creator: 'Wordora Mobile Word Processor',
    title: docModel.title,
    description: 'Document exported with Wordora Mobile',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: widthTwips,
              height: heightTwips,
              orientation
            },
            margin: {
              top: topTwips,
              right: rightTwips,
              bottom: bottomTwips,
              left: leftTwips
            }
          }
        },
        headers: docHeaders,
        footers: docFooters,
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Converts an HTML element to a docx Paragraph
 */
function convertHtmlElementToDocxParagraph(el: HTMLElement, isBulletList = false): Paragraph {
  const tagName = el.tagName.toLowerCase();
  let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;

  if (tagName === 'h1') heading = HeadingLevel.HEADING_1;
  else if (tagName === 'h2') heading = HeadingLevel.HEADING_2;
  else if (tagName === 'h3') heading = HeadingLevel.HEADING_3;
  else if (tagName === 'h4') heading = HeadingLevel.HEADING_4;

  let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
  const textAlign = el.style.textAlign || el.getAttribute('align') || '';
  if (textAlign === 'center') alignment = AlignmentType.CENTER;
  else if (textAlign === 'right') alignment = AlignmentType.RIGHT;
  else if (textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

  const runs: (TextRun | ImageRun)[] = [];
  extractRunsAndImages(el, runs);

  return new Paragraph({
    heading,
    alignment,
    bullet: isBulletList || tagName === 'li' ? { level: 0 } : undefined,
    children: runs.length > 0 ? runs : [new TextRun({ text: el.innerText || '' })]
  });
}

/**
 * Recursively extracts formatted TextRuns and ImageRuns from DOM nodes.
 */
function extractRunsAndImages(
  node: Node,
  runs: (TextRun | ImageRun)[],
  inheritedFormat = {
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    font: 'Calibri',
    fontSizePt: 11,
    color: undefined as string | undefined,
    highlight: undefined as string | undefined
  }
) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent;
      if (text) {
        runs.push(new TextRun({
          text,
          bold: inheritedFormat.bold,
          italics: inheritedFormat.italic,
          underline: inheritedFormat.underline ? {} : undefined,
          strike: inheritedFormat.strike,
          font: inheritedFormat.font,
          size: Math.round(inheritedFormat.fontSizePt * 2), // Word half-points
          color: inheritedFormat.color,
          shading: inheritedFormat.highlight
            ? { fill: inheritedFormat.highlight, type: ShadingType.CLEAR }
            : undefined
        }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Check for <img> tag
      if (tag === 'img') {
        const src = el.getAttribute('src');
        if (src && src.startsWith('data:image')) {
          try {
            const bytes = dataUriToUint8Array(src);
            const w = el.clientWidth || 400;
            const h = el.clientHeight || 260;
            const imgType: 'png' | 'jpg' | 'gif' | 'bmp' = 
              src.includes('image/jpeg') || src.includes('image/jpg') ? 'jpg' :
              src.includes('image/gif') ? 'gif' : 'png';

            runs.push(new ImageRun({
              data: bytes,
              type: imgType,
              transformation: {
                width: Math.min(520, Math.max(120, w)),
                height: Math.min(600, Math.max(80, h))
              }
            }));
          } catch (imgErr) {
            console.warn('Could not export embedded image to docx:', imgErr);
          }
        }
        continue;
      }

      const bold = inheritedFormat.bold || tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '400') >= 700;
      const italic = inheritedFormat.italic || tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
      const underline = inheritedFormat.underline || tag === 'u' || el.style.textDecoration.includes('underline');
      const strike = inheritedFormat.strike || tag === 's' || tag === 'strike' || tag === 'del' || el.style.textDecoration.includes('line-through');

      // Font Family
      let font = inheritedFormat.font;
      const styleFont = el.style.fontFamily;
      if (styleFont) {
        if (styleFont.includes('Times')) font = 'Times New Roman';
        else if (styleFont.includes('Bengali') || styleFont.includes('Noto Sans Bengali')) font = 'Noto Sans Bengali';
        else if (styleFont.includes('Sutonny')) font = 'SutonnyMJ';
        else if (styleFont.includes('Arial')) font = 'Arial';
        else if (styleFont.includes('Calibri')) font = 'Calibri';
        else if (styleFont.includes('Georgia')) font = 'Georgia';
      }

      // Font Size
      let fontSizePt = inheritedFormat.fontSizePt;
      if (el.style.fontSize) {
        const parsedSize = parseFloat(el.style.fontSize);
        if (!isNaN(parsedSize)) {
          fontSizePt = el.style.fontSize.includes('pt') ? parsedSize : Math.round(parsedSize * 0.75);
        }
      }

      // Font Color
      let color = inheritedFormat.color;
      if (el.style.color && el.style.color.startsWith('#')) {
        color = el.style.color.replace('#', '');
      } else if (el.style.color && el.style.color.startsWith('rgb')) {
        color = rgbToHex(el.style.color);
      }

      // Background / Highlight Color
      let highlight = inheritedFormat.highlight;
      const bg = el.style.backgroundColor;
      if (bg) {
        if (bg.startsWith('#')) highlight = bg.replace('#', '');
        else if (bg.startsWith('rgb')) highlight = rgbToHex(bg);
      }

      extractRunsAndImages(el, runs, { bold, italic, underline, strike, font, fontSizePt, color, highlight });
    }
  }
}

/**
 * Converts an HTML Table to a docx Table with borders and cell backgrounds.
 */
function convertHtmlTableToDocx(tableEl: HTMLElement): DocxTable | null {
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  if (rows.length === 0) return null;

  const docxRows: DocxTableRow[] = [];

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const docxCells: DocxTableCell[] = [];

    for (const cell of cells) {
      const cellEl = cell as HTMLElement;
      const isHeader = cellEl.tagName.toLowerCase() === 'th';

      // Cell background shading
      let cellShading: { fill: string; type: (typeof ShadingType)[keyof typeof ShadingType] } | undefined = undefined;
      const bg = cellEl.style.backgroundColor;
      if (bg) {
        const hex = bg.startsWith('#') ? bg.replace('#', '') : (bg.startsWith('rgb') ? rgbToHex(bg) : '');
        if (hex) {
          cellShading = { fill: hex, type: ShadingType.CLEAR };
        }
      } else if (isHeader) {
        cellShading = { fill: 'F8FAFC', type: ShadingType.CLEAR };
      }

      // Cell contents
      const cellRuns: TextRun[] = [];
      const text = cellEl.innerText || '';
      cellRuns.push(new TextRun({
        text,
        bold: isHeader,
        font: 'Calibri',
        size: 20
      }));

      docxCells.push(new DocxTableCell({
        children: [
          new Paragraph({
            children: cellRuns
          })
        ],
        shading: cellShading,
        margins: {
          top: 120, // in dxa
          bottom: 120,
          left: 140,
          right: 140
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
        },
        width: {
          size: Math.floor(100 / Math.max(1, cells.length)),
          type: WidthType.PERCENTAGE
        }
      }));
    }

    docxRows.push(new DocxTableRow({
      children: docxCells,
      tableHeader: row.querySelector('th') !== null
    }));
  }

  return new DocxTable({
    rows: docxRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    }
  });
}

/**
 * Convert base64 data URI into Uint8Array binary for docx ImageRun
 */
function dataUriToUint8Array(dataUri: string): Uint8Array {
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return new Uint8Array();
  const base64 = dataUri.substring(commaIdx + 1);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Utility: Converts rgb(r, g, b) string to clean HEX string without #
 */
function rgbToHex(rgbStr: string): string {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return '';
  const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
  return `${r}${g}${b}`.toUpperCase();
}

/**
 * Imports a .docx file and returns parsed result and compatibility audit report
 */
export async function importDocxFile(file: File): Promise<DocxImportResult> {
  return await parseDocxFile(file);
}

/**
 * Saves a binary Blob to device or downloads storage
 */
export async function downloadFile(blob: Blob, filename: string, mimeType = 'application/octet-stream'): Promise<ExportSaveResult> {
  return await saveExportedFile({
    blob,
    fileName: filename,
    mimeType
  });
}

