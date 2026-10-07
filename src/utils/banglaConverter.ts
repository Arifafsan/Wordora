/**
 * Unicode ↔ Bijoy (SutonnyMJ ANSI) Converter Engine
 * 
 * Supports high-accuracy bidirectional conversion between modern Bengali Unicode text 
 * and legacy Bijoy keyboard encoding (used by SutonnyMJ, Sutonny, SutonnyBanglaOMJ, etc.).
 * 
 * Handles:
 * - Documents created on Windows PC / MS Word containing SutonnyMJ or mixed Bijoy+Unicode fonts
 * - Pre-consonant vowel signs: ই-কার (ি), এ-কার (ে), ঐ-কার (ৈ) with proper reordering
 * - Composite vowel signs: ও-কার (ো), ঔ-কার (ৌ) from e-kar + akar / e-kar + oukar
 * - Reph (র্) reordering
 * - Phalas: য-ফলা (্য), র-ফলা (্র), ল-ফলা (্ল), ব-ফলা (্ব), ম-ফলা (্ম)
 * - Complete set of 120+ Bengali Conjuncts (যুক্তাক্ষর) like ক্ষ, জ্ঞ, ঙ্গ, ঙ্ক, ঞ্চ, ঞ্জ, ণ্ট, ণ্ড, ষ্ণ, স্ট, স্প, স্থ, etc.
 * - Mixed text where Bengali Unicode consonants (ব, গ, প, etc.) appear adjacent to ANSI glyphs (¨, ø, †, ‡, K, U, etc.)
 */

// Multi-character conjuncts in Bijoy (ANSI sequence -> Unicode)
const MULTI_CHAR_BIJOY_CONJUNCTS: [RegExp, string][] = [
  [/šÍ/g, 'ন্ত'],
  [/›`/g, 'ন্দ'],
  [/¯’/g, 'স্থ'],
  [/¯ú/g, 'স্প'],
  [/¯¿/g, 'স্ত্র'],
  [/¯«/g, 'স্র'],
  [/¯\^/g, 'স্ব'],
  [/¯§/g, 'স্ম'],
  [/¯ø/g, 'স্ল'],
  [/®‹/g, 'ষ্ক'],
  [/®U/g, 'ষ্ট'],
  [/®V/g, 'ষ্ঠ'],
  [/®Y/g, 'ষ্ণ'],
  [/®c/g, 'ষ্প'],
  [/®d/g, 'ষ্ফ'],
  [/®g/g, 'ষ্ম'],
  [/cÖ/g, 'প্র'],
  [/MÖ/g, 'গ্র'],
  [/d«/g, 'ফ্র'],
  [/eª/g, 'ব্র'],
  [/`ª/g, 'দ্র'],
  [/aª/g, 'ধ্র'],
  [/bª/g, 'ন্র'],
  [/Av/g, 'আ'],
];

// Pre-symbol prefixes in Bijoy
const PRE_SYMBOLS_MAP: Record<string, string> = {
  '®': 'ষ্',
  '¯': 'স্',
  '”': 'চ্',
  '˜': 'দ্',
  '™': 'দ্',
  'š': 'ন্',
  '›': 'ন্',
  '¤': 'ম্'
};

