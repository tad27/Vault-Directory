import React from 'react';
import type { Contact } from '../types';
import { useApp } from '../context/AppContext';
import { SearchHighlight } from './SearchHighlight';
import { CardSpotlight } from './ui/aceternity';
import { Badge } from './ui/badge';
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

  const initials =
    contact.name
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid opening detail if user clicked an action button
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedContactId(contact.id);
  };

  return (
    <CardSpotlight
      onClick={handleCardClick}
      className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-transform select-none"
    >
      <div>
        {/* Header: Avatar, Name, Relationship, Folder & Star */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${
                  contact.avatarColor || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-xs shrink-0`}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-theme-primary transition-colors truncate">
                <SearchHighlight text={contact.name} query={searchQuery} />
              </h3>
              {contact.relationship ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  <SearchHighlight text={contact.relationship} query={searchQuery} />
                </p>
              ) : folder ? (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                  <span className="truncate">{folder.name}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {folder && contact.relationship && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800"
                style={{
                  backgroundColor: `${folder.color}15`,
                  color: folder.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                <span>{folder.name}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleFavorite(contact.id)}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title={contact.isFavorite ? 'Remove star' : 'Star favorite'}
              aria-label={contact.isFavorite ? 'Remove star' : 'Star favorite'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Primary Phone Item */}
        {primaryPhone ? (
          <div className="mt-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 p-2.5 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-theme-subtle flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-theme-primary" />
              </div>
              <div className="truncate text-xs min-w-0">
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mr-1.5 shrink-0">
                  {primaryPhone.label}
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                  <SearchHighlight text={primaryPhone.number} query={searchQuery} />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(primaryPhone.number, `${primaryPhone.label} number`, contact.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-theme-primary hover:bg-white dark:hover:bg-slate-700 transition active:scale-90"
                title="Copy phone number"
                aria-label="Copy phone number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => triggerPhoneCall(primaryPhone, contact)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition active:scale-90"
                title="Call now"
                aria-label="Call phone number"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400 italic">No phone numbers</div>
        )}

        {/* Primary Bank Item */}
        {primaryBank && (
          <div className="mt-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 p-2.5 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Landmark className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="truncate text-xs min-w-0">
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mr-1.5 shrink-0">
                  {primaryBank.bankName}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
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
              type="button"
              onClick={() => copyToClipboard(primaryBank.accountNumber, `${primaryBank.bankName} account`, contact.id, true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition shrink-0 active:scale-90"
              title="Copy account number"
              aria-label="Copy account number"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer: Multi-item pill counters & Last activity */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          {phones.length > 1 && (
            <Badge variant="secondary" className="text-[10px] py-0 px-2">
              {phones.length} phones
            </Badge>
          )}
          {banks.length > 1 && (
            <Badge variant="secondary" className="text-[10px] py-0 px-2">
              {banks.length} banks
            </Badge>
          )}
          {contact.lastInteractedAt && (
            <span className="inline-flex items-center gap-1 font-medium text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {getRelativeTime(contact.lastInteractedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors font-medium text-xs">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </CardSpotlight>
  );
};
