import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

/**
 * Ambient background grid & spotlight effect inspired by Aceternity UI.
 * Lightweight, hardware-accelerated, zero-lag on mobile iPhone viewports.
 */
export const BackgroundGrid: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('relative w-full overflow-x-hidden min-h-screen min-h-[100dvh]', className)}>
      {/* Subtle radial spotlight glow at top center */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[350px] sm:w-[900px] sm:h-[450px] rounded-full blur-3xl opacity-80 transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(ellipse at center, var(--theme-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      {/* Micro dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06] [background-size:24px_24px] transition-opacity duration-300 ease-out"
        style={{
          backgroundImage: 'radial-gradient(var(--theme-primary) 1px, transparent 1px)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * CardSpotlight: Aceternity UI inspired card with interactive mouse spotlight
 * on desktop and sleek glassmorphism border on mobile.
 */
export const CardSpotlight: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ children, className, onClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
        className
      )}
    >
      {/* Desktop interactive hover glow */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 hidden sm:block"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * AnimatedSegmentedTabs: Aceternity / iOS style sliding pill navigation
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export const AnimatedSegmentedTabs: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 overflow-x-auto no-scrollbar max-w-full',
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-150 whitespace-nowrap active:scale-[0.97] shrink-0',
              isActive
                ? 'text-slate-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/70 dark:border-slate-700/60"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors',
                    isActive
                      ? 'bg-theme-subtle text-theme-primary'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * ResponsiveSheetModal: On mobile (iPhone) behaves as a native iOS bottom sheet
 * with drag indicator and spring entrance. On desktop, behaves as a centered dialog.
 */
export const ResponsiveSheetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  headerRight?: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-2xl',
  headerRight,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal / Sheet Container */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={cn(
            'relative w-full flex flex-col bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10',
            // Mobile: Bottom sheet styling with safe area padding
            'rounded-t-[28px] sm:rounded-3xl max-h-[92dvh] sm:max-h-[85vh]',
            'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
            maxWidth
          )}
        >
          {/* iOS Bottom Sheet Drag Handle */}
          <div className="sm:hidden pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Header */}
          {(title || icon) && (
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0">
                  {typeof title === 'string' ? (
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {headerRight}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
