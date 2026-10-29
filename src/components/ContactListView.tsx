import React from 'react';
import { useApp } from '../context/AppContext';
import { ContactCard } from './ContactCard';
import { ActivityLogView } from './ActivityLogView';
import { AnalyticsView } from './AnalyticsView';
import { Button } from './ui/button';
import {
  Plus,
  Search,
  X,
  UserX,
  SlidersHorizontal,
} from 'lucide-react';

export const ContactListView: React.FC = () => {
  const {
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
    setIsFilterModalOpen,
    filterOptions,
    updateFilterOptions,
    resetFilterOptions,
    activeFilterCount,
  } = useApp();

  if (activeFilter === 'activity') {
    return <ActivityLogView />;
  }

  if (activeFilter === 'analytics') {
    return <AnalyticsView />;
  }

  // Determine current view folder if active
  const currentFolder = folders.find(f => f.id === activeFolderId);

  const handleAddNew = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Mobile Filter Trigger Button & Active Summary */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs active:scale-95 transition ${
            activeFilterCount > 0
              ? 'bg-theme-subtle border-theme-primary text-theme-primary ring-2 ring-theme-primary/20'
              : 'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}
          aria-label="Filter contacts by labels and relationships"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-theme-primary" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-theme-primary text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      {/* Quick Folder / Label Filter Chips for instantaneous filtering (Hidden on mobile) */}
      {folders.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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

      {/* Active Filters Pill Bar (when filters or search are active) */}
      {(activeFilterCount > 0 || Boolean(searchQuery.trim())) && (
        <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-2xl bg-theme-subtle border border-theme-primary/30 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Active:</span>
          </span>

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium">
              <Search className="w-3 h-3 text-theme-primary" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">"{searchQuery.trim()}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-rose-500"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterOptions.folderId !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
              <span>Label: {filterOptions.folderId === 'none' ? 'No Label' : folders.find(f => f.id === filterOptions.folderId)?.name || 'Folder'}</span>
              <button
                type="button"
                onClick={() => updateFilterOptions({ folderId: null })}
                className="hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterOptions.relationship !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
              <span>Tag: {filterOptions.relationship}</span>
              <button
                type="button"
                onClick={() => updateFilterOptions({ relationship: null })}
                className="hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterOptions.sortBy !== 'name-asc' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
              <span>Sort: {filterOptions.sortBy}</span>
              <button
                type="button"
                onClick={() => updateFilterOptions({ sortBy: 'name-asc' })}
                className="hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              resetFilterOptions();
              setSearchQuery('');
            }}
            className="text-[11px] font-semibold text-rose-500 hover:underline ml-auto"
          >
            Clear all
          </button>
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
