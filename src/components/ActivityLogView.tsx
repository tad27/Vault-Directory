import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { InteractionType } from '../types';
import {
  History,
  PhoneCall,
  Landmark,
  Copy,
  FileText,
  Search,
  Filter,
  User,
  ArrowRight,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { interactions, contacts, setSelectedContactId } = useApp();
  const [filterType, setFilterType] = useState<InteractionType | 'all'>('all');
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return interactions.filter(log => {
      if (filterType !== 'all' && log.type !== filterType) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        return (
          log.notes.toLowerCase().includes(q) ||
          log.contactName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [interactions, filterType, logSearch]);

  const getIconForType = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-emerald-500" />;
      case 'copy_bank':
        return <Landmark className="w-4 h-4 text-emerald-500" />;
      case 'copy_phone':
        return <Copy className="w-4 h-4 text-indigo-500" />;
      case 'note':
      default:
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  const getBadgeForType = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return 'Call Placed';
      case 'copy_bank':
        return 'Bank Copied';
      case 'copy_phone':
        return 'Phone Copied';
      case 'note':
      default:
        return 'Note Logged';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Activity & Interaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of outbound calls, copied bank info, and notes
          </p>
        </div>

        {/* Search within logs */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={logSearch}
            onChange={e => setLogSearch(e.target.value)}
            placeholder="Search interaction records..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'call', label: 'Calls' },
          { id: 'copy_bank', label: 'Bank Copies' },
          { id: 'copy_phone', label: 'Phone Copies' },
          { id: 'note', label: 'Notes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as typeof filterType)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No interaction events found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Calls and copied numbers or bank details will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => {
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-500/40 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {getIconForType(log.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <button
                        onClick={() => setSelectedContactId(log.contactId)}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      >
                        {log.contactName}
                      </button>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {getBadgeForType(log.type)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      {log.notes}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {formattedTime}
                  </span>
                  <span className="text-[10px] text-slate-400">{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
