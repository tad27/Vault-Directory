import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, clearable, onClear, value, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          value={value}
          className={cn(
            'flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            clearable && value && 'pr-9',
            className
          )}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
