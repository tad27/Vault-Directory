import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PhoneNumberLabel } from '../types';
import {
  X,
  Plus,
  Trash2,
  Phone,
  Landmark,
  Star,
  Check,
  Folder as FolderIcon,
  User,
  Sparkles,
} from 'lucide-react';

const COMMON_BANKS = [
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'Revolut',
  'Monzo',
  'Barclays',
  'HSBC',
  'US Bank',
  'Fidelity',
  'Charles Schwab',
];

const PHONE_LABELS: PhoneNumberLabel[] = [
  'Mobile',
  'Home',
  'Work',
  'WhatsApp',
  'Main',
  'Personal',
  'Other',
];

const COLOR_PRESETS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-600 to-fuchsia-600',
  'from-slate-600 to-slate-800',
];

export const ContactFormModal: React.FC = () => {
  const {
    isFormModalOpen,
    setIsFormModalOpen,
    contactToEdit,
    folders,
    getPhonesForContact,
    getBanksForContact,
    saveContactFull,
    setIsFolderModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [avatarColor, setAvatarColor] = useState(COLOR_PRESETS[0]);

  // Dynamic Repeater: Phone Numbers
  const [phones, setPhones] = useState<
    Array<{ id?: string; label: string; number: string; isPrimary: boolean }>
  >([]);

  // Dynamic Repeater: Bank Accounts
  const [banks, setBanks] = useState<
    Array<{
      id?: string;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      branch: string;
      notes: string;
      currency: string;
    }>
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setRelationship(contactToEdit.relationship || '');
      setNotes(contactToEdit.notes || '');
      setFolderId(contactToEdit.folderId || null);
      setIsFavorite(contactToEdit.isFavorite || false);
      setAvatarColor(contactToEdit.avatarColor || COLOR_PRESETS[0]);

      const existingPhones = getPhonesForContact(contactToEdit.id);
      setPhones(
        existingPhones.length > 0
          ? existingPhones.map(p => ({
              id: p.id,
              label: p.label,
              number: p.number,
              isPrimary: !!p.isPrimary,
            }))
          : [{ label: 'Mobile', number: '', isPrimary: true }]
      );

      const existingBanks = getBanksForContact(contactToEdit.id);
      setBanks(
        existingBanks.length > 0
          ? existingBanks.map(b => ({
              id: b.id,
              bankName: b.bankName,
              accountNumber: b.accountNumber,
              accountHolder: b.accountHolder,
              branch: b.branch || '',
              notes: b.notes || '',
              currency: b.currency || 'USD',
            }))
          : []
      );
    } else {
      // New Contact defaults
      setName('');
      setRelationship('');
      setNotes('');
      setFolderId(null);
      setIsFavorite(false);
      setAvatarColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
      setPhones([{ label: 'Mobile', number: '', isPrimary: true }]);
      setBanks([]);
    }
    setErrors({});
  }, [contactToEdit, isFormModalOpen, getPhonesForContact, getBanksForContact]);

  if (!isFormModalOpen) return null;

  // Phone list handlers
  const handleAddPhone = () => {
    setPhones(prev => [...prev, { label: 'Mobile', number: '', isPrimary: prev.length === 0 }]);
  };

  const handlePhoneChange = (index: number, field: string, value: string | boolean) => {
    setPhones(prev => {
      const updated = [...prev];
      if (field === 'isPrimary' && value === true) {
        return updated.map((p, idx) => ({ ...p, isPrimary: idx === index }));
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemovePhone = (index: number) => {
    setPhones(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // Bank list handlers
  const handleAddBank = () => {
    setBanks(prev => [
      ...prev,
      {
        bankName: '',
        accountNumber: '',
        accountHolder: name.trim() || '',
        branch: '',
        notes: '',
        currency: 'USD',
      },
    ]);
  };

  const handleBankChange = (index: number, field: string, value: string) => {
    setBanks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveBank = (index: number) => {
    setBanks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Contact name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveContactFull(
        {
          id: contactToEdit?.id,
          name: name.trim(),
          relationship: relationship.trim(),
          notes: notes.trim(),
          folderId: folderId || null,
          isFavorite,
          avatarColor,
        },
        phones,
        banks
      );
      setIsFormModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Failed to save contact.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white shadow-xs`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {contactToEdit ? 'Edit Contact' : 'New Contact'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store multiple numbers, bank details & labels
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {errors.general}
            </div>
          )}

          {/* Primary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g., Eleanor Vance"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Relationship / Title
              </label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="e.g., Mom, Brother, Designer"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Folder / Label
                </label>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(true)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  + New Label
                </button>
              </div>
              <select
                value={folderId || ''}
                onChange={e => setFolderId(e.target.value || null)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">(None / General)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Favorite */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Avatar Palette
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarColor(col)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${col} transition transform ${
                      avatarColor === col ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
              <span>{isFavorite ? 'Starred Favorite' : 'Mark as Favorite'}</span>
            </button>
          </div>

          {/* Section: Multiple Phone Numbers Repeater */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-500" />
                Phone Numbers
              </h3>
              <button
                type="button"
                onClick={handleAddPhone}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Number</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {phones.map((phone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <select
                    value={phone.label}
                    onChange={e => handlePhoneChange(idx, 'label', e.target.value)}
                    className="w-28 px-2.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {PHONE_LABELS.map(lbl => (
                      <option key={lbl} value={lbl}>
                        {lbl}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={phone.number}
                    onChange={e => handlePhoneChange(idx, 'number', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() => handlePhoneChange(idx, 'isPrimary', true)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                      phone.isPrimary
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                    title="Set as primary calling number"
                  >
                    {phone.isPrimary ? 'Primary' : 'Make Primary'}
                  </button>

                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 transition"
                      title="Remove number"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Multiple Bank Accounts Repeater */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-500" />
                Bank Accounts
              </h3>
              <button
                type="button"
                onClick={handleAddBank}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank Account</span>
              </button>
            </div>

            {banks.length === 0 ? (
              <div
                onClick={handleAddBank}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center cursor-pointer hover:border-emerald-500/50 transition group"
              >
                <Landmark className="w-6 h-6 mx-auto mb-1.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No bank accounts added
                </p>
                <p className="text-[11px] text-slate-400">Click to add account number & routing details</p>
              </div>
            ) : (
              <div className="space-y-3">
                {banks.map((bank, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Account #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(idx)}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          list="common-banks"
                          value={bank.bankName}
                          onChange={e => handleBankChange(idx, 'bankName', e.target.value)}
                          placeholder="e.g. Chase Bank"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={bank.accountNumber}
                          onChange={e => handleBankChange(idx, 'accountNumber', e.target.value)}
                          placeholder="e.g. 4820 9182 3019"
                          className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bank.accountHolder}
                          onChange={e => handleBankChange(idx, 'accountHolder', e.target.value)}
                          placeholder={name || 'Account Holder'}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Branch / Routing / IBAN
                        </label>
                        <input
                          type="text"
                          value={bank.branch}
                          onChange={e => handleBankChange(idx, 'branch', e.target.value)}
                          placeholder="Routing: 021000021"
                          className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={bank.notes}
                        onChange={e => handleBankChange(idx, 'notes', e.target.value)}
                        placeholder="Optional memo (e.g., Shared rent account, Wire transfers only)"
                        className="w-full px-3 py-1.5 rounded-xl text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <datalist id="common-banks">
              {COMMON_BANKS.map(b => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Section: Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              General Notes & Reminders
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Important notes, addresses, birthdays, or preferences..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : contactToEdit ? 'Save Changes' : 'Create Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