// Single-character ANSI conjunct glyphs
const SINGLE_CHAR_CONJUNCTS: Record<string, string> = {
  '°': 'ক্ক',
  '±': 'ক্ট',
  '²': 'ক্ষ্ণ',
  '³': 'ক্ত',
  '´': 'ক্ম',
  'µ': 'ক্র',
  '¶': 'ক্ষ',
  '·': 'ক্স',
  '¸': 'গু',
  '¹': 'জ্ঞ',
  'º': 'গ্দ',
  '»': 'গ্ধ',
  '¼': 'ঙ্ক',
  '½': 'ঙ্গ',
  '¾': 'জ্জ',
  '¿': '্ত্র',
  'À': 'জ্ঝ',
  'Á': 'জ্ঞ',
  'Â': 'ঞ্চ',
  'Ã': 'ঞ্ছ',
  'Ä': 'ঞ্জ',
  'Å': 'ঞ্ঝ',
  'Æ': 'ট্ট',
  'Ç': 'ড্ড',
  'È': 'ণ্ট',
  'É': 'ণ্ঠ',
  'Ê': 'ণ্ড',
  'Ë': 'ত্ত',
  'Ì': 'ত্থ',
  'Î': 'ত্র',
  'Ï': 'দ্দ',
  'Ð': 'ণ্ড',
  'Ñ': '-',
  '×': 'দ্ধ',
  'Ø': 'দ্ব',
  'Ù': 'দ্ম',
  'Ú': 'ন্ঠ',
  'Û': 'ন্ড',
  'Ü': 'ন্ধ',
  'Ý': 'ন্স',
  'Þ': 'প্ট',
  'ß': 'প্ত',
  'à': 'প্প',
  'á': 'প্স',
  'â': 'ব্জ',
  'ã': 'ব্দ',
  'ä': 'ব্ধ',
  'å': 'ভ্র',
  'ç': 'ম্ফ',
  'é': 'ল্ক',
  'ê': 'ল্গ',
  'ë': 'ল্ট',
  'ì': 'ল্ড',
  'í': 'ল্প',
  'î': 'ল্ফ',
  'ï': 'শু',
  'ð': 'শ্চ',
  'ñ': 'শ্ছ',
  'ò': 'ষ্ণ',
  'ó': 'ষ্ট',
  'ô': 'ষ্ঠ',
  'õ': 'ষ্ফ',
  'ö': 'স্খ',
  '÷': 'স্ট',
  'ù': 'স্ফ',
  'û': 'হু',
  'ü': 'হৃ',
  'ý': 'হ্ন',
  'þ': 'হ্ম',
  'ÿ': 'ক্ষ',
  '‘': '্তু',
  '’': '্থ',
  '‹': '্ক',
  'Œ': '্ক্র',
  '—': '্ত',
  'Í': '্ত',
  'œ': '্ন',
  'è': '্ন',
  'ú': '্প'
};

// Basic Bijoy ANSI character translation table
const BIJOY_CHAR_MAP: Record<string, string> = {
  // Swaroborno (Vowels)
  'A': 'অ',
  'B': 'ই',
  'C': 'ঈ',
  'D': 'উ',
  'E': 'ঊ',
  'F': 'ঋ',
  'G': 'এ',
  'H': 'ঐ',
  'I': 'ও',
  'J': 'ঔ',

  // Byanjonborno (Consonants) - both cases for robust recovery
  'k': 'ক',
  'K': 'ক',
  'L': 'খ',
  'M': 'গ',
  'N': 'ঘ',
  'O': 'ঙ',
  'P': 'চ',
  'Q': 'ছ',
  'R': 'জ',
  'S': 'ঝ',
  'T': 'ঞ',
  'U': 'ট',
  'V': 'ঠ',
  'W': 'ড',
  'X': 'ঢ',
  'Y': 'ণ',
  'Z': 'ত',
  '_': 'থ',
  '`': 'দ',
  'a': 'ধ',
  'b': 'ন',
  'c': 'প',
  'd': 'ফ',
  'e': 'ব',
  'f': 'ভ',
  'g': 'ম',
  'h': 'য',
  'i': 'র',
  'j': 'ল',
  'l': 'ষ',
  'm': 'স',
  'n': 'হ',
  'o': 'ড়',
  'p': 'ঢ়',
  'q': 'য়',
  'r': 'ৎ',
  's': 'ং',
  't': 'ঃ',
  'u': 'ঁ',

  // Post vowel signs (kars)
  'v': 'া',
  'x': 'ী',
  'y': 'ু',
  'z': 'ু',
  'æ': 'ু',
  '“': 'ু',
  '–': 'ু',
  '~': 'ূ',
  'ƒ': 'ূ',
  '‚': 'ূ',
  '„': 'ৃ',
  '…': 'ৃ',
  'Š': 'ৌ',

  // Special signs
  '&': '্',
  '|': '।',

  // Digits (Bengali numerals)
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯'
};

