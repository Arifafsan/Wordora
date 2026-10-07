/**
 * Built-In Template Library for LipiWord Mobile
 * 
 * Comprehensive collection of professional, educational, business,
 * official, legal and deed/dolil document drafting templates.
 */

import { DocumentTemplate } from '../types/template';
import { PageSettings } from '../types/document';

const LEGAL_DISCLAIMER = 'This is a general drafting template. Legal requirements may vary. Consult a qualified legal professional or relevant authority before using an official/legal document.';
const DEED_DISCLAIMER = 'This is a general drafting template for a deed/dolil. Stamp duty, registration rules, and local legal formalities vary under the Registration Act and relevant laws. Please obtain official government stamp papers and consult an authorized sub-registry/legal practitioner.';

const STANDARD_A4: PageSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  headerText: '',
  footerText: '',
  showPageNumber: true,
  pageNumberPosition: 'bottom-center',
  differentFirstPage: false
};

const LEGAL_PAGE: PageSettings = {
  paperSize: 'legal',
  orientation: 'portrait',
  margins: { top: 38.1, right: 25.4, bottom: 25.4, left: 30.0 }, // extra top for stamp space
  headerText: '',
  footerText: '',
  showPageNumber: true,
  pageNumberPosition: 'bottom-center',
  differentFirstPage: false
};

