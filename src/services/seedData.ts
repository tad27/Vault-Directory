import type { Contact, PhoneNumber, BankAccount, Folder, InteractionLog } from '../types';

export const SEED_FOLDERS: Folder[] = [
  { id: 'f-family', name: 'Family', color: '#10b981', description: 'Immediate & extended family members' },
  { id: 'f-friends', name: 'Close Friends', color: '#6366f1', description: 'Best buddies, roommates & weekend crew' },
  { id: 'f-work', name: 'Work & Projects', color: '#3b82f6', description: 'Colleagues, collaborators & clients' },
  { id: 'f-emergency', name: 'Emergency & Key', color: '#ef4444', description: 'Key contacts & medical contacts' },
];

export const SEED_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Eleanor Vance',
    relationship: 'Mom',
    notes: 'Prefers WhatsApp calls when abroad. Birthday: May 14th.',
    avatarColor: 'from-pink-500 to-rose-600',
    isFavorite: true,
    folderId: 'f-family',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    lastInteractedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'c-2',
    name: 'Marcus Sterling',
    relationship: 'Brother',
    notes: 'Split utility bills and vacation home rent with this account.',
    avatarColor: 'from-indigo-500 to-blue-600',
    isFavorite: true,
    folderId: 'f-family',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    lastInteractedAt: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'c-3',
    name: 'Sophia Chen',
    relationship: 'Best Friend & Designer',
    notes: 'Freelance UI design partner. Send quarterly project payments here.',
    avatarColor: 'from-emerald-500 to-teal-600',
    isFavorite: true,
    folderId: 'f-friends',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    lastInteractedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'c-4',
    name: 'David K. Reynolds',
    relationship: 'Architect / Project Lead',
    notes: 'Work mentor & engineering lead at HyperScale.',
    avatarColor: 'from-amber-500 to-orange-600',
    isFavorite: false,
    folderId: 'f-work',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    lastInteractedAt: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: 'c-5',
    name: 'Dr. Aris Thorne',
    relationship: 'Family Physician',
    notes: 'City Health Clinic. Office hours Tue/Thu 9am-4pm. After-hours paging available.',
    avatarColor: 'from-cyan-500 to-blue-700',
    isFavorite: true,
    folderId: 'f-emergency',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    lastInteractedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
];

export const SEED_PHONES: PhoneNumber[] = [
  // Eleanor Vance
  { id: 'p-1', contactId: 'c-1', label: 'Mobile', number: '+1 (415) 892-3401', isPrimary: true },
  { id: 'p-2', contactId: 'c-1', label: 'Home', number: '+1 (415) 332-9014', isPrimary: false },
  { id: 'p-3', contactId: 'c-1', label: 'WhatsApp', number: '+1 (415) 892-3401', isPrimary: false },
  // Marcus Sterling
  { id: 'p-4', contactId: 'c-2', label: 'Mobile', number: '+1 (212) 555-0199', isPrimary: true },
  { id: 'p-5', contactId: 'c-2', label: 'Work', number: '+1 (212) 555-8821', isPrimary: false },
  // Sophia Chen
  { id: 'p-6', contactId: 'c-3', label: 'Mobile', number: '+1 (312) 720-4491', isPrimary: true },
  { id: 'p-7', contactId: 'c-3', label: 'Personal', number: '+1 (312) 809-1223', isPrimary: false },
  // David Reynolds
  { id: 'p-8', contactId: 'c-4', label: 'Work', number: '+1 (650) 419-7023', isPrimary: true },
  { id: 'p-9', contactId: 'c-4', label: 'Mobile', number: '+1 (650) 902-1144', isPrimary: false },
  // Dr. Aris Thorne
  { id: 'p-10', contactId: 'c-5', label: 'Main', number: '+1 (555) 300-8800', isPrimary: true },
  { id: 'p-11', contactId: 'c-5', label: 'Other', number: '+1 (555) 300-8809', isPrimary: false },
];

export const SEED_BANKS: BankAccount[] = [
  // Eleanor Vance
  {
    id: 'b-1',
    contactId: 'c-1',
    bankName: 'Chase Bank',
    accountNumber: '4820 9182 3019',
    accountHolder: 'Eleanor Vance',
    branch: 'Routing: 021000021 / Midtown Branch',
    notes: 'Checking account for family living allowances',
    currency: 'USD',
  },
  {
    id: 'b-2',
    contactId: 'c-1',
    bankName: 'Wells Fargo',
    accountNumber: '9012 3411 7820',
    accountHolder: 'Eleanor Vance',
    branch: 'Routing: 121000247',
    notes: 'Emergency savings account',
    currency: 'USD',
  },
  // Marcus Sterling
  {
    id: 'b-3',
    contactId: 'c-2',
    bankName: 'Bank of America',
    accountNumber: '1290 8472 0019',
    accountHolder: 'Marcus Sterling',
    branch: 'Routing: 026009593 / NY Main',
    notes: 'Primary account for shared apartment rent',
    currency: 'USD',
  },
  {
    id: 'b-4',
    contactId: 'c-2',
    bankName: 'Revolut',
    accountNumber: 'REV-9921-4029',
    accountHolder: 'Marcus Sterling',
    branch: 'IBAN: GB82 REVO 0099 2140 29',
    notes: 'For international travels and group trips',
    currency: 'EUR',
  },
  // Sophia Chen
  {
    id: 'b-5',
    contactId: 'c-3',
    bankName: 'Citibank',
    accountNumber: '5510 4429 8812',
    accountHolder: 'Chen Studio LLC',
    branch: 'Routing: 021000089',
    notes: 'Design contract disbursements',
    currency: 'USD',
  },
];

export const SEED_INTERACTIONS: InteractionLog[] = [
  {
    id: 'log-1',
    contactId: 'c-1',
    contactName: 'Eleanor Vance',
    timestamp: Date.now() - 1000 * 60 * 45,
    type: 'call',
    notes: 'Placed call to Mobile: +1 (415) 892-3401 (Weekly catch-up)',
  },
  {
    id: 'log-2',
    contactId: 'c-2',
    contactName: 'Marcus Sterling',
    timestamp: Date.now() - 1000 * 60 * 120,
    type: 'copy_bank',
    notes: 'Copied Bank of America account number (Rent payment)',
  },
  {
    id: 'log-3',
    contactId: 'c-3',
    contactName: 'Sophia Chen',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    type: 'copy_phone',
    notes: 'Copied Mobile: +1 (312) 720-4491 for calendar invite',
  },
  {
    id: 'log-4',
    contactId: 'c-4',
    contactName: 'David K. Reynolds',
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    type: 'call',
    notes: 'Placed call to Work: +1 (650) 419-7023 (Architecture sync)',
  },
];
