import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  X,
  Edit2,
  Trash2,
  Star,
  Phone,
  PhoneCall,
  Copy,
  Landmark,
  Eye,
  EyeOff,
  History,
  Send,
  FileText,
  Calendar,
} from 'lucide-react';

export const ContactDetailModal: React.FC = () => {
  const {
    selectedContactId,
    setSelectedContactId,
    contacts,
    getPhonesForContact,
    getBanksForContact,
    getInteractionsForContact,
    folders,
    toggleFavorite,
    deleteContact,
    setContactToEdit,
    setIsFormModalOpen,
    copyToClipboard,
    triggerPhoneCall,
    addManualInteraction,
  } = useApp();

  const [revealBanks, setRevealBanks] = useState<Record<string, boolean>>({});
  const [newLogNote, setNewLogNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!selectedContactId) return null;

  const contact = contacts.find(c => c.id === selectedContactId);
  if (!contact) return null;

  const phones = getPhonesForContact(contact.id);
  const banks = getBanksForContact(contact.id);
  const interactions = getInteractionsForContact(contact.id);
  const folder = folders.find(f => f.id === contact.folderId);

  const toggleRevealBank = (bankId: string) => {
    setRevealBanks(prev => ({ ...prev, [bankId]: !prev[bankId] }));
  };

  const handleEdit = () => {
    setContactToEdit(contact);
    setIsFormModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteContact(contact.id);
    setSelectedContactId(null);
  };

  const handleAddLogNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;
    await addManualInteraction(contact.id, newLogNote.trim());
    setNewLogNote('');
  };

  const initials =
    contact.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* iOS Drag Handle on Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header Bar */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${
                  contact.avatarColor || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xs shrink-0`}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {contact.name}
                </h2>
                {folder && (
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 shrink-0"
                    style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                  >
                    {folder.name}
                  </span>
                )}
              </div>
              {contact.relationship && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {contact.relationship}
                </p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => toggleFavorite(contact.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title={contact.isFavorite ? 'Remove star' : 'Star contact'}
              aria-label={contact.isFavorite ? 'Remove star' : 'Star contact'}
            >
              <Star
                className={`w-5 h-5 ${
                  contact.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title="Edit contact"
              aria-label="Edit contact"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedContactId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain">
          {/* Section: Multiple Phone Numbers */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                Phone Numbers ({phones.length})
              </h3>
            </div>

            {phones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No phone numbers recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {phones.map(phone => (
                  <div
                    key={phone.id}
                    className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {phone.label}
                        </span>
                        {phone.isPrimary && (
                          <Badge variant="glow" className="text-[10px] py-0 px-1.5">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {phone.number}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(phone.number, `${phone.label} number`, contact.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 shadow-2xs transition active:scale-90"
                        title="Copy number"
                        aria-label="Copy number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerPhoneCall(phone, contact)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition active:scale-90"
                        title="Call number"
                        aria-label="Call number"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Multiple Bank Accounts */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-500" />
                Bank Accounts ({banks.length})
              </h3>
            </div>

            {banks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No bank accounts recorded.</p>
            ) : (
              <div className="space-y-3">
                {banks.map(bank => {
                  const isRevealed = revealBanks[bank.id];
                  const displayAcc = isRevealed
                    ? bank.accountNumber
                    : bank.accountNumber.length > 8
                    ? `•••• •••• ${bank.accountNumber.slice(-4)}`
                    : bank.accountNumber;

                  return (
                    <div
                      key={bank.id}
                      className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                              {bank.bankName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Holder: <span className="text-slate-700 dark:text-slate-300 font-medium">{bank.accountHolder}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleRevealBank(bank.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition active:scale-90"
                            title={isRevealed ? 'Hide account number' : 'Show full account number'}
                            aria-label="Toggle reveal account number"
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(bank.accountNumber, `${bank.bankName} account number`, contact.id, true)}
                            className="text-xs gap-1.5 min-h-[36px]"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copy Acc #</span>
                          </Button>
                        </div>
                      </div>

                      {/* Account Number Box */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-xs sm:text-sm tracking-wider font-semibold text-slate-900 dark:text-white truncate mr-2">
                          {displayAcc}
                        </span>
                        {bank.currency && (
                          <Badge variant="secondary" className="text-[10px]">
                            {bank.currency}
                          </Badge>
                        )}
                      </div>

                      {/* Branch & Routing if available */}
                      {bank.branch && (
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                          <span className="truncate mr-2 font-mono text-[11px]">{bank.branch}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.branch!, 'Branch / Routing code', contact.id, true)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 font-medium"
                          >
                            Copy Branch
                          </button>
                        </div>
                      )}

                      {bank.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          "{bank.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Notes */}
          {contact.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Notes & Reminders
              </h3>
              <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 p-3.5 sm:p-4 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </div>
            </div>
          )}

          {/* Section: Activity & Interaction History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-2.5">
              <History className="w-4 h-4 text-purple-500" />
              Interaction History ({interactions.length})
            </h3>

            {/* Quick manual note logger */}
            <form onSubmit={handleAddLogNote} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newLogNote}
                onChange={e => setNewLogNote(e.target.value)}
                placeholder="Log a note or call summary..."
                className="flex-1 px-3.5 py-2 rounded-xl text-base sm:text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newLogNote.trim()}
                className="gap-1.5 shrink-0 min-h-[36px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </Button>
            </form>

            {interactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No past calls or copied events yet.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {interactions.map(log => {
                  const dateStr = new Date(log.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 break-words">{log.notes}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Delete Contact & Info with iOS Safe Area */}
        <div className="p-3 sm:p-4 px-4 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>

          <div>
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs text-rose-500 font-medium">Delete?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="min-h-[36px]"
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="min-h-[36px]"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition active:scale-95 py-2 px-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Contact</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
