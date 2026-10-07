/**
 * Wordora - Root Application Component
 */

import React, { useState, useEffect } from 'react';
import { DocumentModel } from './types/document';
import { 
  getAllDocuments, 
  createNewDocument, 
  moveToTrash, 
  restoreFromTrash, 
  permanentlyDelete, 
  duplicateDocument, 
  toggleFavorite, 
  saveDocument,
  getAppSettings,
  AppSettings
} from './utils/storage';
import { loadAndRegisterCustomFonts } from './utils/fontManager';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { SettingsModal } from './components/SettingsModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { AboutModal } from './components/AboutModal';
import { SplashScreen } from './components/SplashScreen';
import { SmartDocumentScannerModal } from './components/SmartDocumentScannerModal';
import { App as CapApp } from '@capacitor/app';

export default function App() {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentModel | null>(null);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [pendingUnlockDoc, setPendingUnlockDoc] = useState<DocumentModel | null>(null);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('wordora_splash_viewed');
  });

  // Load documents and custom fonts on mount
  useEffect(() => {
    refreshDocuments();
    loadAndRegisterCustomFonts();
  }, []);

  // Sync theme with root HTML
  useEffect(() => {
    const isDark = 
      settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handle Android native hardware/gesture back button navigation
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    try {
      CapApp.addListener('backButton', () => {
        if (pendingUnlockDoc) {
          setPendingUnlockDoc(null);
        } else if (showScannerModal) {
          setShowScannerModal(false);
        } else if (showSettingsModal) {
          setShowSettingsModal(false);
        } else if (showAboutModal) {
          setShowAboutModal(false);
        } else if (activeDoc) {
          setActiveDoc(null);
          refreshDocuments();
        } else {
          CapApp.exitApp();
        }
      }).then(handle => {
        removeListener = () => handle.remove();
      }).catch(() => {
        // Safe fallback in web environments
      });
    } catch {
      // Safe fallback
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, [pendingUnlockDoc, showScannerModal, showSettingsModal, showAboutModal, activeDoc]);

  const refreshDocuments = () => {
    const docs = getAllDocuments();
    setDocuments(docs);
  };

  const handleOpenDocument = (doc: DocumentModel) => {
    if (doc.isPasswordProtected && doc.passwordHash) {
      setPendingUnlockDoc(doc);
    } else {
      setActiveDoc(doc);
    }
  };

  const handleCreateNew = (templateId?: string) => {
    const newDoc = createNewDocument(templateId);
    refreshDocuments();
    setActiveDoc(newDoc);
  };

  const handleImportDocument = (html: string, title: string, pageSettings?: import('./types/document').PageSettings) => {
    const newDoc = createNewDocument('tpl_blank', title);
    newDoc.contentHtml = html;
    if (pageSettings) {
      newDoc.pageSettings = pageSettings;
    }
    saveDocument(newDoc);
    refreshDocuments();
    setActiveDoc(newDoc);
  };

  const handleScanComplete = (html: string, title: string) => {
    const newDoc = createNewDocument('tpl_blank', title);
    newDoc.contentHtml = html;
    newDoc.tags = ['Scanned', 'OCR', 'Bangla'];
    saveDocument(newDoc);
    refreshDocuments();
    setActiveDoc(newDoc);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    refreshDocuments();
  };

  const handleMoveToTrash = (id: string) => {
    moveToTrash(id);
    refreshDocuments();
  };

  const handleRestoreFromTrash = (id: string) => {
    restoreFromTrash(id);
    refreshDocuments();
  };

  const handlePermanentlyDelete = (id: string) => {
    permanentlyDelete(id);
    refreshDocuments();
  };

  const handleDuplicate = (id: string) => {
    duplicateDocument(id);
    refreshDocuments();
  };

  const handleRename = (id: string, newTitle: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      const updated = { ...doc, title: newTitle, updatedAt: Date.now() };
      saveDocument(updated);
      refreshDocuments();
    }
  };

  const handleSaveActiveDoc = (updatedDoc: DocumentModel) => {
    setActiveDoc(updatedDoc);
    refreshDocuments();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900">
      {activeDoc ? (
        <EditorScreen
          document={activeDoc}
          onBackToHome={() => {
            setActiveDoc(null);
            refreshDocuments();
          }}
          onSaveDocument={handleSaveActiveDoc}
          bengaliTypingAid={settings.bengaliTypingAid}
          onOpenAbout={() => setShowAboutModal(true)}
        />
      ) : (
        <HomeScreen
          documents={documents}
          onOpenDocument={handleOpenDocument}
          onCreateNew={handleCreateNew}
          onImportDocument={handleImportDocument}
          onToggleFavorite={handleToggleFavorite}
          onMoveToTrash={handleMoveToTrash}
          onRestoreFromTrash={handleRestoreFromTrash}
          onPermanentlyDelete={handlePermanentlyDelete}
          onDuplicate={handleDuplicate}
          onRename={handleRename}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenScanner={() => setShowScannerModal(true)}
        />
      )}

      {/* Smart Document Scanner Modal */}
      <SmartDocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onOpenInEditor={handleScanComplete}
      />

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onRefreshDocs={refreshDocuments}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* About Developer & Application Dialog */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Password Unlock Dialog for Locked Docs */}
      {pendingUnlockDoc && (
        <PasswordPromptModal
          isOpen={true}
          onClose={() => setPendingUnlockDoc(null)}
          isSettingPassword={false}
          expectedHash={pendingUnlockDoc.passwordHash}
          onSuccess={() => {
            setActiveDoc(pendingUnlockDoc);
            setPendingUnlockDoc(null);
          }}
        />
      )}

      {/* Android Startup Splash Screen with Official Logo */}
      {showSplash && (
        <SplashScreen
          appName="Wordora"
          onFinish={() => {
            sessionStorage.setItem('wordora_splash_viewed', 'true');
            setShowSplash(false);
          }}
        />
      )}
    </div>
  );
}