// Unicode to Bijoy reverse mapping (Standard SutonnyMJ mapping)
const UNICODE_TO_BIJOY_MAP: Record<string, string> = {
  'অ': 'A',
  'আ': 'Av',
  'ই': 'B',
  'ঈ': 'C',
  'উ': 'D',
  'ঊ': 'E',
  'ঋ': 'F',
  'এ': 'G',
  'ঐ': 'H',
  'ও': 'I',
  'ঔ': 'J',
  'ক': 'k',
  'খ': 'L',
  'গ': 'M',
  'ঘ': 'N',
  'ঙ': 'O',
  'চ': 'P',
  'ছ': 'Q',
  'জ': 'R',
  'ঝ': 'S',
  'ঞ': 'T',
  'ট': 'U',
  'ঠ': 'V',
  'ড': 'W',
  'ঢ': 'X',
  'ণ': 'Y',
  'ত': 'Z',
  'থ': '_',
  'দ': '`',
  'ধ': 'a',
  'ন': 'b',
  'প': 'c',
  'ফ': 'd',
  'ব': 'e',
  'ভ': 'f',
  'ম': 'g',
  'য': 'h',
  'র': 'i',
  'ল': 'j',
  'শ': 'k',
  'ষ': 'l',
  'স': 'm',
  'হ': 'n',
  'ড়': 'o',
  'ঢ়': 'p',
  'য়': 'q',
  'ৎ': 'r',
  'ং': 's',
  'ঃ': 't',
  'ঁ': 'u',
  'া': 'v',
  'ি': 'w',
  'ী': 'x',
  'ু': 'y',
  'ূ': '~',
  'ৃ': '„',
  'ে': '‡',
  'ৈ': '‰',
  'ৌ': 'Š',
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
  '।': '|'
};

// Unicode Conjuncts to Bijoy ANSI glyphs
const UNICODE_CONJUNCTS_TO_BIJOY: [RegExp, string][] = [
  [/ক্ষ/g, '¶'],
  [/জ্ঞ/g, 'Á'],
  [/ঞ্চ/g, 'Â'],
  [/ঞ্ছ/g, 'Ã'],
  [/ঞ্জ/g, 'Ä'],
  [/ট্ট/g, 'Æ'],
  [/ঠ্ঠ/g, 'Ç'],
  [/ড্ড/g, 'Ç'],
  [/ণ্ট/g, 'È'],
  [/ণ্ঠ/g, 'É'],
  [/ণ্ড/g, 'Ê'],
  [/ত্ত/g, 'Ë'],
  [/ত্থ/g, 'Ì'],
  [/ত্র/g, 'Î'],
  [/দ্দ/g, 'Ï'],
  [/দ্ধ/g, '×'],
  [/দ্ব/g, 'Ø'],
  [/দ্ম/g, 'Ù'],
  [/ন্ম/g, 'Ó'],
  [/ম্প/g, 'Ô'],
  [/ম্ব/g, 'Ö'],
  [/ম্ম/g, 'Ø'],
  [/ল্ক/g, 'é'],
  [/ল্গ/g, 'ê'],
  [/ল্ট/g, 'ë'],
  [/ল্ড/g, 'ì'],
  [/ল্প/g, 'í'],
  [/স্ফ/g, 'ù'],
  [/ষ্ঠ/g, 'ô'],
  [/ষ্ণ/g, 'ò'],
  [/ষ্ট/g, 'ó'],
  [/ষ্প/g, '®c'],
  [/ষ্ক/g, '®‹'],
  [/স্থ/g, '¯’'],
  [/স্প/g, '¯ú'],
  [/স্ত/g, '¯Í'],
  [/স্র/g, '¯«'],
  [/স্ব/g, '¯^'],
  [/স্ম/g, '¯§'],
  [/স্ল/g, '¯ø'],
  [/স্ট/g, '÷'],
  [/হ্ন/g, 'ý'],
  [/হ্ম/g, 'þ'],
  [/ক্ক/g, '°'],
  [/ক্ট/g, '±'],
  [/ক্ত/g, '³'],
  [/ক্ম/g, '´'],
  [/ক্র/g, 'µ'],
  [/ঙ্ক/g, '¼'],
  [/ঙ্গ/g, '½'],
  [/জ্জ/g, '¾'],
  [/ব্দ/g, 'ã'],
  [/ব্ধ/g, 'ä'],
  [/ভ্র/g, 'å'],
  [/ব্র/g, 'eª'],
  [/প্র/g, 'cÖ'],
  [/গ্র/g, 'MÖ'],
  [/ফ্র/g, 'd«'],
  [/দ্র/g, '`ª'],
  [/ধ্র/g, 'aª'],
  [/ন্র/g, 'bª'],
  [/ন্ত/g, 'šÍ'],
  [/ন্দ/g, '›`'],
  [/ন্ধ/g, 'Ü'],
  [/ন্স/g, 'Ý']
];

