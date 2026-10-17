import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-3 shadow-2xl border border-slate-700/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      {toast.type === 'warning' ? (
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
      ) : toast.type === 'info' ? (
        <Info className="w-5 h-5 text-blue-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      )}
      <span className="text-sm font-medium tracking-tight">{toast.message}</span>
    </div>
  );
};
