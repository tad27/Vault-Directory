import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Button } from './ui/button';
import {
  Shield,
  Search,
  Plus,
  Lock,
  Menu,
  X,
  Sliders,
  SlidersHorizontal,
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
    lockVault,
    setIsFormModalOpen,
    setContactToEdit,
    setIsSettingsModalOpen,
    setIsFilterModalOpen,
    activeFilterCount,
  } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' &&
          document.activeElement !== searchInputRef.current &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA')
      ) {
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
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Nav Container */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 md:py-0 md:h-16 gap-2 md:gap-4">
          {/* Top row on mobile, Left area on desktop */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Brand & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 shrink-0"
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 group"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-theme-gradient flex items-center justify-center text-white shadow-theme-glow shrink-0 group-hover:scale-105 transition-all duration-300">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base truncate">
                      VaultDirectory
                    </span>
                    <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-theme-subtle text-theme-primary border border-theme-primary shrink-0 transition-colors">
                      PWA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block truncate">
                    Encrypted Local Directory
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Actions: Search, Lock, Settings */}
            <div className="flex md:hidden items-center gap-1 shrink-0">
              {/* Search button: Opens Filter & Search dialog */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                title="Search and filter contacts"
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 shrink-0"
                aria-label="Search and filter contacts"
              >
                <Search className="w-5 h-5" />
                {(Boolean(searchQuery.trim()) || activeFilterCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-theme-primary ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              <PWAInstallButton />

              {settings.isLockEnabled && (
                <button
                  type="button"
                  onClick={lockVault}
                  title="Lock Vault Now"
                  className="p-2 rounded-xl text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 shrink-0"
                  aria-label="Lock Vault Now"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}

              {/* Settings button on mobile header */}
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                title="Settings & Appearance"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 shrink-0"
                aria-label="Settings & Appearance"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Search Bar & Filter Button: Hidden on mobile, flex on desktop */}
          <div className="hidden md:flex md:flex-1 md:max-w-xl md:mx-4 min-w-0 items-center gap-2">
            <div className="relative group flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search contacts, phones, bank accounts..."
                className="w-full pl-9 pr-9 py-2 rounded-xl text-base sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:border-theme-primary transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search"
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

            {/* Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              title="Filter by labels, relationships & records"
              className={`relative p-2 sm:p-2.5 rounded-xl border transition active:scale-95 shrink-0 flex items-center justify-center ${
                activeFilterCount > 0
                  ? 'bg-theme-subtle border-theme-primary text-theme-primary ring-2 ring-theme-primary/20'
                  : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-label="Filter contacts"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-theme-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0 justify-end">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* New Contact CTA */}
            <Button
              onClick={handleOpenNewContact}
              variant="shimmer"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </Button>

            {/* Lock Vault Button */}
            {settings.isLockEnabled && (
              <button
                type="button"
                onClick={lockVault}
                title="Lock Vault Now"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
              >
                <Lock className="w-4 h-4 text-amber-500" />
              </button>
            )}

            {/* Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              title="Settings & Appearance"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
              aria-label="Settings & Appearance"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