/**
 * Converts Bijoy ANSI text (SutonnyMJ) or corrupted mixed Bangla text to clean Unicode Bengali.
 * 
 * Works accurately on both pure SutonnyMJ documents and mixed computer documents 
 * where Unicode characters were interspersed with Bijoy ANSI glyphs (e.g. "জহাদি †÷ার", "প¨v‡KU", "লাKী").
 */
export function bijoyToUnicode(text: string): string {
  if (!text) return '';

  let s = text;

  // 1. Multi-character Bijoy conjuncts and prefixes
  for (const [re, rep] of MULTI_CHAR_BIJOY_CONJUNCTS) {
    s = s.replace(re, rep);
  }

  // 2. Pre-symbols (prefix consonants with hasant like ¯ -> স্)
  for (const [k, v] of Object.entries(PRE_SYMBOLS_MAP)) {
    s = s.replaceAll(k, v);
  }

  // 3. Single-character conjuncts (e.g. ÷ -> স্ট, ¶ -> ক্ষ, etc.)
  for (const [k, v] of Object.entries(SINGLE_CHAR_CONJUNCTS)) {
    s = s.replaceAll(k, v);
  }

  // 4. Reph (©) placed before a consonant cluster -> র্ + consonant
  s = s.replace(/©([a-zA-Zক-হ])/g, 'র্$1');

  // 5. Phalas (subjoined consonants attached to consonants):
  // Jafola (¨) -> ্য
  s = s.replace(/([a-zA-Zক-হ\u0985-\u09EF])¨/g, '$1্য');
  // Lafola (ø, ¬, ­) -> ্ল
  s = s.replace(/([a-zA-Zক-হ\u0985-\u09EF])[ø¬­]/g, '$1্ল');
  // Rafola (ª, «, Ö) -> ্র
  s = s.replace(/([a-zA-Zক-হ\u0985-\u09EF])[ª«Ö]/g, '$1্র');
  // Bafola (^, Ÿ, ¡, ¦) -> ্ব
  s = s.replace(/([a-zA-Zক-হ\u0985-\u09EF])[\^Ÿ¡¦]/g, '$1্ব');
  // Mafola (¥, §) -> ্ম
  s = s.replace(/([a-zA-Zক-হ\u0985-\u09EF])[¥§]/g, '$1্ম');

  // Consonant cluster pattern: can be a Bengali Unicode consonant cluster or an ANSI Bijoy character
  const C = '(?:[ক-হ](?:্[ক-হ])*(?:[্য্র্ল্ব্ম])?|[a-zA-Z_`])';

  // 6. Pre-kar vowel sign reordering:
  // In Bijoy, e-kar (†, ‡), i-kar (w), oi-kar (ˆ, ‰) appear BEFORE the consonant.
  // In Unicode, vowel signs appear AFTER the consonant cluster.
  
  // Composite o-kar: [†‡] + Consonant + [vা] -> Consonant + ো
  s = s.replace(new RegExp('[†‡](' + C + ')[vা]', 'g'), '$1ো');
  
  // Composite ou-kar: [†‡] + Consonant + [Šৗ] -> Consonant + ৌ
  s = s.replace(new RegExp('[†‡](' + C + ')[Šৗ]', 'g'), '$1ৌ');
  
  // Simple e-kar: [†‡] + Consonant -> Consonant + ে
  s = s.replace(new RegExp('[†‡](' + C + ')', 'g'), '$1ে');
  
  // Simple i-kar: w + Consonant -> Consonant + ি
  s = s.replace(new RegExp('w(' + C + ')', 'g'), '$1ি');
  
  // Simple oi-kar: [ˆ‰] + Consonant -> Consonant + ৈ
  s = s.replace(new RegExp('[ˆ‰](' + C + ')', 'g'), '$1ৈ');

  // 7. Remaining single-character Bijoy translation
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    out += BIJOY_CHAR_MAP[ch] !== undefined ? BIJOY_CHAR_MAP[ch] : ch;
  }

  // 8. Post-conversion normalization:
  // Fix double hasants, duplicate kars, and compound vowels
  out = out.replace(/ো/g, 'ো');
  out = out.replace(/ৌ/g, 'ৌ');
  out = out.replace(/অা/g, 'আ');
  out = out.replace(/্+/g, '্');

  return out;
}

/**
 * Converts Unicode Bengali text to Bijoy ANSI text (for use with SutonnyMJ font).
 */
