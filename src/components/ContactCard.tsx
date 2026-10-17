import React from 'react';
import type { Contact } from '../types';
import { useApp } from '../context/AppContext';
import { SearchHighlight } from './SearchHighlight';
import {
  Star,
  Phone,
  Copy,
  Landmark,
  PhoneCall,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface Props {
  contact: Contact;
}

export const ContactCard: React.FC<Props> = ({ contact }) => {
  const {
    getPhonesForContact,
    getBanksForContact,
    folders,
    toggleFavorite,
    setSelectedContactId,
    copyToClipboard,
    triggerPhoneCall,
    searchQuery,
  } = useApp();

  const phones = getPhonesForContact(contact.id);
  const banks = getBanksForContact(contact.id);
  const folder = folders.find(f => f.id === contact.folderId);

  const primaryPhone = phones.find(p => p.isPrimary) || phones[0];
  const primaryBank = banks[0];

  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';

  // Format relative timestamp
  const getRelativeTime = (timestamp?: number) => {
    if (!timestamp) return null;
    const diffMin = Math.round((Date.now() - timestamp) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid clicking if clicking action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedContactId(contact.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Avatar, Name, Relationship, Star */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                  contact.avatarColor || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}
              >
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <SearchHighlight text={contact.name} query={searchQuery} />
                </h3>
              </div>
              {contact.relationship && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <SearchHighlight text={contact.relationship} query={searchQuery} />
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {folder && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800/80"
                style={{
                  backgroundColor: `${folder.color}15`,
                  color: folder.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                {folder.name}
              </span>
            )}
            <button
              onClick={() => toggleFavorite(contact.id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Primary Phone Number Item */}
        {primaryPhone ? (
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="truncate text-xs">
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mr-1.5">
                  {primaryPhone.label}
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  <SearchHighlight text={primaryPhone.number} query={searchQuery} />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(primaryPhone.number, `${primaryPhone.label} number`, contact.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition"
                title="Copy phone number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerPhoneCall(primaryPhone, contact)}
                className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                title="Call now"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400 italic">No phone numbers</div>
        )}

        {/* Primary Bank Account Item */}
        {primaryBank && (
          <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Landmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <div className="truncate text-xs">
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mr-1.5">
                  {primaryBank.bankName}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  <SearchHighlight
                    text={
                      primaryBank.accountNumber.length > 8
                        ? `•••• ${primaryBank.accountNumber.slice(-4)}`
                        : primaryBank.accountNumber
                    }
                    query={searchQuery}
                  />
                </span>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(primaryBank.accountNumber, `${primaryBank.bankName} account`, contact.id, true)}
              className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition shrink-0"
              title="Copy account number"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer: Multi-item pill counters & Last activity */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          {phones.length > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {phones.length} phones
            </span>
          )}
          {banks.length > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {banks.length} banks
            </span>
          )}
          {contact.lastInteractedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getRelativeTime(contact.lastInteractedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
