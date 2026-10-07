import { PageSettings } from './document';

export type TemplateCategory =
  | 'applications_letters'
  | 'personal_letters'
  | 'business_office'
  | 'education'
  | 'legal_official'
  | 'deed_dolil'
  | 'custom';

export type TemplateLanguage = 'bn' | 'en' | 'mixed';

export interface DocumentTemplate {
  id: string;
  name: string;
  nameBn?: string;
  category: TemplateCategory;
  categoryName: string;
  categoryNameBn: string;
  language: TemplateLanguage;
  description: string;
  descriptionBn?: string;
  contentHtml: string;
  pageSettings: PageSettings;
  placeholders: string[];
  version: string;
  lastUpdated: string;
  disclaimer?: string;
  isCustom?: boolean;
  isDeedOrLegal?: boolean;
  tags: string[];
}

export interface CategoryInfo {
  id: TemplateCategory | 'all' | 'favorites' | 'recent';
  label: string;
  labelBn: string;
  iconName: string;
  badgeCount?: number;
}
