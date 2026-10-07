/**
 * Template Storage & Management System
 * 
 * Handles built-in templates, user-created custom templates,
 * favorite bookmarks, recent template history, and placeholder utilities.
 */

import { DocumentTemplate, TemplateCategory } from '../types/template';
import { BUILT_IN_TEMPLATES } from '../data/builtInTemplates';

const CUSTOM_TEMPLATES_KEY = 'lipiword_user_custom_templates_v1';
const TEMPLATE_FAVORITES_KEY = 'lipiword_template_favorites_v1';
const RECENT_TEMPLATES_KEY = 'lipiword_recent_templates_v1';

/**
 * Retrieves all templates including built-in and user-created custom templates.
 */
export function getAllTemplates(): DocumentTemplate[] {
  const custom = getUserCustomTemplates();
  return [...BUILT_IN_TEMPLATES, ...custom];
}

/**
 * Finds a template by its ID.
 */
export function getTemplateById(id: string): DocumentTemplate | null {
  const all = getAllTemplates();
  return all.find(t => t.id === id) || null;
}

/**
 * Retrieves user custom templates saved locally.
 */
export function getUserCustomTemplates(): DocumentTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load user custom templates:', err);
    return [];
  }
}

/**
 * Saves a user-created template.
 */
export function saveUserCustomTemplate(tpl: DocumentTemplate): void {
  try {
    const customs = getUserCustomTemplates();
    const existingIndex = customs.findIndex(t => t.id === tpl.id);
    if (existingIndex >= 0) {
      customs[existingIndex] = { ...tpl, lastUpdated: new Date().toISOString().split('T')[0] };
    } else {
      customs.unshift({ ...tpl, isCustom: true, lastUpdated: new Date().toISOString().split('T')[0] });
    }
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customs));
  } catch (err) {
    console.warn('Failed to save custom template:', err);
  }
}

/**
 * Deletes a user-created custom template.
 */
export function deleteUserCustomTemplate(id: string): void {
  try {
    const customs = getUserCustomTemplates().filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customs));
  } catch (err) {
    console.warn('Failed to delete custom template:', err);
  }
}

/**
 * Retrieves favorited template IDs.
 */
export function getFavoriteTemplateIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATE_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Checks if a template is favorited.
 */
export function isTemplateFavorite(id: string): boolean {
  const favs = getFavoriteTemplateIds();
  return favs.includes(id);
}

/**
 * Toggles favorite state of a template.
 */
export function toggleTemplateFavorite(id: string): boolean {
  const favs = getFavoriteTemplateIds();
  let updated: string[];
  const wasFav = favs.includes(id);
  if (wasFav) {
    updated = favs.filter(f => f !== id);
  } else {
    updated = [id, ...favs];
  }
  try {
    localStorage.setItem(TEMPLATE_FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update favorites:', e);
  }
  return !wasFav;
}

/**
 * Records template usage to "Recently Used" list.
 */
export function recordTemplateUsage(id: string): void {
  try {
    const raw = localStorage.getItem(RECENT_TEMPLATES_KEY);
    const recents: string[] = raw ? JSON.parse(raw) : [];
    const filtered = recents.filter(item => item !== id);
    filtered.unshift(id);
    // Keep top 20 recent
    localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.warn('Failed to record template usage:', e);
  }
}

/**
 * Retrieves recently used template IDs.
 */
export function getRecentTemplateIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Powerful multi-lingual search across template name, Bangla name, tags, description, and placeholders.
 */
export function searchTemplates(
  query: string,
  category?: string,
  languageFilter?: string
): DocumentTemplate[] {
  const all = getAllTemplates();
  const q = query.trim().toLowerCase();
  const recentIds = getRecentTemplateIds();
  const favoriteIds = getFavoriteTemplateIds();

  return all.filter(tpl => {
    // Category check
    if (category && category !== 'all') {
      if (category === 'favorites') {
        if (!favoriteIds.includes(tpl.id)) return false;
      } else if (category === 'recent') {
        if (!recentIds.includes(tpl.id)) return false;
      } else if (category === 'custom') {
        if (!tpl.isCustom) return false;
      } else if (tpl.category !== category) {
        return false;
      }
    }

    // Language check
    if (languageFilter && languageFilter !== 'all') {
      if (tpl.language !== languageFilter) return false;
    }

    // Search query check
    if (!q) return true;

    const matchName = tpl.name.toLowerCase().includes(q);
    const matchNameBn = (tpl.nameBn || '').toLowerCase().includes(q);
    const matchDesc = (tpl.description || '').toLowerCase().includes(q);
    const matchDescBn = (tpl.descriptionBn || '').toLowerCase().includes(q);
    const matchTags = (tpl.tags || []).some(tag => tag.toLowerCase().includes(q));
    const matchPlaceholders = (tpl.placeholders || []).some(ph => ph.toLowerCase().includes(q));
    const matchCategory = (tpl.categoryName || '').toLowerCase().includes(q) || (tpl.categoryNameBn || '').toLowerCase().includes(q);

    return matchName || matchNameBn || matchDesc || matchDescBn || matchTags || matchPlaceholders || matchCategory;
  });
}

/**
 * Extracts placeholder tokens in format [TOKEN] or [ট্যাগ] from HTML string.
 */
export function extractPlaceholdersFromHtml(html: string): string[] {
  // Regex to match anything inside square brackets like [NAME], [তারিখ], [ORGANIZATION]
  const regex = /\[([^[\]\n<]+)\]/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const token = match[0].trim();
    if (!matches.includes(token) && token.length > 2 && token.length < 50) {
      matches.push(token);
    }
  }
  return matches;
}

/**
 * Replaces placeholders in document HTML with supplied user map values.
 */
export function replacePlaceholdersInHtml(
  html: string,
  replacements: Record<string, string>
): string {
  let result = html;
  for (const [token, value] of Object.entries(replacements)) {
    if (value && value.trim()) {
      // Escape brackets for global regex replacement
      const escaped = token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      result = result.replace(regex, value);
    }
  }
  return result;
}