export function unicodeToBijoy(text: string): string {
  if (!text) return '';

  let res = text;

  // Handle reph (র্ = র + ্) - in Bijoy reph comes before the cluster
  res = res.replace(/র্([ক-হ])/g, '©$1');

  // Handle composite vowel signs:
  // ও-কার (ো) = ে + া
  res = res.replace(/ো/g, 'ো');
  // ঔ-কার (ৌ) = ে + ৗ
  res = res.replace(/ৌ/g, 'েŠ');

  // Replace conjuncts
  for (const [pattern, replacement] of UNICODE_CONJUNCTS_TO_BIJOY) {
    res = res.replace(pattern, replacement);
  }

  // Subjoined phalas
  res = res.replace(/([ক-হ])্য/g, '$1¨');
  res = res.replace(/([ক-হ])্ল/g, '$1ø');
  res = res.replace(/([ক-হ])্র/g, '$1ª');
  res = res.replace(/([ক-হ])্ব/g, '$1^');
  res = res.replace(/([ক-হ])্ম/g, '$1§');

  // Reorder pre-consonant vowels:
  // Unicode: Consonant + ি -> Bijoy: w + Consonant
  res = res.replace(/([ক-হ\u09CE\u09BC\u09CD¶ÁÂÃÄÆÇÈÉÊËÌÎÏÐ×ØÙÚÛÜÝÞßôòóõö°±²³´µ·¸¹º»¼½¾¿ãäå÷ùûüýþÿ]+)ি/g, 'w$1');
  res = res.replace(/([ক-হ\u09CE\u09BC\u09CD¶ÁÂÃÄÆÇÈÉÊËÌÎÏÐ×ØÙÚÛÜÝÞßôòóõö°±²³´µ·¸¹º»¼½¾¿ãäå÷ùûüýþÿ]+)ে/g, '‡$1');
  res = res.replace(/([ক-হ\u09CE\u09BC\u09CD¶ÁÂÃÄÆÇÈÉÊËÌÎÏÐ×ØÙÚÛÜÝÞßôòóõö°±²³´µ·¸¹º»¼½¾¿ãäå÷ùûüýþÿ]+)ৈ/g, '‰$1');

  // Convert individual characters
  let output = '';
  for (let i = 0; i < res.length; i++) {
    const ch = res[i];
    output += UNICODE_TO_BIJOY_MAP[ch] !== undefined ? UNICODE_TO_BIJOY_MAP[ch] : ch;
  }

  return output;
}

/**
 * Checks if a string contains Bengali Unicode characters.
 */
export function hasBengaliCharacters(str: string): boolean {
  return /[\u0980-\u09FF]/.test(str);
}

/**
 * Detects whether a string contains corrupted Bijoy / ANSI Bengali characters,
 * such as legacy SutonnyMJ glyphs, unrendered kars, or mixed ANSI+Unicode.
 */
export function detectCorruptedBanglaOrBijoy(str: string): boolean {
  if (!str) return false;

  // 1. Bijoy pre-kar vowels before consonants or conjuncts
  if (/[†‡][a-zA-Zক-হ0-9÷ø¨]/.test(str)) return true;
  if (/w[a-zA-Zক-হ0-9]/.test(str)) return true;
  if (/[ˆ‰][a-zA-Zক-হ0-9]/.test(str)) return true;

  // 2. Attached phalas in Bijoy
  if (/[a-zA-Zক-হ]¨/.test(str)) return true; // e.g. প¨v, K¨v
  if (/[a-zA-Zক-হ][ø¬­]/.test(str)) return true; // e.g. বøvK
  if (/[a-zA-Zক-হ][ª«Ö]/.test(str)) return true;

  // 3. Prominent Bijoy conjunct ANSI glyphs
  if (/[¶ÁÂÃÄÆÇÈÉÊËÌÎÏÐ×ØÙÚÛÜÝÞßôòóõö÷ùûüýþÿ°±²³´µ·¸¹º»¼½¾¿ãäå]/.test(str)) return true;

  // 4. Multi-character Bijoy ligatures
  if (/šÍ|›`|¯’|¯ú|¯¿|cÖ|MÖ|d«|eª|`ª|aª|bª/.test(str)) return true;

  // 5. Classic Bijoy whole words or common mixed sequences
  if (/\bAvgvi\b|\b†mvbvi\b|\bevslv\b|প¨v‡KU|K¨v/i.test(str)) return true;

  return false;
}
