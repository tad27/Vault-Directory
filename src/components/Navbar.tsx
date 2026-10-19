import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Shield,
  Search,
  Plus,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  Sliders,
} from 'lucide-react';

interface Props {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<Props> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    searchQuery,
    setSearchQuery,
    settings,
    toggleTheme,
    updateSettings,
    lockVault,
    setIsFormModalOpen,
    setContactToEdit,
    setIsSettingsModalOpen,
  } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement !== searchInputRef.current && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA'))) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewContact = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-0 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base">VaultDirectory</span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Encrypted Local Directory</p>
            </div>
          </div>
        </div>

        {/* Center: Instant Quick-Search Bar */}
        <div className="w-full md:flex-1 md:max-w-xl order-last md:order-none mx-0 md:mx-2 min-w-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts, phones, bank accounts..."
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="hidden sm:flex absolute inset-y-0 right-0 pr-2.5 items-center pointer-events-none">
                <kbd className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto md:ml-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* New Contact CTA - hidden on mobile since it's already a prominent floating button in the bottom navigation */}
          <button
            onClick={handleOpenNewContact}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Contact</span>
          </button>

          {/* Lock Vault Button if configured */}
          {settings.isLockEnabled && (
            <button
              onClick={lockVault}
              title="Lock Vault Now"
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
            >
              <Lock className="w-4 h-4 text-amber-500" />
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
            aria-label={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Settings / Security - hidden on mobile since it is prominently located in the bottom nav */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="Settings & Security"
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
