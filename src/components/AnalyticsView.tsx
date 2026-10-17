import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Users,
  Phone,
  Landmark,
  Zap,
  Star,
  ShieldCheck,
  Folder as FolderIcon,
  PhoneCall,
  Copy,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { contacts, phoneNumbers, bankAccounts, interactions, folders, setSelectedContactId } = useApp();

  // Top interacted contacts
  const contactInteractionCounts = contacts
    .map(c => {
      const count = interactions.filter(i => i.contactId === c.id).length;
      return { contact: c, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(1, ...contactInteractionCounts.map(i => i.count));

  // Bank accounts summary
  const banksByBrand = bankAccounts.reduce((acc, curr) => {
    acc[curr.bankName] = (acc[curr.bankName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Folder distribution
  const folderCounts = folders.map(f => ({
    folder: f,
    count: contacts.filter(c => c.folderId === f.id).length,
  }));
  const unassignedCount = contacts.filter(c => !c.folderId).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Directory Metrics & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time local statistics on your personal directory records and activity
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Contacts</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{contacts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {contacts.filter(c => c.isFavorite).length} starred favorites
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Numbers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{phoneNumbers.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg {(phoneNumbers.length / Math.max(1, contacts.length)).toFixed(1)} per contact
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bank Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{bankAccounts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Stored with AES encryption</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interactions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{interactions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Calls, copies & notes</p>
        </div>
      </div>

      {/* Two Columns: Most Contacted + Folder Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Contacted */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Most Contacted Friends & Family
          </h3>

          <div className="space-y-3">
            {contactInteractionCounts.map(({ contact, count }) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-400 cursor-pointer transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {contact.name}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {count} events
                  </span>
                </div>
                {/* Visual meter bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {contactInteractionCounts.length === 0 && (
              <p className="text-xs text-slate-400 italic">No interactions yet.</p>
            )}
          </div>
        </div>

        {/* Folder Distribution */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-indigo-500" />
            Folder & Label Distribution
          </h3>

          <div className="space-y-3">
            {folderCounts.map(({ folder, count }) => {
              const pct = contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0;
              return (
                <div
                  key={folder.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: folder.color }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {folder.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: folder.color,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {unassignedCount > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Unlabeled / General</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {unassignedCount} (
                    {Math.round((unassignedCount / Math.max(1, contacts.length)) * 100)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
