import React from 'react';
import { useApp } from '../context/AppContext';
import { ResponsiveSheetModal } from './ui/aceternity';
import { Button } from './ui/button';
import {
  SlidersHorizontal,
  Folder as FolderIcon,
  Tag,
  ArrowUpDown,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

export const ContactFilterModal: React.FC = () => {
  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    searchQuery,
    setSearchQuery,
    filterOptions,
    updateFilterOptions,
    resetFilterOptions,
    activeFilterCount,
    folders,
    contacts,
    allRelationships,
    filteredContacts,
  } = useApp();

  const unlabeledCount = contacts.filter(c => !c.folderId).length;
  const hasActiveFiltersOrSearch = activeFilterCount > 0 || Boolean(searchQuery.trim());

  return (
    <ResponsiveSheetModal
      isOpen={isFilterModalOpen}
      onClose={() => setIsFilterModalOpen(false)}
      title="Search & Filters"
      subtitle="Find contacts by keyword, folder label, or relationship"
      icon={
        <div className="w-10 h-10 rounded-2xl bg-theme-subtle flex items-center justify-center text-theme-primary shrink-0 shadow-xs">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
      }
      maxWidth="max-w-xl"
      headerRight={
        hasActiveFiltersOrSearch ? (
          <button
            type="button"
            onClick={() => {
              resetFilterOptions();
              setSearchQuery('');
            }}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        ) : null
      }
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Search Input inside Filter Dialog */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-theme-primary" />
            <span>Search Directory</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts, phones, bank accounts..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme-primary/30 focus:border-theme-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {/* Section 1: Labels & Folders */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-theme-primary" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Folders & Labels
              </label>
            </div>
            {filterOptions.folderId !== null && (
              <button
                type="button"
                onClick={() => updateFilterOptions({ folderId: null })}
                className="text-[11px] font-semibold text-theme-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => updateFilterOptions({ folderId: null })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border flex items-center gap-1.5 ${
                filterOptions.folderId === null
                  ? 'bg-theme-primary text-white border-transparent shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>All Labels</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterOptions.folderId === null ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {contacts.length}
              </span>
            </button>

            {folders.map(f => {
              const count = contacts.filter(c => c.folderId === f.id).length;
              const isSelected = filterOptions.folderId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateFilterOptions({ folderId: isSelected ? null : f.id })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'shadow-xs ring-2 ring-theme-primary text-white'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: f.color, borderColor: f.color }
                      : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : f.color }}
                  />
                  <span>{f.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {unlabeledCount > 0 && (
              <button
                type="button"
                onClick={() => updateFilterOptions({ folderId: filterOptions.folderId === 'none' ? null : 'none' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border flex items-center gap-1.5 ${
                  filterOptions.folderId === 'none'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>No Label</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500">
                  {unlabeledCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Relationships */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-theme-primary" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Relationship Tag
              </label>
            </div>
            {filterOptions.relationship !== null && (
              <button
                type="button"
                onClick={() => updateFilterOptions({ relationship: null })}
                className="text-[11px] font-semibold text-theme-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-36 overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => updateFilterOptions({ relationship: null })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border ${
                filterOptions.relationship === null
                  ? 'bg-theme-primary text-white border-transparent shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Any Relationship
            </button>

            {allRelationships.map(rel => {
              const isSelected = filterOptions.relationship?.toLowerCase() === rel.toLowerCase();
              const count = contacts.filter(c => c.relationship?.toLowerCase() === rel.toLowerCase()).length;
              return (
                <button
                  key={rel}
                  type="button"
                  onClick={() => updateFilterOptions({ relationship: isSelected ? null : rel })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-theme-subtle text-theme-primary border-theme-primary ring-2 ring-theme-primary'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{rel}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Sort Order */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-theme-primary" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sort Contacts
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'name-asc', label: 'Name (A → Z)' },
              { id: 'name-desc', label: 'Name (Z → A)' },
              { id: 'recent', label: 'Recently Active' },
              { id: 'newest', label: 'Newest Added' },
              { id: 'interactions', label: 'Most Contacted' },
            ].map(item => {
              const isSelected = filterOptions.sortBy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateFilterOptions({ sortBy: item.id as typeof filterOptions.sortBy })}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition active:scale-95 ${
                    isSelected
                      ? 'bg-theme-primary text-white border-transparent shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredContacts.length}</span> of {contacts.length} contacts
        </p>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilterOptions}
              className="text-xs"
            >
              Reset
            </Button>
          )}

          <Button
            type="button"
            variant="shimmer"
            size="sm"
            onClick={() => setIsFilterModalOpen(false)}
            className="min-h-[36px] px-4 font-bold"
          >
            <span>Done</span>
          </Button>
        </div>
      </div>
    </ResponsiveSheetModal>
  );
};
