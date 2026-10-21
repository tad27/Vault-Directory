import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'shimmer';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 ring-theme-primary disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97] cursor-pointer';

    const variants = {
      default:
        'bg-theme-primary text-white hover:opacity-95 active:opacity-90 shadow-xs border border-white/20',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60',
      outline:
        'border border-slate-200/80 bg-white/80 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 backdrop-blur-xs',
      ghost:
        'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 text-slate-600 dark:text-slate-400',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-rose-500/20',
      glass:
        'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 shadow-xs',
      shimmer:
        'relative overflow-hidden bg-theme-gradient hover:opacity-95 active:opacity-90 text-white shadow-theme-glow border border-white/30',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-xs sm:text-sm gap-2 min-h-[40px]',
      sm: 'h-8 px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
      lg: 'h-12 px-6 py-3 text-sm sm:text-base gap-2.5 min-h-[48px]',
      icon: 'h-10 w-10 sm:h-9 sm:w-9 p-0 min-w-[36px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {variant === 'shimmer' && (
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
            aria-hidden="true"
          />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
