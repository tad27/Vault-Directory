import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ContactListView } from './components/ContactListView';
import { ContactDetailModal } from './components/ContactDetailModal';
import { ContactFormModal } from './components/ContactFormModal';
import { FolderModal } from './components/FolderModal';
import { SettingsModal } from './components/SettingsModal';
import { LockScreen } from './components/LockScreen';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Users,
  Star,
  History,
  Sliders,
  Plus,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isLocked,
    isLoading,
    activeFilter,
    setActiveFilter,
    setActiveFolderId,
    setIsFormModalOpen,
    setContactToEdit,
    setIsSettingsModalOpen,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 animate-pulse mb-3">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Secure Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Lock Screen if vault is locked */}
      {isLocked && <LockScreen />}

      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs h-full bg-white dark:bg-slate-900 p-4 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
              <Sidebar isMobile onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          <ContactListView />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveFilter('all');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
            activeFilter === 'all'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => {
            setActiveFilter('favorites');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
            activeFilter === 'favorites'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Star className="w-5 h-5" />
          <span>Favorites</span>
        </button>

        {/* Center Floating Add Button */}
        <button
          onClick={() => {
            setContactToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="-mt-5 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-90 transition"
          aria-label="Add Contact"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            setActiveFilter('activity');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
            activeFilter === 'activity'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
        >
          <Sliders className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Modals & Overlays */}
      <ContactDetailModal />
      <ContactFormModal />
      <FolderModal />
      <SettingsModal />
      <Toast />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
