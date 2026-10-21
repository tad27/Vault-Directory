import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PhoneNumberLabel } from '../types';
import { Button } from './ui/button';
import {
  X,
  Plus,
  Trash2,
  Phone,
  Landmark,
  Star,
  Check,
  User,
} from 'lucide-react';

const PHONE_LABELS: PhoneNumberLabel[] = [
  'Mobile',
  'Home',
  'Work',
  'WhatsApp',
  'Main',
  'Personal',
  'Other',
];

const AVATAR_PALETTES = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-600 to-fuchsia-600',
  'from-slate-600 to-slate-800',
];

const COMMON_BANKS = [
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'US Bank',
  'PNC Bank',
  'Barclays',
  'HSBC',
  'Revolut',
  'Wise',
  'Monzo',
];

export const ContactFormModal: React.FC = () => {
  const {
    isFormModalOpen,
    setIsFormModalOpen,
    contactToEdit,
    saveContactFull,
    folders,
    setIsFolderModalOpen,
    getPhonesForContact,
    getBanksForContact,
  } = useApp();

  // Basic contact state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_PALETTES[0]);

  // Phone numbers repeater
  const [phones, setPhones] = useState<
    Array<{ id?: string; label: string; number: string; isPrimary?: boolean }>
  >([]);

  // Bank accounts repeater
  const [banks, setBanks] = useState<
    Array<{
      id?: string;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      branch?: string;
      notes?: string;
      currency?: string;
    }>
  >([]);

  // Errors & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editing or opening modal
  useEffect(() => {
    if (!isFormModalOpen) return;

    if (contactToEdit) {
      setName(contactToEdit.name);
      setRelationship(contactToEdit.relationship || '');
      setFolderId(contactToEdit.folderId || null);
      setNotes(contactToEdit.notes || '');
      setIsFavorite(Boolean(contactToEdit.isFavorite));
      setAvatarColor(contactToEdit.avatarColor || AVATAR_PALETTES[0]);

      const existingPhones = getPhonesForContact(contactToEdit.id);
      const existingBanks = getBanksForContact(contactToEdit.id);

      setPhones(
        existingPhones.length > 0
          ? existingPhones.map(p => ({
              id: p.id,
              label: p.label,
              number: p.number,
              isPrimary: p.isPrimary,
            }))
          : [{ label: 'Mobile', number: '', isPrimary: true }]
      );

      setBanks(
        existingBanks.map(b => ({
          id: b.id,
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountHolder: b.accountHolder,
          branch: b.branch,
          notes: b.notes,
          currency: b.currency,
        }))
      );
    } else {
      // Default new contact
      setName('');
      setRelationship('');
      setFolderId(null);
      setNotes('');
      setIsFavorite(false);
      setAvatarColor(
        AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)]
      );
      setPhones([{ label: 'Mobile', number: '', isPrimary: true }]);
      setBanks([]);
    }
    setErrors({});
  }, [contactToEdit, isFormModalOpen, getPhonesForContact, getBanksForContact]);

  if (!isFormModalOpen) return null;

  // Phone handlers
  const handleAddPhone = () => {
    setPhones(prev => [
      ...prev,
      { label: 'Mobile', number: '', isPrimary: prev.length === 0 },
    ]);
  };

  const handlePhoneChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setPhones(prev =>
      prev.map((p, idx) => {
        if (idx === index) {
          if (field === 'isPrimary') {
            return { ...p, isPrimary: true };
          }
          return { ...p, [field]: value };
        }
        if (field === 'isPrimary') {
          return { ...p, isPrimary: false };
        }
        return p;
      })
    );
  };

  const handleRemovePhone = (index: number) => {
    setPhones(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some(p => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // Bank handlers
  const handleAddBank = () => {
    setBanks(prev => [
      ...prev,
      {
        bankName: '',
        accountNumber: '',
        accountHolder: name || '',
        branch: '',
        notes: '',
        currency: 'USD',
      },
    ]);
  };

  const handleBankChange = (index: number, field: string, value: string) => {
    setBanks(prev =>
      prev.map((b, idx) => (idx === index ? { ...b, [field]: value } : b))
    );
  };

  const handleRemoveBank = (index: number) => {
    setBanks(prev => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const validPhones = phones.filter(p => p.number.trim());
    const validBanks = banks.filter(
      b => b.bankName.trim() && b.accountNumber.trim()
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveContactFull(
        {
          id: contactToEdit?.id,
          name: name.trim(),
          relationship: relationship.trim() || undefined,
          folderId: folderId || undefined,
          notes: notes.trim() || undefined,
          isFavorite,
          avatarColor,
        },
        validPhones.map((p, i) => ({
          ...p,
          isPrimary: validPhones.length === 1 ? true : Boolean(p.isPrimary),
        })),
        validBanks.map(b => ({
          ...b,
          accountHolder: b.accountHolder.trim() || name.trim(),
        }))
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* iOS Drag Handle on Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white shadow-xs shrink-0`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {contactToEdit ? 'Edit Contact' : 'New Contact'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store multiple numbers, bank details & labels
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFormModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PALETTES.map((palette, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarColor(palette)}
                      className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${palette} flex items-center justify-center transition active:scale-90 ${
                        avatarColor === palette
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {avatarColor === palette && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                    isFavorite
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span>{isFavorite ? 'Favorite Starred' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>

            {/* Section: Multiple Phone Numbers Repeater */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  Phone Numbers ({phones.length})
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
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <select
                        value={phone.label}
                        onChange={e => handlePhoneChange(idx, 'label', e.target.value)}
                        className="w-24 sm:w-28 px-2.5 py-2 rounded-xl text-base sm:text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none shrink-0"
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
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-base sm:text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePhoneChange(idx, 'isPrimary', true)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-[10px] font-semibold transition ${
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
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Multiple Bank Accounts Repeater */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-500" />
                  Bank Accounts ({banks.length})
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
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Account #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBank(idx)}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 py-1"
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
                            className="w-full px-3 py-2 rounded-xl text-base sm:text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                            className="w-full px-3 py-2 rounded-xl text-base sm:text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                            className="w-full px-3 py-2 rounded-xl text-base sm:text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
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
                            className="w-full px-3 py-2 rounded-xl text-base sm:text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={bank.notes}
                          onChange={e => handleBankChange(idx, 'notes', e.target.value)}
                          placeholder="Optional memo (e.g., Shared rent account, Wire transfers only)"
                          className="w-full px-3 py-1.5 rounded-xl text-base sm:text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Sticky Submit Footer with iPhone Safe Area padding */}
          <div className="p-3 sm:p-4 px-4 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="shimmer"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 min-h-[38px] px-5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : contactToEdit ? 'Save Changes' : 'Create Contact'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
