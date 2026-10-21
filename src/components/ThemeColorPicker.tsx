import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { THEME_OPTIONS, type ThemeOption } from '../lib/theme';
import type { ThemeColor } from '../types';
import { Palette, Check } from 'lucide-react';

interface Props {
  variant?: 'full' | 'dropdown' | 'inline';
  className?: string;
}

export const ThemeColorPicker: React.FC<Props> = ({ variant = 'full', className = '' }) => {
  const { settings, setThemeColor } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEME_OPTIONS.find(t => t.id === settings.themeColor) || THEME_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (variant !== 'dropdown') return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, variant]);

  const handleSelect = (colorId: ThemeColor) => {
    setThemeColor(colorId);
    if (variant === 'dropdown') {
      setIsOpen(false);
    }
  };

  // 1. INLINE ROW (E.g. In mobile drawer or headers)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 ${className}`}>
        {THEME_OPTIONS.map((theme: ThemeOption) => {
          const isSelected = settings.themeColor === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              title={`${theme.name} (${theme.badge})`}
              className="relative p-1 rounded-full group transition-transform active:scale-90 shrink-0"
              aria-label={`Select ${theme.name} theme`}
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-xs flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="activeThemeColorRingInline"
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: theme.primary }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. DROPDOWN POPOVER (Navbar desktop & mobile quick switcher)
  if (variant === 'dropdown') {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Active Theme Color: ${activeTheme.name}. Click to switch theme accent`}
          className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center gap-1.5 shrink-0"
          aria-label="Change Accent Color Theme"
        >
          <div className="relative">
            <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
              }}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-3 z-50 text-left"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Accent Color Theme
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {THEME_OPTIONS.length} Colors
                </span>
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
                {THEME_OPTIONS.map((theme: ThemeOption) => {
                  const isSelected = settings.themeColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelect(theme.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left group ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {theme.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ml-2 shrink-0 border"
                        style={{
                          borderColor: `${theme.primary}40`,
                          backgroundColor: `${theme.primary}15`,
                          color: theme.primary,
                        }}
                      >
                        {theme.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3. FULL MODE (Used in Settings & Privacy Modal)
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Accent Color Palette
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalize buttons, highlights, badges & ambient glow
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
          style={{
            borderColor: `${activeTheme.primary}40`,
            backgroundColor: `${activeTheme.primary}15`,
            color: activeTheme.primary,
          }}
        >
          Active: {activeTheme.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {THEME_OPTIONS.map((theme: ThemeOption) => {
          const isSelected = settings.themeColor === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group active:scale-[0.98] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 shadow-sm ring-2'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={{
                borderColor: isSelected ? theme.primary : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${theme.primary}25` : undefined,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-white/40" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {theme.name}
                    </p>
                    <span
                      className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${theme.primary}40`,
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary,
                      }}
                    >
                      {theme.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {theme.description}
                  </p>
                </div>
              </div>

              {/* Color preview swatch gradient pill */}
              <div className="flex items-center gap-1 shrink-0">
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-xs -ml-2"
                  style={{ backgroundColor: theme.secondary }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
