import React from 'react';
import { useApp } from '../context/AppContext';
import { ContactCard } from './ContactCard';
import { ActivityLogView } from './ActivityLogView';
import { AnalyticsView } from './AnalyticsView';
import { AnimatedSegmentedTabs } from './ui/aceternity';
import { Button } from './ui/button';
import {
  Users,
  Star,
  Clock,
  Zap,
  Plus,
  Search,
  X,
  UserX,
} from 'lucide-react';

export const ContactListView: React.FC = () => {
  const {
    contacts,
    filteredContacts,
    activeFilter,
    setActiveFilter,
    activeFolderId,
    setActiveFolderId,
    folders,
    searchQuery,
    setSearchQuery,
    setIsFormModalOpen,
    setContactToEdit,
  } = useApp();

  if (activeFilter === 'activity') {
    return <ActivityLogView />;
  }

  if (activeFilter === 'analytics') {
    return <AnalyticsView />;
  }

  const favoritesCount = contacts.filter(c => c.isFavorite).length;
  const recentCount = contacts.filter(c => c.lastInteractedAt || c.updatedAt).length;

  // Segmented tabs definition
  const smartTabs = [
    { id: 'all', label: 'All', icon: <Users className="w-3.5 h-3.5" />, count: contacts.length },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />, count: favoritesCount },
    { id: 'recents', label: 'Recent', icon: <Clock className="w-3.5 h-3.5 text-sky-500" />, count: recentCount },
    { id: 'most_used', label: 'Frequent', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveFilter(tabId as typeof activeFilter);
    setActiveFolderId(null);
  };

  // Determine current view title & icon
  const currentFolder = folders.find(f => f.id === activeFolderId);

  const getViewDetails = () => {
    if (activeFilter === 'folder' && currentFolder) {
      return {
        title: currentFolder.name,
        subtitle: currentFolder.description || 'Custom labeled contacts',
        icon: (
          <span
            className="w-3.5 h-3.5 rounded-full inline-block mr-1"
            style={{ backgroundColor: currentFolder.color }}
          />
        ),
      };
    }
    if (activeFilter === 'favorites') {
      return {
        title: 'Favorites & VIPs',
        subtitle: 'Pinned top contacts for instantaneous calling and banking',
        icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />,
      };
    }
    if (activeFilter === 'recents') {
      return {
        title: 'Recently Active',
        subtitle: 'Sorted by latest outbound calls, copied details, or updates',
        icon: <Clock className="w-5 h-5 text-sky-500" />,
      };
    }
    if (activeFilter === 'most_used') {
      return {
        title: 'Most Contacted',
        subtitle: 'Frequency-ranked contacts based on interactions & copies',
        icon: <Zap className="w-5 h-5 text-amber-500" />,
      };
    }
    return {
      title: 'Directory',
      subtitle: 'Encrypted personal directory with multiple numbers and banks',
      icon: <Users className="w-5 h-5 text-theme-primary" />,
    };
  };

  const { title, subtitle, icon } = getViewDetails();

  const handleAddNew = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar with Smart Tabs & New Contact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredContacts.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Quick Tabs Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <AnimatedSegmentedTabs
            tabs={smartTabs}
            activeTab={activeFilter === 'folder' ? '' : activeFilter}
            onTabChange={handleTabChange}
          />

          <Button
            onClick={handleAddNew}
            size="sm"
            variant="shimmer"
            className="hidden sm:inline-flex shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Quick Folder / Label Filter Chips for instantaneous filtering */}
      {folders.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              setActiveFolderId(null);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
              activeFilter === 'all' && !activeFolderId
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Labels
          </button>
          {folders.map(f => {
            const isSelected = activeFilter === 'folder' && activeFolderId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setActiveFilter('folder');
                  setActiveFolderId(f.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 border ${
                  isSelected
                    ? 'shadow-xs ring-2 ring-theme-primary'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300'
                }`}
                style={
                  isSelected
                    ? { backgroundColor: `${f.color}25`, color: f.color, borderColor: f.color }
                    : undefined
                }
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* If Folder is filtered, show folder banner with reset option */}
      {currentFolder && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: currentFolder.color }}
            />
            <span className="font-semibold text-slate-900 dark:text-white">
              Filtering by "{currentFolder.name}" label
            </span>
          </div>
          <button
            onClick={() => {
              setActiveFilter('all');
              setActiveFolderId(null);
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Show All Contacts
          </button>
        </div>
      )}

      {/* Search Feedback Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-xs">
          <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 truncate">
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">
              Results for: <strong className="font-semibold font-mono">"{searchQuery}"</strong>
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 text-xs font-semibold ml-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Contacts Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center my-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No contacts found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `No records matched "${searchQuery}". Search across names, phone numbers, or bank account digits.`
              : 'There are no contacts in this view yet. Create one now to keep track of their numbers and bank details.'}
          </p>

          {searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Reset Search Filter
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4" />
              <span>Add First Contact</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
};
