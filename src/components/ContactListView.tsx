import React from 'react';
import { useApp } from '../context/AppContext';
import { ContactCard } from './ContactCard';
import { ActivityLogView } from './ActivityLogView';
import { AnalyticsView } from './AnalyticsView';
import {
  Users,
  Star,
  Clock,
  Zap,
  Folder as FolderIcon,
  Plus,
  Search,
  X,
  UserX,
} from 'lucide-react';

export const ContactListView: React.FC = () => {
  const {
    filteredContacts,
    activeFilter,
    activeFolderId,
    folders,
    searchQuery,
    setSearchQuery,
    setIsFormModalOpen,
    setContactToEdit,
    isLoading,
  } = useApp();

  if (activeFilter === 'activity') {
    return <ActivityLogView />;
  }

  if (activeFilter === 'analytics') {
    return <AnalyticsView />;
  }

  // Determine current view title & icon
  const currentFolder = folders.find(f => f.id === activeFolderId);

  const getViewDetails = () => {
    if (activeFilter === 'folder' && currentFolder) {
      return {
        title: currentFolder.name,
        subtitle: currentFolder.description || 'Custom labeled contacts',
        icon: (
          <span
            className="w-3.5 h-3.5 rounded-full inline-block mr-1.5"
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
      title: 'All Contacts',
      subtitle: 'Complete encrypted personal directory',
      icon: <Users className="w-5 h-5 text-indigo-500" />,
    };
  };

  const { title, subtitle, icon } = getViewDetails();

  const handleAddNew = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredContacts.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          )}

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search Feedback Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Searching across names, phones, bank accounts & routing for: <strong className="font-semibold">"{searchQuery}"</strong>
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400">
            {filteredContacts.length} {filteredContacts.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
      )}

      {/* Contacts Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No contacts found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? `No entries matched "${searchQuery}". Try searching for another name, bank, or phone number.`
              : 'There are no contacts in this view yet. Create one now to keep track of their numbers and bank details.'}
          </p>

          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            >
              Reset Search Filter
            </button>
          ) : (
            <button
              onClick={handleAddNew}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Add First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
};
