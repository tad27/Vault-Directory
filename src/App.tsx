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
import { BackgroundGrid } from './components/ui/aceternity';
import { motion, AnimatePresence } from 'motion/react';
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
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 animate-pulse mb-3 shadow-lg shadow-indigo-500/10">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Secure Vault...</p>
      </div>
    );
  }

  return (
    <BackgroundGrid className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-out">
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
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-40 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              >
                <Sidebar isMobile onCloseMobile={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content View Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-28 md:pb-12">
          <ContactListView />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Optimized for iPhone Safe Area) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveFilter('all');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] text-[10px] font-semibold transition active:scale-95 py-1 px-2 rounded-xl ${
            activeFilter === 'all' && !isMobileMenuOpen
              ? 'text-theme-primary font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilter('favorites');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] text-[10px] font-semibold transition active:scale-95 py-1 px-2 rounded-xl ${
            activeFilter === 'favorites'
              ? 'text-amber-500 dark:text-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Star className={`w-5 h-5 ${activeFilter === 'favorites' ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>Favorites</span>
        </button>

        {/* Center Floating Add Button with Aceternity glow */}
        <button
          type="button"
          onClick={() => {
            setContactToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="-mt-5 w-12 h-12 rounded-2xl bg-theme-gradient active:scale-90 text-white flex items-center justify-center shadow-lg shadow-theme-glow border-2 border-white dark:border-slate-900 transition-all duration-300 shrink-0"
          aria-label="Add Contact"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilter('activity');
            setActiveFolderId(null);
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] text-[10px] font-semibold transition active:scale-95 py-1 px-2 rounded-xl ${
            activeFilter === 'activity'
              ? 'text-theme-primary font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 active:scale-95 py-1 px-2 rounded-xl"
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
    </BackgroundGrid>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
