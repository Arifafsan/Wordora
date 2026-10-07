import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Heart, 
  Smartphone, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Quote,
  Share2
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [selectedLauncherShape, setSelectedLauncherShape] = useState<'squircle' | 'circle' | 'rounded' | 'teardrop'>('squircle');

  if (!isOpen) return null;

  const developerName = "Arif Ahmed Adi";
  const developerRole = "Founder & Developer";
  const facebookUrl = "https://www.facebook.com/arif.ahmed.829764";
  const whatsappNumber = "01932775794";
  const whatsappUrl = "https://wa.me/8801932775794";
  const appVersion = "v2.4 (Android Edition)";

  const handleCopyWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(whatsappNumber);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2200);
  };

  const getShapeClass = () => {
    switch (selectedLauncherShape) {
      case 'circle': return 'rounded-full';
      case 'squircle': return 'rounded-[32%]';
      case 'rounded': return 'rounded-2xl';
      case 'teardrop': return 'rounded-full rounded-tr-xs';
      default: return 'rounded-3xl';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-blue-400/20">
              <img 
                src="/wordora-logo.png" 
                alt="Wordora Official Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                About Wordora & Developer
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Wordora Mobile · Story, Branding & Profile
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300">

          {/* ==============================================================
              OFFICIAL WORDORA BRANDING & ANDROID ADAPTIVE ICON SHOWCASE
             ============================================================== */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-5 border border-blue-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Dynamic Android Launcher Icon Preview */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className={`w-20 h-20 sm:w-22 sm:h-22 overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300 ${getShapeClass()}`}>
                  <img 
                    src="/wordora-logo.png" 
                    alt="Wordora Official Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-300 mt-2 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Android Icon
                </span>
              </div>

              {/* Branding Details & Adaptive Launcher Selector */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Wordora
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                    Official Brand Logo
                  </span>
                </div>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  Official high-resolution emblem featuring the 3D document, orbital cyan ribbon, fountain pen nib, and Wordora brand mark.
                </p>

                {/* Adaptive Icon Shape Selector */}
                <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-[10px] text-blue-200/60 font-medium mr-1">Launcher Shape:</span>
                  {(['squircle', 'circle', 'rounded', 'teardrop'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => setSelectedLauncherShape(shape)}
                      className={`text-[10px] px-2 py-0.5 rounded-md capitalize font-medium transition-all ${
                        selectedLauncherShape === shape
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-blue-100'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* ==============================================================
              DEVELOPER PROFILE CARD
             ============================================================== */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-6 shadow-lg border border-indigo-800/40">
            {/* Ambient decorative elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {/* Profile Avatar / Monogram */}
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex flex-col items-center justify-center text-white">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                      AAA
                    </span>
                    <span className="text-[8px] tracking-widest uppercase font-semibold text-indigo-400 mt-0.5">
                      CREATOR
                    </span>
                  </div>
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full ring-2 ring-slate-900 shadow-xs" 
                  title="Active Developer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Developer Details & Badge */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {developerName}
                  </h3>
                  {/* Founder & Developer Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    {developerRole}
                  </span>
                </div>

                <p className="text-xs text-indigo-200/80 leading-relaxed max-w-md">
                  Architect & creator of Wordora. Dedicated to bringing desktop-grade document authoring, bilingual typography, and clean formatting to Android devices.
                </p>

                {/* Contact & Social Links */}
                <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  {/* Facebook Button */}
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold shadow-md shadow-blue-900/30 active:scale-95 transition-all"
                  >
                    {/* Facebook Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-md shadow-emerald-950/30 active:scale-95 transition-all"
                  >
                    {/* WhatsApp Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                    <span className="opacity-90 font-mono text-[11px]">({whatsappNumber})</span>
                  </a>

                  {/* Copy WhatsApp Number Button */}
                  <button
                    onClick={handleCopyWhatsapp}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/60 active:scale-95 transition-all"
                    title="Copy WhatsApp Phone Number"
                  >
                    {copiedWhatsapp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================================
              ABOUT THE DEVELOPER
             ============================================================== */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Quote className="w-4 h-4 fill-current opacity-80" />
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                About the Developer
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                “Hi, I’m Arif Ahmed Adi, the creator and developer of this application.
              </p>
              
              <p>
                I built this app with a simple goal: to make professional document work accessible from a mobile phone.
              </p>

              <p>
                Sometimes we suddenly need to create, edit, print, or convert an important document, but we may not have access to a PC or laptop. This application is designed to help in those situations.
              </p>

              <p>
                Whether you need to edit a Word document, create an important document, prepare a PDF, work with ready-made formats, or handle professional document tasks on the go, this app aims to bring many of the essential capabilities of a computer-based word processor directly to your Android phone.
              </p>

              <p>
                My goal is to make document creation easier, faster, and more accessible—especially for people who do not own a PC or laptop.
              </p>

              <p className="italic text-indigo-700 dark:text-indigo-300 font-medium">
                I hope this application makes your everyday work a little easier.”
              </p>
            </div>
          </div>

          {/* ==============================================================
              ABOUT APP / WHY I BUILT THIS APP
             ============================================================== */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-blue-200/70 dark:border-indigo-900/40 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                Why I Built This App
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                “This application was created to provide a practical mobile solution for everyday document work.
              </p>
              
              <p>
                The idea is simple: when a computer is not available, your phone should still be able to help you get important work done.
              </p>

              <p>
                From creating and editing documents to working with Word files, preparing PDFs, using professional templates, and handling urgent document tasks, the app is designed to be a convenient all-in-one mobile workspace.”
              </p>
            </div>
          </div>

          {/* ==============================================================
              APP DETAILS & TECHNICAL HIGHLIGHTS
             ============================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Application</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">Wordora</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">App Version</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{appVersion}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Platform</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">Android / Web</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Storage</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">100% Private Offline</p>
            </div>
          </div>

          {/* Direct Contact Options Quick Bar */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Have feedback or questions? Contact directly:
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                Facebook
              </a>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                WhatsApp
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer with Required Copyright and Attribution */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-center space-y-1">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <span>Made with passion by</span>
            <span className="font-bold text-slate-900 dark:text-white">{developerName}</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © 2026 {developerName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