export const BUILT_IN_TEMPLATES: DocumentTemplate[] = [
  // ==========================================
  // A. APPLICATIONS & OFFICIAL LETTERS
  // ==========================================
  {
    id: 'app_general_application',
    name: 'General Application',
    nameBn: 'সাধারণ আবেদনপত্র',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Standard formal Bengali application layout for office, institution or authority requests.',
    descriptionBn: 'অফিস বা প্রতিষ্ঠানের যে কোনো সাধারণ বিষয়ে অনুমতি বা অনুরোধের প্রমিত আবেদনপত্র।',
    version: '2.1',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[কর্তৃপক্ষের পদবি]', '[প্রতিষ্ঠানের নাম]', '[ঠিকানা]', '[আবেদনের বিষয়]', '[মহোদয়/মহাত্মন]', '[আবেদনের মূল বক্তব্য]', '[আবেদনকারীর নাম]', '[পদবি/পরিচয়]', '[ফোন নম্বর]'],
    tags: ['আবেদন', 'application', 'official', 'দরখাস্ত', 'general', 'অনুরোধ'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[কর্তৃপক্ষের পদবি]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[ঠিকানা]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [আবেদনের বিষয়] এর জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[মহোদয়/মহাত্মন],</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, [আবেদনের মূল বক্তব্য]। এই প্রেক্ষিতে বিষয়টি গুরুত্বসহকারে বিবেচনা করে আপনার সদয় অনুমোদন কামনা করছি।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 20pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, বিনীত প্রার্থনা এই যে, উপরোক্ত বিষয়টি বিবেচনাপূর্বক প্রয়োজনীয় অনুমতি/ব্যবস্থা গ্রহণে আপনার বিশেষ মর্জি হয়।</span></p>
      <p style="margin-bottom: 4pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[আবেদনকারীর নাম]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">[পদবি/পরিচয়]</span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">মোবাইল: [ফোন নম্বর]</span></p>
    `
  },
  {
    id: 'app_leave_application',
    name: 'Leave Application',
    nameBn: 'ছুটির আবেদনপত্র',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Casual or medical leave application with substitute colleague handover details.',
    descriptionBn: 'অফিস বা কর্মক্ষেত্রে নৈমিত্তিক অথবা চিকিৎসাজনিত ছুটির জন্য প্রাতিষ্ঠানিক দরখাস্ত।',
    version: '2.1',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[মহাপরিচালক/বিভাগীয় প্রধান]', '[প্রতিষ্ঠান/দপ্তর]', '[ঠিকানা]', '[ছুটির কারণ]', '[ছুটি শুরুর তারিখ]', '[ছুটি শেষের তারিখ]', '[মোট দিন]', '[দায়িত্ব পালনকারী সহকর্মীর নাম]', '[আবেদনকারীর নাম]', '[পদবি ও বিভাগ]', '[ফোন নম্বর]'],
    tags: ['ছুটির আবেদন', 'leave application', 'ছুটি', 'অফিস', 'leave', 'casual leave'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[মহাপরিচালক/বিভাগীয় প্রধান]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[প্রতিষ্ঠান/দপ্তর]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[ঠিকানা]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [ছুটির কারণ]-এর জন্য ছুটির আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহোদয়,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">যথাবিহিত সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমার [ছুটির কারণ]-এর কারণে আগামী [ছুটি শুরুর তারিখ] হতে [ছুটি শেষের তারিখ] পর্যন্ত মোট [মোট দিন] দিনের নৈমিত্তিক ছুটি প্রয়োজন। আমার অনুপস্থিতিকালীন সময়ে অত্র দপ্তরের [দায়িত্ব পালনকারী সহকর্মীর নাম] আমার জরুরি দায়িত্বসমূহ পরিচালনা করবেন।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 20pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, প্রার্থনা এই যে, আমার উল্লিখিত দিনসমূহের ছুটি মঞ্জুর করতে মহোদয়ের সদয় মর্জি হয়।</span></p>
      <p style="margin-bottom: 4pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[আবেদনকারীর নাম]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">[পদবি ও বিভাগ]</span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">মোবাইল: [ফোন নম্বর]</span></p>
    `
  },
  {
    id: 'app_job_application_cover_letter',
    name: 'Job Application & Cover Letter',
    nameBn: 'চাকরির আবেদন ও কভার লেটার',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'mixed',
    description: 'Professional bilingual cover letter and job application with attached CV checklist.',
    descriptionBn: 'বিজ্ঞাপিত পদের অনুকূলে শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার বিবরণসহ চাকরির পূর্ণাঙ্গ আবেদনপত্র।',
    version: '2.1',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[নিয়োগকারী কর্মকর্তা]', '[কোম্পানি/প্রতিষ্ঠানের নাম]', '[অফিস ঠিকানা]', '[পদের নাম]', '[পত্রিকা/বিজ্ঞপ্তির সূত্র]', '[বিজ্ঞপ্তির তারিখ]', '[শিক্ষাগত যোগ্যতা ও ডিগ্রি]', '[অভিজ্ঞতার মেয়াদ ও ক্ষেত্র]', '[আবেদনকারীর নাম]', '[ফোন নম্বর]', '[ইমেইল]'],
    tags: ['চাকরির আবেদন', 'job application', 'cover letter', 'কভার লেটার', 'নিয়োগ', 'চাকরি'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[নিয়োগকারী কর্মকর্তা]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[কোম্পানি/প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[অফিস ঠিকানা]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: “[পদের নাম]” পদে নিয়োগের জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহোদয়,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদন এই যে, গত [বিজ্ঞপ্তির তারিখ] তারিখে [পত্রিকা/বিজ্ঞপ্তির সূত্র]-এ প্রকাশিত নিয়োগ বিজ্ঞপ্তির মাধ্যমে জানতে পারলাম আপনার সুনামধন্য প্রতিষ্ঠানে “[পদের নাম]” পদে কিছুসংখ্যক জনবল নিয়োগ করা হবে। আমি উক্ত পদের একজন যোগ্য ও আগ্রহী প্রার্থী হিসেবে নিজেকে উপস্থাপন করতে চাই।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">আমি [শিক্ষাগত যোগ্যতা ও ডিগ্রি] সম্পন্ন করেছি এবং বিগত [অভিজ্ঞতার মেয়াদ ও ক্ষেত্র]-এ অত্যন্ত সততা ও দক্ষতার সাথে দায়িত্ব পালন করেছি। কঠোর পরিশ্রম এবং দলীয় সমন্বয়ে কাজের মাধ্যমে আপনার প্রতিষ্ঠানের লক্ষ্য অর্জনে আমি সক্রিয় ভূমিকা পালন করতে পারব বলে দৃঢ়ভাবে বিশ্বাস করি।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 14pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, বিনীত নিবেদন এই যে, আমার শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার মূল্যায়নপূর্বক উক্ত পদে সাক্ষাৎকার গ্রহণের সুযোগ দিয়ে বাধিত করবেন।</span></p>
      <p style="margin-bottom: 4pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[আবেদনকারীর নাম]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">মোবাইল: [ফোন নম্বর] · ইমেইল: [ইমেইল]</span></p>
      <p style="margin-top: 10pt; font-size: 10pt; color: #64748b;"><strong>সংযুক্তি:</strong> ১. জীবনবৃত্তান্ত (CV) ২. সকল সনদপত্রের সত্যায়িত অনুলিপি ৩. সদ্য তোলা পাসপোর্ট সাইজ ছবি।</p>
    `
  },
  {
    id: 'app_school_leave',
    name: 'School / College Leave Application',
    nameBn: 'প্রধান শিক্ষক / অধ্যক্ষের নিকট ছুটির আবেদন',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Student leave application addressed to the Headmaster or Principal.',
    descriptionBn: 'বিদ্যালয় বা কলেজের প্রধান শিক্ষক/অধ্যক্ষের কাছে অনুপস্থিতি বা অগ্রিম ছুটির আবেদন।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[প্রধান শিক্ষক / অধ্যক্ষ]', '[শিক্ষা প্রতিষ্ঠানের নাম]', '[ঠিকানা]', '[ছুটির কারণ]', '[ছুটির দিনসমূহ]', '[মোট দিন]', '[শিক্ষার্থীর নাম]', '[শ্রেণি / বর্ষ]', '[রোল নম্বর]', '[শাখা/বিভাগ]'],
    tags: ['school application', 'college', 'ছুটির আবেদন', 'স্কুল', 'কলেজ', 'প্রধান শিক্ষক'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[প্রধান শিক্ষক / অধ্যক্ষ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[শিক্ষা প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[ঠিকানা]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [ছুটির কারণ]-এর জন্য ছুটির আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">জনাব,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, আমি আপনার বিদ্যালয়ের/কলেজের [শ্রেণি / বর্ষ]-এর একজন নিয়মিত শিক্ষার্থী। আমার [ছুটির কারণ]-এর কারণে আগামী [ছুটির দিনসমূহ] পর্যন্ত মোট [মোট দিন] দিন ক্লাসে উপস্থিত থাকতে পারব না।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 20pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, বিনীত প্রার্থনা এই যে, আমাকে উক্ত [মোট দিন] দিনের ছুটি মঞ্জুর করে বাধিত করবেন।</span></p>
      <p style="margin-bottom: 4pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">আপনার অনুগত ছাত্র/ছাত্রী,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[শিক্ষার্থীর নাম]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">শ্রেণি: [শ্রেণি / বর্ষ] · রোল: [রোল নম্বর] · শাখা: [শাখা/বিভাগ]</span></p>
    `
  },
  {
    id: 'app_permission_request',
    name: 'Permission Application',
    nameBn: 'অনুষ্ঠান বা কর্মকাণ্ডের অনুমতি আবেদন',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Application requesting official permission to host an event, seminar, or tournament.',
    descriptionBn: 'শিক্ষা প্রতিষ্ঠান বা প্রশাসনের নিকট কোনো ইভেন্ট, সেমিনার বা অনুষ্ঠান আয়োজনের অনুমতির আবেদন।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[কর্তৃপক্ষের পদবি]', '[প্রতিষ্ঠানের নাম]', '[অনুষ্ঠানের নাম]', '[অনুষ্ঠানের তারিখ]', '[স্থান]', '[আয়োজনকারীর নাম ও পরিচয়]', '[যোগাযোগ]'],
    tags: ['permission', 'অনুমতি', 'অনুষ্ঠান', 'সেমিনার', 'permission application'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, <strong>[কর্তৃপক্ষের পদবি]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [অনুষ্ঠানের নাম] আয়োজনের অনুমতির জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহোদয়,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, আমরা আগামী [অনুষ্ঠানের তারিখ] তারিখে [স্থান]-এ [অনুষ্ঠানের নাম] আয়োজন করার উদ্যোগ গ্রহণ করেছি। উক্ত অনুষ্ঠানে শিক্ষার্থী ও সুধীজনদের স্বতঃস্ফূর্ত অংশগ্রহণ থাকবে। অনুষ্ঠানটির সুষ্ঠু ও সুশৃঙ্খল সমাপ্তির জন্য কর্তৃপক্ষের সদয় অনুমতি ও সহযোগিতা প্রয়োজন।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, প্রার্থনা এই যে, উল্লিখিত অনুষ্ঠানটি সফলভাবে সম্পন্ন করার সদয় অনুমতি প্রদানে আপনার মর্জি হয়।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত, <strong>[আয়োজনকারীর নাম ও পরিচয়]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">যোগাযোগ: [যোগাযোগ]</span></p>
    `
  },
  {
    id: 'app_civic_complaint',
    name: 'Complaint Application',
    nameBn: 'নাগরিক সমস্যার অভিযোগ ও প্রতিকার আবেদন',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Complaint letter to local municipality, city corporation, or police authority.',
    descriptionBn: 'পৌরসভা, সিটি কর্পোরেশন বা প্রশাসনের কাছে রাস্তাঘাট, পয়ঃনিষ্কাশন বা সমস্যার প্রতিকার চেয়ে অভিযোগ।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[মেয়র / নির্বাহী কর্মকর্তা]', '[পৌরসভা / সিটি কর্পোরেশন]', '[সমস্যার বিষয়]', '[এলাকার নাম / ওয়ার্ড নং]', '[সমস্যার বিবরণ]', '[এলাকাবাসীর পক্ষে প্রতিনিধির নাম]', '[ফোন নম্বর]'],
    tags: ['complaint application', 'অভিযোগ', 'পৌরসভা', 'সিটি কর্পোরেশন', 'নাগরিক সমস্যা'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, <strong>[মেয়র / নির্বাহী কর্মকর্তা]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[পৌরসভা / সিটি কর্পোরেশন]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [এলাকার নাম / ওয়ার্ড নং]-এ [সমস্যার বিষয়] সমাধানের জন্য জরুরি আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">জনাব,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদন এই যে, আমরা [এলাকার নাম / ওয়ার্ড নং]-এর স্থায়ী বাসিন্দা। বিগত কিছুদিন যাবত আমাদের এলাকায় [সমস্যার বিবরণ]-এর কারণে সাধারণ জনগণ চরম দুর্ভোগের শিকার হচ্ছেন। এই বিষয়ে ইতিপূর্বে মৌখিকভাবে অবহিত করা হলেও অদ্যাবধি কোনো কার্যকর ব্যবস্থা গ্রহণ করা হয়নি।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, জনস্বার্থ বিবেচনা করে অতিসত্বর সরেজমিনে পরিদর্শনপূর্বক সমস্যাটির স্থায়ী সমাধানের ব্যবস্থা গ্রহণের জন্য আকুল আবেদন জানাচ্ছি।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">এলাকাবাসীর পক্ষে,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[এলাকাবাসীর পক্ষে প্রতিনিধির নাম]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">যোগাযোগ: [ফোন নম্বর]</span></p>
    `
  },
  {
    id: 'app_transfer_request',
    name: 'Transfer Application',
    nameBn: 'কর্মস্থল বদলির আবেদনপত্র',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Formal employee job station transfer request due to personal, health or family grounds.',
    descriptionBn: 'পারিবারিক বা স্বাস্থ্যগত কারণে পছন্দের কর্মস্থলে বদলির জন্য কর্তৃপক্ষের কাছে আবেদন।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[যথাযথ কর্তৃপক্ষ / সচিব]', '[মন্ত্রণালয় / অধিদপ্তর]', '[বর্তমান কর্মস্থল]', '[প্রার্থিত কর্মস্থল]', '[বদলির যৌক্তিক কারণ]', '[আবেদনকারীর নাম ও পদবি]', '[কর্মকর্তা পরিচিতি নম্বর]'],
    tags: ['transfer application', 'বদলি', 'কর্মস্থল বদলি', 'transfer', 'সরকারি চাকরি'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, <strong>[যথাযথ কর্তৃপক্ষ / সচিব]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[মন্ত্রণালয় / অধিদপ্তর]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: [বর্তমান কর্মস্থল] হতে [প্রার্থিত কর্মস্থল]-এ বদলির জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">মহোদয়,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">যথাবিহিত সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি [বর্তমান কর্মস্থল]-এ নিষ্ঠার সাথে দায়িত্ব পালন করে আসছি। সম্প্রতি [বদলির যৌক্তিক কারণ]-এর কারণে আমার পক্ষে বর্তমান স্থানে অবস্থান করে দায়িত্ব পালন করা অত্যন্ত দুরূহ হয়ে পড়েছে। এমতাবস্থায় আমাকে [প্রার্থিত কর্মস্থল]-এ শূন্য পদে বদলি করা হলে আমি সার্বক্ষণিক মনোযোগের সাথে দায়িত্ব পালন করতে সক্ষম হব।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, মানবিক দিক বিবেচনা করে আমাকে প্রার্থিত কর্মস্থলে বদলির আদেশ জারির সদয় মর্জি হয়।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক, <strong>[আবেদনকারীর নাম ও পদবি]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">পরিচিতি নং: [কর্মকর্তা পরিচিতি নম্বর]</span></p>
    `
  },
  {
    id: 'app_scholarship_aid',
    name: 'Scholarship / Financial Assistance',
    nameBn: 'বৃত্তি ও আর্থিক সহায়তার আবেদন',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Application for student stipends, poverty welfare funds or educational assistance.',
    descriptionBn: 'দরিদ্র ও মেধাবী শিক্ষার্থী কল্যাণ তহবিল থেকে এককালীন বা মাসিক বৃত্তির জন্য আবেদন।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[উপদেষ্টা / ডিন / অধ্যক্ষ]', '[শিক্ষা প্রতিষ্ঠানের নাম]', '[বিভাগ / শ্রেণি]', '[পারিবারিক আর্থিক অবস্থা]', '[আবেদনকারীর নাম]', '[রোল নম্বর]', '[জিপিএ/সিজিপিএ]'],
    tags: ['scholarship', 'financial assistance', 'বৃত্তি', 'আর্থিক অনুদান', 'stipend'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, <strong>[উপদেষ্টা / ডিন / অধ্যক্ষ]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[শিক্ষা প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: শিক্ষার্থী কল্যাণ তহবিল হতে আর্থিক সহায়তার জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">জনাব,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানের [বিভাগ / শ্রেণি]-এর একজন নিয়মিত ও মনযোগী শিক্ষার্থী। বিগত পরীক্ষায় আমি [জিপিএ/সিজিপিএ] অর্জন করেছি। সম্প্রতি [পারিবারিক আর্থিক অবস্থা]-এর কারণে আমার পরিবারের পক্ষে পড়াশোনার ব্যয়ভার বহন করা অসম্ভব হয়ে পড়েছে। আর্থিক সহযোগিতা না পেলে আমার শিক্ষাজীবন ব্যাহত হওয়ার আশঙ্কা রয়েছে।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, মানবিক দৃষ্টিকোণ থেকে বিবেচনাপূর্বক আমাকে শিক্ষার্থী কল্যাণ তহবিল হতে বিশেষ অনুদান মঞ্জুর করতে মর্জি হয়।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত শিক্ষার্থী, <strong>[আবেদনকারীর নাম]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">রোল/আইডি: [রোল নম্বর]</span></p>
    `
  },
  {
    id: 'app_character_certificate',
    name: 'Character Certificate Application',
    nameBn: 'চারিত্রিক সনদপত্রের আবেদন',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'bn',
    description: 'Request for issuance of testimonial or character certificate from school/college.',
    descriptionBn: 'শিক্ষা প্রতিষ্ঠান হতে চারিত্রিক প্রশংসাপত্র বা প্রত্যায়নপত্র গ্রহণের দরখাস্ত।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[প্রধান শিক্ষক / অধ্যক্ষ]', '[শিক্ষা প্রতিষ্ঠানের নাম]', '[পাসের সন ও বিভাগ]', '[প্রয়োজনের কারণ]', '[শিক্ষার্থীর নাম]', '[রোল ও রেজিস্ট্রেশন]'],
    tags: ['character certificate', 'চারিত্রিক সনদপত্র', 'প্রশংসাপত্র', 'certificate request'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, <strong>[প্রধান শিক্ষক / অধ্যক্ষ]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[শিক্ষা প্রতিষ্ঠানের নাম]</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: চারিত্রিক সনদপত্র প্রাপ্তির জন্য আবেদন।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">জনাব,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সবিনয় নিবেদন এই যে, আমি আপনার প্রতিষ্ঠান হতে [পাসের সন ও বিভাগ]-এ সফলভাবে উত্তীর্ণ হয়েছি। বর্তমানে [প্রয়োজনের কারণ]-এর জন্য আমার একটি চারিত্রিক সনদপত্র একান্ত প্রয়োজন। অধ্যায়নকালে আমি প্রতিষ্ঠানের সকল নিয়মকানুন যথাযথভাবে মেনে চলেছি।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, আমার অনুকূলে একটি চারিত্রিক সনদপত্র ইস্যু করার সদয় মর্জি হয়।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদক, <strong>[শিক্ষার্থীর নাম]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">রোল ও রেজি নং: [রোল ও রেজিস্ট্রেশন]</span></p>
    `
  },
  {
    id: 'app_office_notice',
    name: 'Official Notice',
    nameBn: 'দাপ্তরিক জরুরি নোটিশ',
    category: 'applications_letters',
    categoryName: 'Applications & Letters',
    categoryNameBn: 'আবেদন ও দাপ্তরিক চিঠি',
    language: 'mixed',
    description: 'Formal organizational notice template with official dispatch memo number and seal area.',
    descriptionBn: 'দপ্তরের কর্মকর্তা-কর্মচারীদের জন্য নির্দেশনামূলক অফিশিয়াল নোটিশ ফরম্যাট।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[প্রতিষ্ঠানের নাম]', '[দপ্তরের শাখা]', '[স্মারক নম্বর]', '[তারিখ]', '[নোটিশের শিরোনাম]', '[বিজ্ঞপ্তির মূল বিষয়বস্তু]', '[স্বাক্ষরকারীর নাম]', '[পদবি]'],
    tags: ['notice', 'নোটিশ', 'বিজ্ঞপ্তি', 'office notice', 'স্মারক'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; margin-bottom: 16pt;">
        <h2 style="font-size: 15pt; font-weight: bold; margin-bottom: 2pt; font-family: 'Noto Sans Bengali', sans-serif;">[প্রতিষ্ঠানের নাম]</h2>
        <p style="font-size: 10pt; color: #475569;">[দপ্তরের শাখা]</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 6pt; font-size: 9.5pt;">
          <span>স্মারক নং: [স্মারক নম্বর]</span>
          <span>তারিখ: [তারিখ]</span>
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 16pt;">
        <span style="font-size: 13pt; font-weight: bold; text-decoration: underline; background-color: #f1f5f9; padding: 4pt 16pt; border-radius: 4pt;">নোটিশ / NOTICE</span>
      </div>
      <p style="font-size: 11pt; font-weight: bold; margin-bottom: 8pt;">বিষয়: [নোটিশের শিরোনাম]</p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 14pt; font-size: 10.5pt;">
        এতদ্বারা সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, [বিজ্ঞপ্তির মূল বিষয়বস্তু]। উল্লিখিত নির্দেশনা অত্র দপ্তরের সকল কর্মকর্তা ও কর্মচারীকে কঠোরভাবে মেনে চলার জন্য নির্দেশ প্রদান করা হলো।
      </p>
      <p style="margin-top: 24pt; text-align: right; line-height: 1.4; font-size: 10pt;">
        <strong>[স্বাক্ষরকারীর নাম]</strong><br/>
        [পদবি]<br/>
        [প্রতিষ্ঠানের নাম]
      </p>
    `
  },

  // ==========================================
  // B. PERSONAL LETTERS
  // ==========================================
  {
    id: 'let_formal_letter_en',
    name: 'Formal English Letter',
    nameBn: 'ইংরেজি ফরমাল লেটার',
    category: 'personal_letters',
    categoryName: 'Personal Letters',
    categoryNameBn: 'ব্যক্তিগত ও আনুষ্ঠানিক পত্র',
    language: 'en',
    description: 'International standard block-format formal business and inquiry letter.',
    descriptionBn: 'আন্তর্জাতিক মানসম্মত ব্লক ফরম্যাট আনুষ্ঠানিক ইংরেজি চিঠি।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[SENDER_NAME]', '[SENDER_ADDRESS]', '[DATE]', '[RECIPIENT_NAME]', '[RECIPIENT_TITLE]', '[COMPANY_NAME]', '[COMPANY_ADDRESS]', '[SUBJECT]', '[SALUTATION]', '[BODY_PARAGRAPH_1]', '[BODY_PARAGRAPH_2]', '[PHONE]', '[EMAIL]'],
    tags: ['formal letter', 'english letter', 'inquiry', 'business letter', 'চিঠি'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5;">
        <p style="margin-bottom: 2pt;"><strong>[SENDER_NAME]</strong></p>
        <p style="margin-bottom: 12pt; color: #475569;">[SENDER_ADDRESS]</p>
        <p style="margin-bottom: 12pt;">[DATE]</p>
        <p style="margin-bottom: 2pt;">[RECIPIENT_NAME]</p>
        <p style="margin-bottom: 2pt;">[RECIPIENT_TITLE]</p>
        <p style="margin-bottom: 2pt;"><strong>[COMPANY_NAME]</strong></p>
        <p style="margin-bottom: 14pt;">[COMPANY_ADDRESS]</p>
        <p style="margin-bottom: 12pt; font-weight: bold; text-decoration: underline;">Subject: [SUBJECT]</p>
        <p style="margin-bottom: 10pt;">Dear [SALUTATION],</p>
        <p style="text-align: justify; margin-bottom: 10pt;">[BODY_PARAGRAPH_1]</p>
        <p style="text-align: justify; margin-bottom: 14pt;">[BODY_PARAGRAPH_2] Thank you for your consideration and time. I look forward to hearing from you at your earliest convenience.</p>
        <p style="margin-bottom: 20pt;">Sincerely,</p>
        <p style="margin-bottom: 2pt;"><strong>[SENDER_NAME]</strong></p>
        <p style="color: #64748b; font-size: 10pt;">Phone: [PHONE] · Email: [EMAIL]</p>
      </div>
    `
  },
  {
    id: 'let_invitation_letter',
    name: 'Invitation Letter',
    nameBn: 'আমন্ত্রণ ও নিমন্ত্রণপত্র',
    category: 'personal_letters',
    categoryName: 'Personal Letters',
    categoryNameBn: 'ব্যক্তিগত ও আনুষ্ঠানিক পত্র',
    language: 'bn',
    description: 'Polite invitation letter for wedding, family reception, or cultural event.',
    descriptionBn: 'বিবাহ, সংবর্ধনা বা বিশেষ পারিবারিক অনুষ্ঠানের মার্জিত আমন্ত্রণপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[সম্মানিত অতিথির নাম]', '[অনুষ্ঠানের নাম]', '[তারিখ ও সময়]', '[স্থান/ভেন্যু]', '[আমন্ত্রণকারীর নাম]', '[যোগাযোগের ফোন নম্বর]'],
    tags: ['invitation', 'আমন্ত্রণপত্র', 'নিমন্ত্রণ', 'দাওয়াত', 'wedding invitation'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; padding: 10pt 0;">
        <h2 style="font-family: 'Noto Serif Bengali', serif; color: #1e3a8a; font-size: 16pt; margin-bottom: 6pt;">আন্তরিক আমন্ত্রণপত্র</h2>
        <p style="font-size: 11pt; color: #475569; margin-bottom: 16pt;">বিসমিল্লাহির রাহমানির রাহিম</p>
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin-bottom: 16pt;" />
      </div>
      <p style="margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">শ্রদ্ধেয় <strong>[সম্মানিত অতিথির নাম]</strong>,</span></p>
      <p style="text-align: justify; line-height: 1.8; margin-bottom: 14pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">সালাম ও আন্তরিক প্রীতি জানবেন। মহান আল্লাহর অশেষ রহমতে আগামী <strong>[তারিখ ও সময়]</strong> আমাদের পরিবারের [অনুষ্ঠানের নাম] অনুষ্ঠানের আয়োজন করা হয়েছে। উক্ত আনন্দঘন মুহূর্তে আপনার সপরিবার উপস্থিতি আমাদের অনুষ্ঠানকে পূর্ণতা দান করবে এবং আমাদের আনন্দ বহুগুণে বৃদ্ধি করবে।</span></p>
      <div style="background-color: #f8fafc; border-left: 3px solid #3b82f6; padding: 10pt; margin: 14pt 0; text-align: left;">
        <p style="margin-bottom: 4pt; font-size: 10.5pt;"><strong>অনুষ্ঠানের স্থান:</strong> [স্থান/ভেন্যু]</p>
        <p style="margin-bottom: 0; font-size: 10.5pt;"><strong>সময়:</strong> [তারিখ ও সময়]</p>
      </div>
      <p style="text-align: right; margin-top: 24pt; line-height: 1.5;">
        <span style="font-size: 10pt; color: #64748b;">বিনীত প্রার্থনায়,</span><br/>
        <strong>[আমন্ত্রণকারীর নাম]</strong><br/>
        <span style="font-size: 9.5pt; color: #64748b;">ফোন: [যোগাযোগের ফোন নম্বর]</span>
      </p>
    `
  },
  {
    id: 'let_thank_you_letter',
    name: 'Thank You Letter',
    nameBn: 'কৃতজ্ঞতা ও ধন্যবাদ জ্ঞাপন পত্র',
    category: 'personal_letters',
    categoryName: 'Personal Letters',
    categoryNameBn: 'ব্যক্তিগত ও আনুষ্ঠানিক পত্র',
    language: 'mixed',
    description: 'Letter expressing deep gratitude for support, mentorship, or hospitality.',
    descriptionBn: 'সহযোগিতা, পরামর্শ বা আতিথেয়তার জন্য আন্তরিক ধন্যবাদ জ্ঞাপন পত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[DATE]', '[RECIPIENT_NAME]', '[RECIPIENT_TITLE_OR_RELATION]', '[SPECIFIC_ASSISTANCE]', '[SENDER_NAME]'],
    tags: ['thank you', 'কৃতজ্ঞতা', 'ধন্যবাদ', 'gratitude', 'letter'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 12pt;">Date: <strong>[DATE]</strong></p>
      <p style="margin-bottom: 4pt;">Dear <strong>[RECIPIENT_NAME]</strong>,</p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 12pt;">
        I am writing this letter to express my heartfelt gratitude and appreciation for your generous support regarding [SPECIFIC_ASSISTANCE]. Your timely advice and assistance made a profound difference, and I am truly grateful for your kindness.
      </p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;">
        Please accept my sincere thanks once again. I look forward to keeping in touch and wish you continued good health and success in all your endeavors.
      </p>
      <p style="margin-bottom: 2pt;">Warm regards,</p>
      <p><strong>[SENDER_NAME]</strong></p>
    `
  },
  {
    id: 'let_bank_request',
    name: 'Bank Statement / Cheque Book Request',
    nameBn: 'ব্যাংক স্টেটমেন্ট ও চেক বইয়ের অনুরোধ পত্র',
    category: 'personal_letters',
    categoryName: 'Personal Letters',
    categoryNameBn: 'ব্যক্তিগত ও আনুষ্ঠানিক পত্র',
    language: 'bn',
    description: 'Formal letter to bank branch manager for account statement or new cheque book.',
    descriptionBn: 'ব্যাংক হিসাব বিবরণী (Statement) অথবা নতুন চেক বই ইস্যু করার জন্য আবেদন।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[তারিখ]', '[ব্যাংকের নাম]', '[শাখা]', '[হিসাবধারীর নাম]', '[হিসাব নম্বর / Account No]', '[প্রার্থিত সময়কাল]', '[ফোন নম্বর]'],
    tags: ['bank letter', 'ব্যাংক স্টেটমেন্ট', 'চেক বই', 'bank request', 'আবেদন'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">তারিখ: <strong>[তারিখ]</strong></span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বরাবর, শাখা ব্যবস্থাপক</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[ব্যাংকের নাম]</strong></span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">[শাখা] শাখা</span></p>
      <p style="margin-bottom: 12pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 12pt;"><strong>বিষয়: ব্যাংক হিসাবের বিবরণী (Bank Statement) প্রদানের জন্য অনুরোধ।</strong></span></p>
      <p style="margin-bottom: 8pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">জনাব,</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">বিনীত নিবেদন এই যে, আমি আপনার শাখায় একটি সঞ্চয়ী/চলতি হিসাব পরিচালনা করে আসছি, যার হিসাব নম্বর: <strong>[হিসাব নম্বর / Account No]</strong>। আমার বিশেষ দাপ্তরিক/ব্যক্তিগত প্রয়োজনে বিগত [প্রার্থিত সময়কাল]-এর একটি সত্যায়িত ব্যাংক স্টেটমেন্ট প্রয়োজন।</span></p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">অতএব, আমার উল্লিখিত হিসাবের বিপরীতে নির্ধারিত সময়ের ব্যাংক স্টেটমেন্ট দ্রুত প্রদানের প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সুমর্জি হয়।</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;">হিসাবধারীর স্বাক্ষর,</span></p>
      <p style="margin-bottom: 2pt;"><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 11pt;"><strong>[হিসাবধারীর নাম]</strong></span></p>
      <p><span style="font-family: 'Noto Sans Bengali', sans-serif; font-size: 10pt; color: #475569;">মোবাইল: [ফোন নম্বর]</span></p>
    `
  },

  // ==========================================
  // C. BUSINESS & OFFICE
  // ==========================================
  {
    id: 'biz_office_memo',
    name: 'Office Memorandum',
    nameBn: 'দাপ্তরিক স্মারকপত্র (Memo)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Corporate and government internal memorandum layout with ref number and CC list.',
    descriptionBn: 'অভ্যন্তরীণ যোগাযোগের জন্য মেমোরেন্ডাম বা দাপ্তরিক মেমো ফরম্যাট।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[COMPANY_OR_ORG]', '[TO]', '[FROM]', '[DATE]', '[REF_NO]', '[SUBJECT]', '[MEMO_BODY]', '[SENDER_NAME]', '[CC_LIST]'],
    tags: ['memo', 'memorandum', 'স্মারক', 'office memo', 'business'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="border-bottom: 2px solid #1e3a8a; padding-bottom: 8pt; margin-bottom: 14pt;">
        <h1 style="color: #1e3a8a; font-size: 18pt; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;">MEMORANDUM</h1>
        <p style="color: #64748b; font-size: 10pt; margin: 2pt 0 0 0;"><strong>[COMPANY_OR_ORG]</strong></p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14pt; font-size: 10.5pt;">
        <tr><td style="padding: 4pt 0; width: 15%; font-weight: bold;">TO:</td><td style="padding: 4pt 0;">[TO]</td></tr>
        <tr><td style="padding: 4pt 0; font-weight: bold;">FROM:</td><td style="padding: 4pt 0;">[FROM]</td></tr>
        <tr><td style="padding: 4pt 0; font-weight: bold;">DATE:</td><td style="padding: 4pt 0;">[DATE]</td></tr>
        <tr><td style="padding: 4pt 0; font-weight: bold;">REF NO:</td><td style="padding: 4pt 0;">[REF_NO]</td></tr>
        <tr><td style="padding: 4pt 0; font-weight: bold; border-bottom: 1px solid #e2e8f0;">SUBJECT:</td><td style="padding: 4pt 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e3a8a;">[SUBJECT]</td></tr>
      </table>
      <div style="line-height: 1.6; text-align: justify; font-size: 11pt; margin-bottom: 18pt;">
        <p>[MEMO_BODY]</p>
      </div>
      <p style="margin-bottom: 20pt;"><strong>[SENDER_NAME]</strong></p>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8pt; font-size: 9.5pt; color: #64748b;">
        <p style="margin: 0;"><strong>CC:</strong> [CC_LIST]</p>
      </div>
    `
  },
  {
    id: 'biz_meeting_minutes',
    name: 'Meeting Minutes',
    nameBn: 'সভার কার্যবিবরণী (Meeting Minutes)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Structured minutes of meeting with attendees, agenda items, decisions, and action tables.',
    descriptionBn: 'সভার উপস্থিতি, আলোচ্যসূচি, সিদ্ধান্ত ও বাস্তবায়ন দায়িত্ব তালিকা সংবলিত কার্যবিবরণী।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[ORGANIZATION_NAME]', '[MEETING_TITLE]', '[DATE_AND_TIME]', '[LOCATION]', '[CHAIRPERSON]', '[ATTENDEES]', '[AGENDA_TOPIC_1]', '[DECISION_1]', '[ACTION_ITEM_1]', '[ASSIGNEE_1]', '[DEADLINE_1]'],
    tags: ['meeting minutes', 'কার্যবিবরণী', 'সভা', 'minutes', 'agenda', 'action items'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 15pt; color: #0f172a; margin: 0 0 4pt 0;"><strong>[ORGANIZATION_NAME]</strong></h2>
        <h3 style="font-size: 12pt; color: #475569; margin: 0;">MINUTES OF MEETING: [MEETING_TITLE]</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 10pt; background-color: #f8fafc;" border="1">
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1; width: 25%;"><strong>Date & Time:</strong></td><td style="padding: 6pt; border: 1px solid #cbd5e1;">[DATE_AND_TIME]</td></tr>
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1;"><strong>Location/Platform:</strong></td><td style="padding: 6pt; border: 1px solid #cbd5e1;">[LOCATION]</td></tr>
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1;"><strong>Chaired By:</strong></td><td style="padding: 6pt; border: 1px solid #cbd5e1;">[CHAIRPERSON]</td></tr>
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1;"><strong>Attendees:</strong></td><td style="padding: 6pt; border: 1px solid #cbd5e1;">[ATTENDEES]</td></tr>
      </table>
      <h4 style="color: #1e3a8a; margin: 12pt 0 6pt 0; font-size: 11pt;">1. Discussion & Decisions</h4>
      <p style="font-size: 10.5pt; line-height: 1.5; margin-bottom: 6pt;"><strong>Agenda 1: [AGENDA_TOPIC_1]</strong></p>
      <p style="font-size: 10.5pt; line-height: 1.5; margin-bottom: 12pt; text-align: justify;">[DECISION_1]</p>
      <h4 style="color: #1e3a8a; margin: 12pt 0 6pt 0; font-size: 11pt;">2. Action Item Matrix</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;" border="1">
        <thead>
          <tr style="background-color: #e2e8f0;">
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: left;">Action Item</th>
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: left; width: 25%;">Assigned To</th>
            <th style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center; width: 20%;">Target Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">[ACTION_ITEM_1]</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">[ASSIGNEE_1]</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">[DEADLINE_1]</td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: 'biz_invoice_tax',
    name: 'Standard Commercial Invoice',
    nameBn: 'বাণিজ্যিক ইনভয়েস ও বিল',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Itemized invoice format with quantity, rate, VAT/Tax calculation, and bank payment info.',
    descriptionBn: 'পণ্য বা সেবার বিবরণ, একক মূল্য, ভ্যাট এবং মোট বিল সংবলিত পেশাদার ইনভয়েস।',
    version: '2.1',
    lastUpdated: '2026-10-06',
    placeholders: ['[COMPANY_NAME]', '[COMPANY_ADDRESS]', '[INVOICE_NO]', '[INVOICE_DATE]', '[CLIENT_NAME]', '[CLIENT_ADDRESS]', '[ITEM_1_DESC]', '[QTY_1]', '[RATE_1]', '[AMOUNT_1]', '[SUBTOTAL]', '[TAX_VAT]', '[TOTAL_AMOUNT]', '[BANK_DETAILS]'],
    tags: ['invoice', 'বিল', 'ইনভয়েস', 'receipt', 'tax invoice', 'bill'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16pt;">
        <div>
          <h1 style="color: #1e3a8a; margin: 0; font-size: 20pt; font-family: 'Plus Jakarta Sans', sans-serif;">INVOICE</h1>
          <p style="font-size: 10pt; color: #64748b; margin: 2pt 0 0 0;"><strong>[COMPANY_NAME]</strong></p>
          <p style="font-size: 9.5pt; color: #64748b; margin: 0;">[COMPANY_ADDRESS]</p>
        </div>
        <div style="text-align: right; font-size: 10pt;">
          <p style="margin: 0;"><strong>Invoice #:</strong> [INVOICE_NO]</p>
          <p style="margin: 2pt 0 0 0;"><strong>Date:</strong> [INVOICE_DATE]</p>
        </div>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6pt; padding: 10pt; margin-bottom: 14pt; font-size: 10pt;">
        <p style="margin: 0 0 4pt 0; font-weight: bold; color: #1e3a8a;">Billed To:</p>
        <p style="margin: 0 0 2pt 0; font-weight: 600;">[CLIENT_NAME]</p>
        <p style="margin: 0; color: #475569;">[CLIENT_ADDRESS]</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 12pt;" border="1">
        <thead>
          <tr style="background-color: #1e3a8a; color: white;">
            <th style="padding: 6pt; border: 1px solid #1e3a8a; text-align: left;">Description</th>
            <th style="padding: 6pt; border: 1px solid #1e3a8a; text-align: center; width: 12%;">Qty</th>
            <th style="padding: 6pt; border: 1px solid #1e3a8a; text-align: right; width: 18%;">Unit Rate (৳)</th>
            <th style="padding: 6pt; border: 1px solid #1e3a8a; text-align: right; width: 20%;">Total (৳)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6pt; border: 1px solid #cbd5e1;">[ITEM_1_DESC]</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: center;">[QTY_1]</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">[RATE_1]</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">[AMOUNT_1]</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">৳ [SUBTOTAL]</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">VAT / Tax:</td>
            <td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">৳ [TAX_VAT]</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="3" style="padding: 7pt; border: 1px solid #cbd5e1; text-align: right; color: #1e3a8a;">Grand Total:</td>
            <td style="padding: 7pt; border: 1px solid #cbd5e1; text-align: right; color: #1e3a8a;">৳ [TOTAL_AMOUNT]</td>
          </tr>
        </tbody>
      </table>
      <div style="font-size: 9.5pt; color: #64748b; margin-top: 14pt;">
        <p style="margin: 0 0 2pt 0;"><strong>Payment Terms:</strong> Bank Wire / Cheque / MFS</p>
        <p style="margin: 0;"><strong>Account Info:</strong> [BANK_DETAILS]</p>
      </div>
    `
  },
  {
    id: 'biz_money_receipt',
    name: 'Money Receipt',
    nameBn: 'টাকা প্রাপ্তি রসিদ (Money Receipt)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Official money receipt format with received amount in words and payment mode.',
    descriptionBn: 'অর্থ প্রাপ্তির নিশ্চিতকরণ রসিদ, কথায় অংক ও মাধ্যম সংবলিত ফরম্যাট।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[ORGANIZATION_NAME]', '[RECEIPT_NO]', '[DATE]', '[RECEIVED_FROM]', '[AMOUNT_IN_DIGITS]', '[AMOUNT_IN_WORDS]', '[PURPOSE_OR_AGAINST]', '[PAYMENT_MODE_CASH_CHEQUE]', '[AUTHORIZED_SIGNATORY]'],
    tags: ['money receipt', 'টাকা প্রাপ্তি রসিদ', 'রসিদ', 'voucher', 'receipt'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="border: 2px solid #0f172a; padding: 16pt; border-radius: 8pt; margin: 10pt 0;">
        <div style="text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 8pt; margin-bottom: 12pt;">
          <h2 style="margin: 0; font-size: 16pt; color: #0f172a;"><strong>[ORGANIZATION_NAME]</strong></h2>
          <span style="display: inline-block; background-color: #0f172a; color: white; padding: 2pt 12pt; border-radius: 12pt; font-size: 10pt; font-weight: bold; margin-top: 4pt;">MONEY RECEIPT / টাকা প্রাপ্তি রসিদ</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 12pt;">
          <span><strong>Receipt No:</strong> [RECEIPT_NO]</span>
          <span><strong>Date:</strong> [DATE]</span>
        </div>
        <div style="line-height: 2.0; font-size: 11pt;">
          <p style="margin: 0;">Received with thanks from: <strong>[RECEIVED_FROM]</strong></p>
          <p style="margin: 0;">The sum of Taka (in figures): <strong style="border: 1px solid #94a3b8; padding: 2pt 8pt; background-color: #f8fafc;">৳ [AMOUNT_IN_DIGITS]</strong></p>
          <p style="margin: 0;">In words: <strong>[AMOUNT_IN_WORDS]</strong></p>
          <p style="margin: 0;">On account of / Against: <strong>[PURPOSE_OR_AGAINST]</strong></p>
          <p style="margin: 0;">Payment Mode: <strong>[PAYMENT_MODE_CASH_CHEQUE]</strong></p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 28pt; font-size: 10pt;">
          <div style="border-top: 1px dotted #94a3b8; padding-top: 4pt; width: 35%; text-align: center;">Payer's Signature</div>
          <div style="border-top: 1px dotted #94a3b8; padding-top: 4pt; width: 40%; text-align: center;"><strong>[AUTHORIZED_SIGNATORY]</strong><br/>Authorized Seal & Signature</div>
        </div>
      </div>
    `
  },
  {
    id: 'biz_appointment_letter',
    name: 'Employment Appointment Letter',
    nameBn: 'নিয়োগপত্র (Appointment Letter)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Formal corporate employment appointment letter detailing designation, remuneration, and joining date.',
    descriptionBn: 'পদবি, বেতন ভাতা ও যোগদানের শর্তাবলি উল্লেখপূর্বক অফিশিয়াল নিয়োগপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[DATE]', '[CANDIDATE_NAME]', '[CANDIDATE_ADDRESS]', '[DESIGNATION]', '[DEPARTMENT]', '[JOINING_DATE]', '[MONTHLY_SALARY]', '[PROBATION_PERIOD]', '[COMPANY_NAME]', '[AUTHORIZED_SIGNATORY]'],
    tags: ['appointment letter', 'নিয়োগপত্র', 'job offer', 'employment', 'চাকরি'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;">Date: <strong>[DATE]</strong></p>
      <p style="margin-bottom: 2pt;">To,</p>
      <p style="margin-bottom: 2pt;"><strong>[CANDIDATE_NAME]</strong></p>
      <p style="margin-bottom: 14pt; color: #475569;">[CANDIDATE_ADDRESS]</p>
      <p style="margin-bottom: 12pt; font-weight: bold; font-size: 12pt; color: #1e3a8a;">Subject: Letter of Appointment for the position of “[DESIGNATION]”</p>
      <p style="margin-bottom: 8pt;">Dear [CANDIDATE_NAME],</p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;">
        We are pleased to offer you employment with <strong>[COMPANY_NAME]</strong> as <strong>[DESIGNATION]</strong> in the <strong>[DEPARTMENT]</strong> department, effective from your joining date on <strong>[JOINING_DATE]</strong>.
      </p>
      <div style="background-color: #f8fafc; border-left: 3px solid #1e3a8a; padding: 10pt; margin-bottom: 12pt; font-size: 10.5pt;">
        <p style="margin: 0 0 4pt 0;"><strong>1. Remuneration:</strong> Total Gross Monthly Salary of ৳ [MONTHLY_SALARY].</p>
        <p style="margin: 0 0 4pt 0;"><strong>2. Probation:</strong> You will be on probation for [PROBATION_PERIOD] months.</p>
        <p style="margin: 0;"><strong>3. Place of Work:</strong> Head Office, [COMPANY_NAME].</p>
      </div>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;">
        Please sign and return the duplicate copy of this letter as a token of your acceptance. We look forward to welcoming you to our team.
      </p>
      <p style="margin-bottom: 2pt;">Yours sincerely,</p>
      <p style="margin-bottom: 2pt;"><strong>[AUTHORIZED_SIGNATORY]</strong></p>
      <p style="color: #64748b; font-size: 10pt;">[COMPANY_NAME]</p>
    `
  },
  {
    id: 'biz_resignation_letter',
    name: 'Resignation Letter',
    nameBn: 'চাকরি হতে ইস্তফাপত্র (Resignation)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Polite and professional resignation letter with notice period and transition handover offer.',
    descriptionBn: 'নোটিশ পিরিয়ড ও দায়িত্ব হস্তান্তরের প্রতিশ্রুতিসহ চাকরি হতে পদত্যাগপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[DATE]', '[MANAGER_NAME]', '[DESIGNATION_MANAGER]', '[COMPANY_NAME]', '[EMPLOYEE_DESIGNATION]', '[LAST_WORKING_DATE]', '[EMPLOYEE_NAME]'],
    tags: ['resignation', 'ইস্তফাপত্র', 'পদত্যাগ', 'resignation letter', 'job'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <p style="margin-bottom: 6pt;">Date: <strong>[DATE]</strong></p>
      <p style="margin-bottom: 2pt;">To,</p>
      <p style="margin-bottom: 2pt;"><strong>[MANAGER_NAME]</strong></p>
      <p style="margin-bottom: 2pt;">[DESIGNATION_MANAGER]</p>
      <p style="margin-bottom: 12pt;">[COMPANY_NAME]</p>
      <p style="margin-bottom: 12pt; font-weight: bold; font-size: 11.5pt;">Subject: Resignation from the position of [EMPLOYEE_DESIGNATION]</p>
      <p style="margin-bottom: 8pt;">Dear [MANAGER_NAME],</p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;">
        Please accept this letter as formal notification that I am resigning from my position as <strong>[EMPLOYEE_DESIGNATION]</strong> at [COMPANY_NAME]. In accordance with my notice period, my last working day will be <strong>[LAST_WORKING_DATE]</strong>.
      </p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt;">
        I would like to thank you for the opportunities I have had during my tenure with the company. I have enjoyed working with the team and appreciate the support provided to me during my time here.
      </p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 18pt;">
        During the remaining period, I will do everything possible to wrap up my duties and complete a seamless handover to my successor.
      </p>
      <p style="margin-bottom: 2pt;">Sincerely,</p>
      <p style="margin-bottom: 2pt;"><strong>[EMPLOYEE_NAME]</strong></p>
      <p style="color: #64748b; font-size: 10pt;">[EMPLOYEE_DESIGNATION]</p>
    `
  },
  {
    id: 'biz_salary_certificate',
    name: 'Salary Certificate',
    nameBn: 'বেতন প্রত্যয়নপত্র (Salary Certificate)',
    category: 'business_office',
    categoryName: 'Business & Office',
    categoryNameBn: 'ব্যবসা ও অফিসিয়াল ডকুমেন্টস',
    language: 'mixed',
    description: 'Official corporate salary certificate for bank loans, credit cards, or visa applications.',
    descriptionBn: 'ব্যাংক লোন, ক্রেডিট কার্ড বা ভিসার জন্য প্রতিষ্ঠান প্রদত্ত বেতন প্রত্যয়নপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[COMPANY_NAME]', '[DATE]', '[REF_NO]', '[EMPLOYEE_NAME]', '[DESIGNATION]', '[JOINING_DATE]', '[BASIC_SALARY]', '[HOUSE_RENT]', '[MEDICAL_ALLOWANCE]', '[TOTAL_GROSS_SALARY]', '[AUTHORIZED_SIGNATORY]'],
    tags: ['salary certificate', 'বেতন প্রত্যয়নপত্র', 'বেতন', 'salary', 'income certificate'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; margin-bottom: 16pt;">
        <h2 style="font-size: 16pt; margin: 0; color: #1e3a8a;"><strong>[COMPANY_NAME]</strong></h2>
        <p style="font-size: 9.5pt; color: #64748b; margin: 2pt 0 10pt 0;">Human Resources Division</p>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 6pt; font-size: 9.5pt;">
          <span>Ref: [REF_NO]</span>
          <span>Date: [DATE]</span>
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 16pt;">
        <h3 style="font-size: 13pt; text-decoration: underline; margin: 0;">TO WHOM IT MAY CONCERN</h3>
      </div>
      <p style="text-align: justify; line-height: 1.7; font-size: 10.5pt; margin-bottom: 12pt;">
        This is to certify that <strong>[EMPLOYEE_NAME]</strong> is a confirmed full-time employee of [COMPANY_NAME], currently serving as <strong>[DESIGNATION]</strong> since <strong>[JOINING_DATE]</strong>.
      </p>
      <p style="font-size: 10.5pt; margin-bottom: 8pt;">His/Her monthly remuneration breakdown is as follows:</p>
      <table style="width: 80%; border-collapse: collapse; margin: 0 auto 16pt auto; font-size: 10pt;" border="1">
        <tr style="background-color: #f1f5f9;"><td style="padding: 6pt; border: 1px solid #cbd5e1;">Basic Salary</td><td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">৳ [BASIC_SALARY]</td></tr>
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1;">House Rent Allowance</td><td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">৳ [HOUSE_RENT]</td></tr>
        <tr><td style="padding: 6pt; border: 1px solid #cbd5e1;">Medical & Conveyance</td><td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right;">৳ [MEDICAL_ALLOWANCE]</td></tr>
        <tr style="background-color: #f8fafc; font-weight: bold;"><td style="padding: 6pt; border: 1px solid #cbd5e1;">Total Gross Monthly</td><td style="padding: 6pt; border: 1px solid #cbd5e1; text-align: right; color: #1e3a8a;">৳ [TOTAL_GROSS_SALARY]</td></tr>
      </table>
      <p style="text-align: justify; line-height: 1.6; font-size: 10pt; color: #475569; margin-bottom: 24pt;">
        This certificate is issued upon the request of the employee for banking/official verification purposes without any financial liability on the part of this company.
      </p>
      <p style="text-align: right; font-size: 10pt; line-height: 1.4;">
        <strong>[AUTHORIZED_SIGNATORY]</strong><br/>
        Head of Human Resources<br/>
        [COMPANY_NAME]
      </p>
    `
  },

  // ==========================================
  // D. EDUCATION
  // ==========================================
  {
    id: 'edu_assignment_cover',
    name: 'Assignment Cover Page',
    nameBn: 'অ্যাসাইনমেন্ট কভার পেজ',
    category: 'education',
    categoryName: 'Education',
    categoryNameBn: 'শিক্ষা সংক্রান্ত',
    language: 'mixed',
    description: 'Elegant academic assignment cover page with institution crest area and student submission table.',
    descriptionBn: 'বিশ্ববিদ্যালয় বা কলেজের অ্যাসাইনমেন্ট জমার জন্য নান্দনিক কভার পেজ।',
    version: '2.1',
    lastUpdated: '2026-10-06',
    placeholders: ['[INSTITUTION_NAME]', '[FACULTY_OR_DEPARTMENT]', '[ASSIGNMENT_TITLE]', '[COURSE_TITLE]', '[COURSE_CODE]', '[STUDENT_NAME]', '[STUDENT_ID]', '[BATCH_SEMESTER]', '[TEACHER_NAME]', '[TEACHER_DESIGNATION]', '[SUBMISSION_DATE]'],
    tags: ['assignment', 'cover page', 'কভার পেজ', 'অ্যাসাইনমেন্ট', 'university', 'college'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="border: 3px double #1e3a8a; padding: 24pt; min-height: 90%; text-align: center; box-sizing: border-box;">
        <h1 style="color: #1e3a8a; font-size: 18pt; margin: 0 0 4pt 0; font-family: 'Plus Jakarta Sans', sans-serif;">[INSTITUTION_NAME]</h1>
        <p style="font-size: 11pt; color: #475569; margin: 0 0 20pt 0;">[FACULTY_OR_DEPARTMENT]</p>
        <div style="margin: 30pt 0 24pt 0;">
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10.5pt; color: #64748b; margin: 0 0 6pt 0;">Assignment On</p>
          <h2 style="font-size: 16pt; color: #0f172a; border-bottom: 2px solid #1e3a8a; display: inline-block; padding-bottom: 4pt; margin: 0;">“[ASSIGNMENT_TITLE]”</h2>
          <p style="margin-top: 10pt; font-size: 11pt;">Course: <strong>[COURSE_TITLE]</strong> (Code: [COURSE_CODE])</p>
        </div>
        <div style="display: flex; justify-content: space-between; text-align: left; margin-top: 50pt; font-size: 10.5pt; gap: 20pt;">
          <div style="border: 1px solid #cbd5e1; padding: 10pt; border-radius: 6pt; width: 48%; background-color: #f8fafc;">
            <p style="margin: 0 0 6pt 0; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 2pt;">Submitted By:</p>
            <p style="margin: 0 0 2pt 0;"><strong>Name:</strong> [STUDENT_NAME]</p>
            <p style="margin: 0 0 2pt 0;"><strong>ID:</strong> [STUDENT_ID]</p>
            <p style="margin: 0;"><strong>Batch:</strong> [BATCH_SEMESTER]</p>
          </div>
          <div style="border: 1px solid #cbd5e1; padding: 10pt; border-radius: 6pt; width: 48%; background-color: #f8fafc;">
            <p style="margin: 0 0 6pt 0; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 2pt;">Submitted To:</p>
            <p style="margin: 0 0 2pt 0;"><strong>[TEACHER_NAME]</strong></p>
            <p style="margin: 0 0 2pt 0;">[TEACHER_DESIGNATION]</p>
            <p style="margin: 0;">[FACULTY_OR_DEPARTMENT]</p>
          </div>
        </div>
        <p style="margin-top: 40pt; font-size: 10pt; color: #64748b;"><strong>Date of Submission:</strong> [SUBMISSION_DATE]</p>
      </div>
    `
  },
  {
    id: 'edu_matrimonial_biodata',
    name: 'Matrimonial Biodata',
    nameBn: 'বিবাহের জীবনবৃত্তান্ত (Bio-Data)',
    category: 'education',
    categoryName: 'Education',
    categoryNameBn: 'শিক্ষা সংক্রান্ত',
    language: 'bn',
    description: 'Comprehensive family and education matrimonial biodata layout.',
    descriptionBn: 'পাত্র বা পাত্রীর শিক্ষাগত যোগ্যতা, পেশা ও পারিবারিক তথ্যের পূর্ণাঙ্গ বায়োডাটা।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[পূর্ণ নাম]', '[জন্ম তারিখ ও বয়স]', '[উচ্চতা ও গায়ের রঙ]', '[শিক্ষাগত যোগ্যতা]', '[বর্তমান পেশা ও কর্মস্থল]', '[পিতার নাম ও পেশা]', '[মাতার নাম ও পেশা]', '[ভাই-বোনের বিবরণ]', '[স্থায়ী ঠিকানা]', '[বর্তমান ঠিকানা]', '[যোগাযোগের নম্বর]'],
    tags: ['biodata', 'বায়োডাটা', 'জীবনবৃত্তান্ত', 'matrimonial', 'পাত্র', 'পাত্রী'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; margin-bottom: 14pt;">
        <p style="font-size: 11pt; color: #64748b; margin: 0 0 4pt 0;">বিসমিল্লাহির রাহমানির রাহিম</p>
        <h2 style="font-size: 16pt; color: #1e3a8a; margin: 0; font-family: 'Noto Serif Bengali', serif;">জীবনবৃত্তান্ত (Bio-Data)</h2>
        <hr style="border: none; border-top: 1.5px solid #1e3a8a; width: 60%; margin: 6pt auto 0 auto;" />
      </div>
      <h3 style="color: #1e3a8a; font-size: 12pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3pt; margin-bottom: 8pt;">১. ব্যক্তিগত তথ্য</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 12pt;">
        <tr><td style="padding: 4pt; width: 35%; font-weight: bold;">নাম:</td><td style="padding: 4pt;">[পূর্ণ নাম]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">জন্ম তারিখ ও বয়স:</td><td style="padding: 4pt;">[জন্ম তারিখ ও বয়স]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">উচ্চতা ও শারীরিক গঠন:</td><td style="padding: 4pt;">[উচ্চতা ও গায়ের রঙ]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">শিক্ষাগত যোগ্যতা:</td><td style="padding: 4pt;">[শিক্ষাগত যোগ্যতা]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">বর্তমান পেশা:</td><td style="padding: 4pt;">[বর্তমান পেশা ও কর্মস্থল]</td></tr>
      </table>
      <h3 style="color: #1e3a8a; font-size: 12pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3pt; margin-bottom: 8pt;">২. পারিবারিক পরিচিতি</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 12pt;">
        <tr><td style="padding: 4pt; width: 35%; font-weight: bold;">পিতার নাম ও পেশা:</td><td style="padding: 4pt;">[পিতার নাম ও পেশা]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">মাতার নাম ও পেশা:</td><td style="padding: 4pt;">[মাতার নাম ও পেশা]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">ভাই-বোন:</td><td style="padding: 4pt;">[ভাই-বোনের বিবরণ]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">স্থায়ী ঠিকানা:</td><td style="padding: 4pt;">[স্থায়ী ঠিকানা]</td></tr>
        <tr><td style="padding: 4pt; font-weight: bold;">বর্তমান ঠিকানা:</td><td style="padding: 4pt;">[বর্তমান ঠিকানা]</td></tr>
      </table>
      <p style="margin-top: 16pt; font-size: 10.5pt; text-align: right;"><strong>যোগাযোগের নম্বর:</strong> [যোগাযোগের নম্বর]</p>
    `
  },

  // ==========================================
  // E. BANGLADESH-STYLE OFFICIAL / LEGAL DOCUMENTS
  // ==========================================
  {
    id: 'leg_general_agreement',
    name: 'General Agreement / চুক্তিপত্র',
    nameBn: 'সাধারণ দ্বিপাক্ষিক চুক্তিপত্র',
    category: 'legal_official',
    categoryName: 'Legal & Official Documents',
    categoryNameBn: 'অফিসিয়াল ও আইনগত খসড়া',
    language: 'bn',
    description: 'Standard bilateral agreement format specifying 1st party, 2nd party, terms, and witness signatures.',
    descriptionBn: 'প্রথম পক্ষ ও দ্বিতীয় পক্ষের মধ্যকার শর্তাবলি এবং সাক্ষী সংবলিত সাধারণ দ্বিপাক্ষিক চুক্তি।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: LEGAL_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[১ম পক্ষের নাম ও ঠিকানা]', '[২য় পক্ষের নাম ও ঠিকানা]', '[চুক্তির বিষয়বস্তু]', '[শর্ত ১]', '[শর্ত ২]', '[শর্ত ৩]', '[চুক্তির মেয়াদ ও তারিখ]', '[সাক্ষী ১]', '[সাক্ষী ২]'],
    tags: ['agreement', 'চুক্তি', 'চুক্তিপত্র', 'দ্বিপাক্ষিক চুক্তি', 'contract', 'legal'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 6pt 10pt; border-radius: 6pt; margin-bottom: 12pt; font-size: 9pt; color: #92400e;">
        <strong>বিজ্ঞপ্তি:</strong> এটি একটি সাধারণ খসড়া ফরম্যাট। আইনগত প্রয়োজনীয়তা ভিন্ন হতে পারে। ব্যবহার পূর্বে বিজ্ঞ আইনজীবী বা সংশ্লিষ্ট কর্তৃপক্ষের পরামর্শ নিন।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">দ্বিপাক্ষিক সাধারণ চুক্তিপত্র</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt; font-size: 10.5pt;">
        <strong>১ম পক্ষ:</strong> [১ম পক্ষের নাম ও ঠিকানা], জাতীয় পরিচয়পত্র নং: ____________ (অত্র চুক্তিতে ১ম পক্ষ হিসেবে গণ্য হইবেন)।
      </p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 12pt; font-size: 10.5pt;">
        <strong>২য় পক্ষ:</strong> [২য় পক্ষের নাম ও ঠিকানা], জাতীয় পরিচয়পত্র নং: ____________ (অত্র চুক্তিতে ২য় পক্ষ হিসেবে গণ্য হইবেন)।
      </p>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 10pt; font-size: 10.5pt;">
        যেহেতু উভয় পক্ষ স্বেচ্ছায়, সুস্থ মস্তিষ্কে এবং কোনো প্রকার চাপ প্রয়োগ ব্যতীত <strong>[চুক্তির বিষয়বস্তু]</strong> সংক্রান্ত বিষয়ে নিম্নলিখিত শর্তাবলিতে একমত হইয়া অত্র চুক্তিনামা সম্পাদন করিলেন:
      </p>
      <ol style="line-height: 1.6; font-size: 10.5pt; padding-left: 18pt; margin-bottom: 16pt;">
        <li style="margin-bottom: 6pt;">[শর্ত ১]</li>
        <li style="margin-bottom: 6pt;">[শর্ত ২]</li>
        <li style="margin-bottom: 6pt;">[শর্ত ৩]</li>
        <li style="margin-bottom: 6pt;">অত্র চুক্তি স্বাক্ষরের তারিখ হইতে [চুক্তির মেয়াদ ও তারিখ] পর্যন্ত কার্যকর থাকিবে।</li>
      </ol>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 24pt; font-size: 10.5pt;">
        এতদর্থে সুস্থ শরীরে, সজ্ঞানে, অন্যের বিনা প্ররোচনায় আমরা উভয় পক্ষ অত্র চুক্তির মর্ম অবগত হইয়া নিম্নে স্বাক্ষর প্রদান করিলাম।
      </p>
      <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 30pt;">
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">১ম পক্ষের স্বাক্ষর</div>
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">২য় পক্ষের স্বাক্ষর</div>
      </div>
      <div style="margin-top: 24pt; font-size: 9.5pt; color: #475569;">
        <p><strong>স্বাক্ষীগণের স্বাক্ষর:</strong> ১. [সাক্ষী ১] · ২. [সাক্ষী ২]</p>
      </div>
    `
  },
  {
    id: 'leg_affidavit_format',
    name: 'Affidavit-Style Draft / হলফনামা',
    nameBn: 'সাধারণ হলফনামা খসড়া (Affidavit)',
    category: 'legal_official',
    categoryName: 'Legal & Official Documents',
    categoryNameBn: 'অফিসিয়াল ও আইনগত খসড়া',
    language: 'bn',
    description: 'Sworn legal affidavit drafting layout before a Notary Public or Magistrate.',
    descriptionBn: 'নোটারি পাবলিক বা প্রথম শ্রেণির ম্যাজিস্ট্রেটের সম্মুখে শপথপূর্বক ঘোষণামূলক হলফনামার খসড়া।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: LEGAL_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[হলফকারীর নাম]', '[পিতা/স্বামীর নাম]', '[ঠিকানা]', '[জাতীয় পরিচয়পত্র নম্বর]', '[ধর্ম ও পেশা]', '[বয়স]', '[হলফকৃত বিবরণ ১]', '[হলফকৃত বিবরণ ২]', '[তারিখ]', '[স্থান]'],
    tags: ['affidavit', 'হলফনামা', 'নোটারি', 'notary', 'legal', 'শপথ'],
    pageSettings: LEGAL_PAGE,
    contentHtml: `
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 6pt 10pt; border-radius: 6pt; margin-bottom: 12pt; font-size: 9pt; color: #92400e;">
        <strong>আইনগত সতর্কতা:</strong> এটি একটি সাধারণ খসড়া ফরম্যাট। আদালতের আনুষ্ঠানিকতার জন্য নির্ধারিত নন-জুডিশিয়াল স্ট্যাম্প ও নোটারি পাবলিক/ম্যাজিস্ট্রেটের সত্যায়ন আবশ্যক।
      </div>
      <div style="text-align: center; margin-bottom: 16pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">হলফনামা (AFFIDAVIT)</h2>
        <p style="font-size: 10pt; color: #475569; margin: 2pt 0 0 0;">(বিজ্ঞ নোটারি পাবলিক / এক্সিকিউটিভ ম্যাজিস্ট্রেট মহোদয়ের কার্যালয়, বাংলাদেশ)</p>
      </div>
      <p style="text-align: justify; line-height: 1.7; font-size: 10.5pt; margin-bottom: 12pt;">
        আমি, <strong>[হলফকারীর নাম]</strong>, পিতা/স্বামী: [পিতা/স্বামীর নাম], মাতা: _____________, ঠিকানা: [ঠিকানা], জাতীয় পরিচয়পত্র নং: [জাতীয় পরিচয়পত্র নম্বর], ধর্ম: [ধর্ম ও পেশা], বয়স: আনুমানিক [বয়স] বছর, পেশা: _____________, জাতীয়তা: জন্মসূত্রে বাংলাদেশি— এই মর্মে শপথপূর্বক সজ্ঞানে ঘোষণা করিতেছি যে:
      </p>
      <ol style="line-height: 1.7; font-size: 10.5pt; padding-left: 18pt; margin-bottom: 16pt;">
        <li style="margin-bottom: 6pt;">আমি বাংলাদেশের একজন স্থায়ী ও আইনানুগ নাগরিক।</li>
        <li style="margin-bottom: 6pt;">[হলফকৃত বিবরণ ১]</li>
        <li style="margin-bottom: 6pt;">[হলফকৃত বিবরণ ২]</li>
        <li style="margin-bottom: 6pt;">আমার উল্লেখিত বক্তব্য সম্পূর্ণরূপে সত্য এবং কোনো তথ্য গোপন করা হয় নাই। যদি ভবিষ্যতে কোনো তথ্য মিথ্যা প্রমাণিত হয় তবে আমি প্রচলিত আইনে দায়ী থাকিব।</li>
      </ol>
      <p style="text-align: justify; line-height: 1.6; margin-bottom: 24pt; font-size: 10.5pt;">
        উল্লিখিত সকল বিবরণ আমার জ্ঞান ও বিশ্বাসমতে সত্য জানিয়া অদ্য <strong>[তারিখ]</strong> তারিখে [স্থান]-এ বিজ্ঞ নোটারি পাবলিকের সম্মুখে স্বাক্ষর করিলাম।
      </p>
      <div style="text-align: right; margin-top: 30pt; font-size: 10pt;">
        <div style="display: inline-block; border-top: 1px solid #000; padding-top: 4pt; text-align: center; min-width: 140px;">
          হলফকারীর স্বাক্ষর ও টিপসহি
        </div>
      </div>
    `
  },
  {
    id: 'leg_rental_lease',
    name: 'Rental / Lease Agreement',
    nameBn: 'বাড়ি / দোকান ভাড়া চুক্তিপত্র',
    category: 'legal_official',
    categoryName: 'Legal & Official Documents',
    categoryNameBn: 'অফিসিয়াল ও আইনগত খসড়া',
    language: 'bn',
    description: 'Residential flat or commercial shop rental agreement with advance deposit, rent, and utility rules.',
    descriptionBn: 'বাসা, ফ্ল্যাট বা দোকান ভাড়ার নিরাপত্তা জামানত, মাসিক ভাড়া ও শর্ত সংবলিত চুক্তিপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: LEGAL_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[বাড়িওয়ালার নাম ও ঠিকানা]', '[ভাড়াটিয়ার নাম ও ঠিকানা]', '[ভাড়া দেওয়া স্থানের ঠিকানা ও বিবরণ]', '[মাসিক ভাড়ার পরিমাণ]', '[অগ্রিম/জামানতের টাকা]', '[চুক্তির মেয়াদ]', '[পরিশোধের শেষ তারিখ]', '[সাক্ষী ১]', '[সাক্ষী ২]'],
    tags: ['rental agreement', 'ভাড়া চুক্তি', 'দোকান ভাড়া', 'বাড়ি ভাড়া', 'lease', 'চুক্তিপত্র'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 6pt 10pt; border-radius: 6pt; margin-bottom: 12pt; font-size: 9pt; color: #92400e;">
        <strong>বিজ্ঞপ্তি:</strong> এটি একটি সাধারণ ভাড়ার খসড়া ফরম্যাট। বাড়ি ভাড়া নিয়ন্ত্রণ আইন ও স্থানীয় স্ট্যাম্প ডিউটি অনুযায়ী ব্যবহার করুন।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 15pt; font-weight: bold; margin: 0; color: #0f172a;">বাড়ি / দোকান ভাড়া চুক্তিপত্র</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 6pt;"><strong>১ম পক্ষ (মালিক):</strong> [বাড়িওয়ালার নাম ও ঠিকানা]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;"><strong>২য় পক্ষ (ভাড়াটিয়া):</strong> [ভাড়াটিয়ার নাম ও ঠিকানা]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 8pt;">
        উভয় পক্ষ স্বেচ্ছায় ও সুস্থ মস্তিষ্কে [ভাড়া দেওয়া স্থানের ঠিকানা ও বিবরণ] নিম্নোক্ত শর্তাবলি সাপেক্ষে ভাড়া দেওয়া ও নেওয়ার জন্য চুক্তিবদ্ধ হইলেন:
      </p>
      <ol style="line-height: 1.6; font-size: 10pt; padding-left: 18pt; margin-bottom: 16pt;">
        <li>মাসিক ভাড়া বাবদ সর্বমোট <strong>৳ [মাসিক ভাড়ার পরিমাণ]</strong> টাকা ধার্য করা হইল, যা প্রতি ইংরেজি মাসের [পরিশোধের শেষ তারিখ] তারিখের মধ্যে পরিশোধযোগ্য।</li>
        <li>২য় পক্ষ ১ম পক্ষকে নিরাপত্তা জামানত বাবদ অফেরতযোগ্য/ফেরতযোগ্য অগ্রিম <strong>৳ [অগ্রিম/জামানতের টাকা]</strong> টাকা প্রদান করিলেন।</li>
        <li>চুক্তির মোট মেয়াদ <strong>[চুক্তির মেয়াদ]</strong> বছর বলবৎ থাকিবে।</li>
        <li>বিদ্যুৎ, গ্যাস, পানি এবং সার্ভিস চার্জ ২য় পক্ষ নিজ দায়িত্বে নিয়মিত পরিশোধ করিবেন।</li>
      </ol>
      <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 24pt;">
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">১ম পক্ষ (মালিক)</div>
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">২য় পক্ষ (ভাড়াটিয়া)</div>
      </div>
    `
  },
  {
    id: 'leg_noc_certificate',
    name: 'No Objection Certificate (NOC)',
    nameBn: 'অনাপত্তিপত্র (NOC)',
    category: 'legal_official',
    categoryName: 'Legal & Official Documents',
    categoryNameBn: 'অফিসিয়াল ও আইনগত খসড়া',
    language: 'mixed',
    description: 'Standard employer No Objection Certificate for passport, visa or foreign travel.',
    descriptionBn: 'পাসপোর্ট, ভিসা বা উচ্চশিক্ষার জন্য প্রতিষ্ঠান প্রদত্ত অনাপত্তিপত্র।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    placeholders: ['[INSTITUTION_NAME]', '[REF_NO]', '[DATE]', '[EMPLOYEE_NAME]', '[DESIGNATION]', '[PASSPORT_NO]', '[TRAVEL_PURPOSE]', '[AUTHORIZED_OFFICIAL]'],
    tags: ['NOC', 'অনাপত্তিপত্র', 'no objection', 'passport noc', 'visa'],
    pageSettings: STANDARD_A4,
    contentHtml: `
      <div style="text-align: center; margin-bottom: 16pt;">
        <h2 style="font-size: 16pt; margin: 0; color: #1e3a8a;"><strong>[INSTITUTION_NAME]</strong></h2>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 4pt; font-size: 9.5pt; margin-top: 10pt;">
          <span>Memo No: [REF_NO]</span>
          <span>Date: [DATE]</span>
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 16pt;">
        <h3 style="font-size: 14pt; text-decoration: underline; margin: 0;">NO OBJECTION CERTIFICATE (NOC)</h3>
      </div>
      <p style="text-align: justify; line-height: 1.7; font-size: 10.5pt; margin-bottom: 12pt;">
        This is to certify that <strong>[EMPLOYEE_NAME]</strong> is a bonafide employee of [INSTITUTION_NAME], currently working as <strong>[DESIGNATION]</strong>.
      </p>
      <p style="text-align: justify; line-height: 1.7; font-size: 10.5pt; margin-bottom: 14pt;">
        This institution has no objection to his/her application for passport/visa and traveling abroad for the purpose of [TRAVEL_PURPOSE]. The authority will grant necessary leave as per rules upon finalization of travel schedule.
      </p>
      <p style="margin-bottom: 24pt; font-size: 10pt;">Passport No (if available): [PASSPORT_NO]</p>
      <p style="text-align: right; font-size: 10pt; line-height: 1.4;">
        <strong>[AUTHORIZED_OFFICIAL]</strong><br/>
        Issuing Authority & Seal<br/>
        [INSTITUTION_NAME]
      </p>
    `
  },

  // ==========================================
  // F. DEED & DOLIL TEMPLATES (দলিল ও চুক্তিপত্র)
  // ==========================================
  {
    id: 'deed_agreement_bayna',
    name: 'Agreement Deed (বায়নাপত্র দলিল)',
    nameBn: 'জমি/ফ্ল্যাট বায়নাপত্র চুক্তি দলিল খসড়া',
    category: 'deed_dolil',
    categoryName: 'Deed & Dolil Templates',
    categoryNameBn: 'দলিল ও চুক্তিপত্র',
    language: 'bn',
    description: 'Immovable land or property purchase earnest money agreement deed (Baynapatra dolil).',
    descriptionBn: 'স্থাবর সম্পত্তি/জমি ক্রয়ের ক্ষেত্রে বায়নার টাকা ও সাফ কবলা রেজিস্ট্রির শর্ত সংবলিত বায়না দলিল।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: DEED_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[১ম পক্ষ বিক্রেতার নাম ও ঠিকানা]', '[২য় পক্ষ ক্রেতার নাম ও ঠিকানা]', '[মৌজা ও জেএল নম্বর]', '[খতিয়ান ও দাগ নম্বর]', '[জমির পরিমাণ]', '[মোট বিক্রয়মূল্য]', '[বায়না বাবদ গৃহীত টাকা]', '[অবশিষ্ট টাকা পরিশোধের মেয়াদ]', '[সাক্ষীগণের নাম]'],
    tags: ['জমির দলিল', 'দলিল', 'dolil', 'deed', 'বায়নাপত্র', 'bayna', 'land deed', 'বায়না দলিল'],
    pageSettings: LEGAL_PAGE,
    contentHtml: `
      <div style="background-color: #fee2e2; border: 1.5px solid #ef4444; padding: 8pt 12pt; border-radius: 6pt; margin-bottom: 14pt; font-size: 9.5pt; color: #991b1b;">
        <strong>আইনগত সতর্কতা ও ডিসক্লেইমার:</strong> এটি দলিল ড্রাফটিং বা খসড়া তৈরির একটি নমুনা ফরম্যাট মাত্র। রেজিস্ট্রেশন আইন অনুযায়ী সরকারি নন-জুডিশিয়াল স্ট্যাম্প ও সাব-রেজিস্ট্রার কার্যালয়ের আনুষ্ঠানিকতা আবশ্যক।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">স্থাবর সম্পত্তি বিক্রয়ের বায়নাপত্র দলিল</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 6pt;">
        <strong>১ম পক্ষ (বিক্রেতা):</strong> [১ম পক্ষ বিক্রেতার নাম ও ঠিকানা], জাতীয় পরিচয়পত্র নং: ____________
      </p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 12pt;">
        <strong>২য় পক্ষ (ক্রেতা):</strong> [২য় পক্ষ ক্রেতার নাম ও ঠিকানা], জাতীয় পরিচয়পত্র নং: ____________
      </p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;">
        পরম করুণাময় মহান সৃষ্টিকর্তার নাম স্মরণ করিয়া আমি ১ম পক্ষ নিম্ন তফসিলভুক্ত জমি বিক্রয়ের প্রস্তাব করিলে ২য় পক্ষ তাহা খরিদ করিতে সম্মত হন। সর্বমোট বিক্রয়মূল্য <strong>৳ [মোট বিক্রয়মূল্য]</strong> টাকা ধার্য করিয়া অদ্য বায়না বাবদ নগদ/চেক মারফত <strong>৳ [বায়না বাবদ গৃহীত টাকা]</strong> টাকা ১ম পক্ষ বুঝিয়া পাইলাম।
      </p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;">
        অবশিষ্ট টাকা আগামী [অবশিষ্ট টাকা পরিশোধের মেয়াদ] তারিখের মধ্যে পরিশোধ করিয়া ২য় পক্ষ নিজ খরচে সাফ কবলা দলিল রেজিস্ট্রি করাইয়া লইবেন।
      </p>
      <h3 style="font-size: 12pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2pt; margin: 12pt 0 6pt 0;">জমির তফসিল পরিচয়:</h3>
      <p style="line-height: 1.6; font-size: 10pt; margin-bottom: 16pt;">
        জেলা: ____________, উপজেলা/থানা: ____________, মৌজা ও জেএল: [মৌজা ও জেএল নম্বর], খতিয়ান নং: [খতিয়ান ও দাগ নম্বর], দাগ নং: ____________, মোট জমির পরিমাণ: <strong>[জমির পরিমাণ]</strong>।
      </p>
      <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 30pt;">
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">১ম পক্ষ বিক্রেতার স্বাক্ষর</div>
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">২য় পক্ষ ক্রেতার স্বাক্ষর</div>
      </div>
      <p style="margin-top: 20pt; font-size: 9.5pt; color: #475569;">সাক্ষীগণের নাম ও স্বাক্ষর: [সাক্ষীগণের নাম]</p>
    `
  },
  {
    id: 'deed_saf_kabala_layout',
    name: 'Sale Deed Layout (সাফ কবলা দলিল খসড়া)',
    nameBn: 'স্থাবর সম্পত্তি সাফ কবলা দলিলের কাঠামো',
    category: 'deed_dolil',
    categoryName: 'Deed & Dolil Templates',
    categoryNameBn: 'দলিল ও চুক্তিপত্র',
    language: 'bn',
    description: 'Drafting structure of permanent land deed (Saf Kabala) with schedule of property.',
    descriptionBn: 'স্থাবর সম্পত্তির পূর্ণ মালিকানা হস্তান্তরের সাফ কবলা দলিলের প্রমিত আইনি খসড়া কাঠামো।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: DEED_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[বিক্রেতা / দাতার বিবরণ]', '[ক্রেতা / গ্রহীতার বিবরণ]', '[জমির স্বত্ব ও ইতিবৃত্ত]', '[পণমূল্য / বিক্রয় মূল্য]', '[জমির তফসিল ও চৌহদ্দি]', '[দাতার স্বাক্ষর ও টিপ]', '[শনাক্তকারী]'],
    tags: ['সাফ কবলা', 'জমির দলিল', 'দলিল', 'dolil', 'kabala', 'sale deed', 'ভূমি'],
    pageSettings: LEGAL_PAGE,
    contentHtml: `
      <div style="background-color: #fee2e2; border: 1.5px solid #ef4444; padding: 8pt 12pt; border-radius: 6pt; margin-bottom: 14pt; font-size: 9.5pt; color: #991b1b;">
        <strong>আইনগত সতর্কতা:</strong> সাফ কবলা দলিল সরকারি নন-জুডিশিয়াল স্ট্যাম্পে সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিসে নিবন্ধিত হওয়া আবশ্যক।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">সাফ কবলা দলিল খসড়া</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 6pt;"><strong>দাতা/বিক্রেতা:</strong> [বিক্রেতা / দাতার বিবরণ]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;"><strong>গ্রহীতা/ক্রেতা:</strong> [ক্রেতা / গ্রহীতার বিবরণ]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;">
        যেহেতু আমি দাতা নিম্ন তফসিল বর্ণিত জমি [জমির স্বত্ব ও ইতিবৃত্ত] সূত্রে প্রাপ্ত হইয়া একক মালিক ও দখলকার থাকিয়া ভোগদখল করিয়া আসিতেছি। অধুনা আমার নগদ অর্থের বিশেষ প্রয়োজনে মোট পণমূল্য <strong>৳ [পণমূল্য / বিক্রয় মূল্য]</strong> টাকা নির্ধারণ করিয়া অত্র দলিল সম্পাদনপূর্বক চিরতরে স্বত্ব ত্যাগ করিলাম।
      </p>
      <h3 style="font-size: 11.5pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2pt; margin: 12pt 0 6pt 0;">তফসিল ও চৌহদ্দি:</h3>
      <p style="line-height: 1.6; font-size: 10pt; margin-bottom: 20pt;">[জমির তফসিল ও চৌহদ্দি]</p>
      <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 30pt;">
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">[দাতার স্বাক্ষর ও টিপ]</div>
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">শনাক্তকারীর স্বাক্ষর: [শনাক্তকারী]</div>
      </div>
    `
  },
  {
    id: 'deed_power_of_attorney',
    name: 'Power of Attorney (আমমোক্তারনামা)',
    nameBn: 'আমমোক্তারনামা দলিল খসড়া (Power of Attorney)',
    category: 'deed_dolil',
    categoryName: 'Deed & Dolil Templates',
    categoryNameBn: 'দলিল ও চুক্তিপত্র',
    language: 'bn',
    description: 'General/Special power of attorney drafting deed empowering an agent to manage property or court cases.',
    descriptionBn: 'সম্পত্তি রক্ষণাবেক্ষণ বা মামলা পরিচালনার জন্য প্রতিনিধি নিয়োগের আমমোক্তারনামা দলিল।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: DEED_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[নিয়োগকারী/মূল মালিকের নাম]', '[মনোনীত অ্যাটর্নি/প্রতিনিধির নাম]', '[সম্পত্তির বিবরণ ও তফসিল]', '[অর্পিত ক্ষমতাবলি]', '[মূল মালিকের স্বাক্ষর]', '[অ্যাটর্নির স্বাক্ষর]'],
    tags: ['power of attorney', 'আমমোক্তারনামা', 'দলিল', 'dolil', 'মোক্তারনামা', 'deed'],
    pageSettings: LEGAL_PAGE,
    contentHtml: `
      <div style="background-color: #fee2e2; border: 1.5px solid #ef4444; padding: 8pt 12pt; border-radius: 6pt; margin-bottom: 14pt; font-size: 9.5pt; color: #991b1b;">
        <strong>আইনগত সতর্কতা:</strong> পাওয়ার অব অ্যাটর্নি আইন ২০১২ অনুযায়ী সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিসে নিবন্ধন করা বাধ্যতামূলক।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">আমমোক্তারনামা দলিল খসড়া</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 6pt;"><strong>নিয়োগকারী (Principal):</strong> [নিয়োগকারী/মূল মালিকের নাম]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;"><strong>মনোনীত অ্যাটর্নি (Attorney):</strong> [মনোনীত অ্যাটর্নি/প্রতিনিধির নাম]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;">
        যেহেতু আমি মূল মালিক শারীরিক অসুস্থতা/দূরত্ব হেতু [সম্পত্তির বিবরণ ও তফসিল] সুষ্ঠু রক্ষণাবেক্ষণ ও পরিচালনা করিতে অক্ষম, সেহেতু আমি সজ্ঞানে উল্লেখিত অ্যাটর্নিকে আমার পক্ষে নিম্নবর্ণিত কার্যসমূহ সম্পাদনের বৈধ ক্ষমতা অর্পণ করিলাম:
      </p>
      <p style="line-height: 1.6; font-size: 10pt; margin-bottom: 16pt;"><strong>ক্ষমতাবলি:</strong> [অর্পিত ক্ষমতাবলি]</p>
      <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 30pt;">
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">[মূল মালিকের স্বাক্ষর]</div>
        <div style="text-align: center; width: 40%; border-top: 1px solid #000; padding-top: 4pt;">[অ্যাটর্নির স্বাক্ষর]</div>
      </div>
    `
  },
  {
    id: 'deed_heba_gift',
    name: 'Gift / Heba Deed (হেবা দলিল খসড়া)',
    nameBn: 'দানপত্র / হেবা দলিল খসড়া কাঠামো',
    category: 'deed_dolil',
    categoryName: 'Deed & Dolil Templates',
    categoryNameBn: 'দলিল ও চুক্তিপত্র',
    language: 'bn',
    description: 'Heba-bil-ewaz or unconditional gift deed layout between blood relations.',
    descriptionBn: 'রক্তের সম্পর্কের আত্মীয়দের মধ্যে স্থাবর সম্পত্তি নিঃশর্ত দান বা হেবা দলিলের খসড়া।',
    version: '2.0',
    lastUpdated: '2026-10-06',
    disclaimer: DEED_DISCLAIMER,
    isDeedOrLegal: true,
    placeholders: ['[দাতার বিবরণ]', '[গ্রহীতার বিবরণ]', '[সম্পর্কের বিবরণ]', '[সম্পত্তির তফসিল]', '[দাতার স্বাক্ষর]'],
    tags: ['হেবা দলিল', 'দানপত্র', 'gift deed', 'heba', 'dolil', 'দলিল'],
    pageSettings: LEGAL_PAGE,
    contentHtml: `
      <div style="background-color: #fee2e2; border: 1.5px solid #ef4444; padding: 8pt 12pt; border-radius: 6pt; margin-bottom: 14pt; font-size: 9.5pt; color: #991b1b;">
        <strong>আইনগত সতর্কতা:</strong> হেবা দলিল সাব-রেজিস্ট্রি অফিসে বৈধ ঘোষণা ও স্ট্যাম্পসহ নিবন্ধিত হতে হবে।
      </div>
      <div style="text-align: center; margin-bottom: 14pt;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #0f172a;">হেবা / দানপত্র দলিল খসড়া</h2>
      </div>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 6pt;"><strong>দাতা:</strong> [দাতার বিবরণ]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;"><strong>গ্রহীতা:</strong> [গ্রহীতার বিবরণ]</p>
      <p style="text-align: justify; line-height: 1.6; font-size: 10.5pt; margin-bottom: 10pt;">
        যেহেতু গ্রহীতা আমার পরম আদরের [সম্পর্কের বিবরণ] এবং তাঁহার সেবাযত্নে সন্তুষ্ট হইয়া কোনো প্রকার প্রতিদান বা অর্থ দাবি ব্যতীত নিম্ন তফসিল বর্ণিত জমি নিঃশর্ত দান করিলাম। অদ্য হইতে গ্রহীতা উক্ত সম্পত্তির নিরঙ্কুশ মালিক হিসেবে ভোগদখল করিবেন।
      </p>
      <p style="line-height: 1.6; font-size: 10pt; margin-bottom: 16pt;"><strong>সম্পত্তির তফসিল:</strong> [সম্পত্তির তফসিল]</p>
      <div style="text-align: right; margin-top: 30pt; font-size: 10pt;">
        <div style="display: inline-block; border-top: 1px solid #000; padding-top: 4pt; min-width: 140px; text-align: center;">
          [দাতার স্বাক্ষর]
        </div>
      </div>
    `
  }
];

export const CATEGORIES_CONFIG = [
  { id: 'all', label: 'All Templates', labelBn: 'সকল টেমপ্লেট', iconName: 'Layers' },
  { id: 'applications_letters', label: 'Applications & Letters', labelBn: 'আবেদন ও দাপ্তরিক চিঠি', iconName: 'FileText' },
  { id: 'personal_letters', label: 'Personal Letters', labelBn: 'ব্যক্তিগত ও আনুষ্ঠানিক পত্র', iconName: 'Mail' },
  { id: 'business_office', label: 'Business & Office', labelBn: 'ব্যবসা ও অফিস', iconName: 'Briefcase' },
  { id: 'education', label: 'Education', labelBn: 'শিক্ষা সংক্রান্ত', iconName: 'GraduationCap' },
  { id: 'legal_official', label: 'Official / Legal', labelBn: 'আইনগত ও অফিসিয়াল', iconName: 'Scale' },
  { id: 'deed_dolil', label: 'Deed & Dolil', labelBn: 'দলিল ও চুক্তিপত্র', iconName: 'Scroll' },
  { id: 'custom', label: 'My Templates', labelBn: 'আমার টেমপ্লেট', iconName: 'FolderHeart' },
  { id: 'favorites', label: 'Starred', labelBn: 'পছন্দের টেমপ্লেট', iconName: 'Star' },
  { id: 'recent', label: 'Recently Used', labelBn: 'সম্প্রতি ব্যবহৃত', iconName: 'Clock' },
] as const;
