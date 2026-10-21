import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'glow';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default:
      'bg-theme-subtle text-theme-primary border-theme-primary/30',
    secondary:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    success:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    destructive:
      'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    glow:
      'bg-theme-subtle text-theme-primary border-theme-primary shadow-xs shadow-theme-glow',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-tight transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
