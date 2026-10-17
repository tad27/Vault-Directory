import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  ExternalLink,
  MessageSquare,
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

  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
                  contact.avatarColor || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0`}
              >
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {contact.name}
                </h2>
                {folder && (
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800"
                    style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                  >
                    {folder.name}
                  </span>
                )}
              </div>
              {contact.relationship && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {contact.relationship}
                </p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleFavorite(contact.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={contact.isFavorite ? 'Remove star' : 'Star contact'}
            >
              <Star
                className={`w-5 h-5 ${
                  contact.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
              />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Edit contact"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedContactId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Multiple Phone Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                Phone Numbers ({phones.length})
              </h3>
            </div>

            {phones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No phone numbers recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phones.map(phone => (
                  <div
                    key={phone.id}
                    className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {phone.label}
                        </span>
                        {phone.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {phone.number}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(phone.number, `${phone.label} number`, contact.id)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 shadow-2xs transition"
                        title="Copy number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => triggerPhoneCall(phone, contact)}
                        className="p-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition active:scale-95"
                        title="Call number"
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
            <div className="flex items-center justify-between mb-3">
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
                      className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {bank.bankName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Holder: <span className="text-slate-700 dark:text-slate-300 font-medium">{bank.accountHolder}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleRevealBank(bank.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                            title={isRevealed ? 'Hide account number' : 'Show full account number'}
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(bank.accountNumber, `${bank.bankName} account number`, contact.id, true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition shadow-2xs"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copy Acc #</span>
                          </button>
                        </div>
                      </div>

                      {/* Account Number Box */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-sm tracking-wider font-semibold text-slate-900 dark:text-white">
                          {displayAcc}
                        </span>
                        {bank.currency && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {bank.currency}
                          </span>
                        )}
                      </div>

                      {/* Branch & Routing if available */}
                      {bank.branch && (
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                          <span className="truncate mr-2 font-mono">{bank.branch}</span>
                          <button
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
              <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 p-4 border border-amber-200/60 dark:border-amber-900/40 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </div>
            </div>
          )}

          {/* Section: Activity & Interaction History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-purple-500" />
              Interaction History ({interactions.length})
            </h3>

            {/* Quick manual note logger */}
            <form onSubmit={handleAddLogNote} className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newLogNote}
                onChange={e => setNewLogNote(e.target.value)}
                placeholder="Log a quick note, call summary, or payment memo..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="submit"
                disabled={!newLogNote.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </form>

            {interactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No past calls or copied events yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">{log.notes}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{dateStr}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Delete Contact & Info */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>

          <div>
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <span className="text-xs text-rose-500 font-medium">Delete contact?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition"
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
