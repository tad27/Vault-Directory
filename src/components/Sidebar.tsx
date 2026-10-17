import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Star,
  Clock,
  Zap,
  Folder as FolderIcon,
  FolderPlus,
  History,
  BarChart3,
  HardDrive,
  Lock,
  ChevronRight,
} from 'lucide-react';

interface Props {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isMobile = false, onCloseMobile }) => {
  const {
    contacts,
    folders,
    interactions,
    activeFilter,
    setActiveFilter,
    activeFolderId,
    setActiveFolderId,
    setIsFolderModalOpen,
    settings,
  } = useApp();

  const handleSelectFilter = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    setActiveFolderId(null);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFilter('folder');
    setActiveFolderId(folderId);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const favoritesCount = contacts.filter(c => c.isFavorite).length;
  const recentCount = contacts.filter(c => c.lastInteractedAt || c.updatedAt).length;

  return (
    <aside
      className={`w-64 flex-col justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800/80 p-4 select-none ${
        isMobile ? 'flex w-full h-full' : 'hidden md:flex'
      }`}
    >
      <div className="space-y-6">
        {/* Smart Lists */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Smart Views
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleSelectFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'all' && !activeFolderId
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>All Contacts</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeFilter === 'all' && !activeFolderId
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {contacts.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectFilter('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'favorites'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Favorites</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeFilter === 'favorites'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {favoritesCount}
              </span>
            </button>

            <button
              onClick={() => handleSelectFilter('recents')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'recents'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>Recently Active</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeFilter === 'recents'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {recentCount}
              </span>
            </button>

            <button
              onClick={() => handleSelectFilter('most_used')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'most_used'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Most Contacted</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeFilter === 'most_used'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {contacts.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Folders & Labels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Folders & Labels
            </span>
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Manage Folders"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {folders.map(f => {
              const count = contacts.filter(c => c.folderId === f.id).length;
              const isSelected = activeFilter === 'folder' && activeFolderId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectFolder(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-700/60 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {folders.length === 0 && (
              <p className="text-[11px] text-slate-400 px-3 py-2 italic">No folders yet</p>
            )}
          </div>
        </div>

        {/* App Views */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Insights & Logs
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleSelectFilter('activity')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'activity'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-emerald-500" />
                <span>Activity History</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeFilter === 'activity'
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {interactions.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectFilter('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeFilter === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Directory Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>
      </div>

      {/* Storage & Privacy Status Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
            <span>IndexedDB Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {settings.isLockEnabled ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3 h-3" /> PIN Protected & Encrypted
              </span>
            ) : (
              '100% Client-side & Offline'
            )}
          </p>
        </div>
      </div>
    </aside>
  );
};
