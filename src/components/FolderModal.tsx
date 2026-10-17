import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Folder } from '../types';
import { X, Plus, Trash2, Edit2, Check, Folder as FolderIcon } from 'lucide-react';

const FOLDER_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Rose
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const FolderModal: React.FC = () => {
  const { isFolderModalOpen, setIsFolderModalOpen, folders, saveFolder, deleteFolder, contacts } = useApp();
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isFolderModalOpen) return null;

  const handleStartEdit = (f: Folder) => {
    setEditingFolderId(f.id);
    setName(f.name);
    setColor(f.color);
    setDescription(f.description || '');
    setError('');
  };

  const handleResetForm = () => {
    setEditingFolderId(null);
    setName('');
    setColor(FOLDER_COLORS[0]);
    setDescription('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    await saveFolder({
      id: editingFolderId || undefined as unknown as string,
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    });

    handleResetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FolderIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Manage Folders & Labels
            </h2>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setIsFolderModalOpen(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Folders List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your Labels ({folders.length})
            </label>
            {folders.map(f => {
              const count = contacts.filter(c => c.folderId === f.id).length;
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: f.color }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{count} contacts assigned</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(f)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title="Edit label"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFolder(f.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      title="Delete label"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {editingFolderId ? 'Edit Label' : 'Create New Label'}
            </h3>

            {error && <p className="text-[11px] text-rose-500">{error}</p>}

            <div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. VIP, Doctors, Contractors"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Badge Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {FOLDER_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition transform ${
                      color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingFolderId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingFolderId ? 'Update Label' : 'Create Label'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
