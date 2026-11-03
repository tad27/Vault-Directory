export type PhoneNumberLabel = 'Mobile' | 'Home' | 'Work' | 'WhatsApp' | 'Main' | 'Personal' | 'Other';

export interface PhoneNumber {
  id: string;
  contactId: string;
  label: PhoneNumberLabel | string;
  number: string;
  isPrimary?: boolean;
}

export interface BankAccount {
  id: string;
  contactId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string; // Routing, Sort Code, SWIFT, or Branch
  notes?: string;
  currency?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string; // Hex or theme color
  description?: string;
}

export interface Contact {
  id: string;
  name: string;
  relationship?: string;
  notes?: string;
  avatarUrl?: string;
  avatarColor?: string;
  isFavorite: boolean;
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
  lastInteractedAt?: number;
  notionPageId?: string; // ID of the linked Notion page
}

export type InteractionType = 'call' | 'copy_bank' | 'copy_phone' | 'note';

export interface InteractionLog {
  id: string;
  contactId: string;
  contactName: string;
  timestamp: number;
  type: InteractionType;
  notes: string;
}

export type ThemeColor = 'indigo' | 'emerald' | 'ocean' | 'amber' | 'rose' | 'purple' | 'slate';

export interface NotionSyncConfig {
  apiKey?: string;
  databaseId?: string;
  autoSync?: boolean;
  lastSyncedAt?: number;
}

export interface NotionSyncResult {
  success: boolean;
  pushedCount: number;
  pulledCount: number;
  totalNotionRecords: number;
  databaseTitle?: string;
  error?: string;
}

export interface AppSettings {
  isDarkMode: boolean;
  themeColor: ThemeColor;
  isLockEnabled: boolean;
  passcodeHash?: string; // Salted hash for verification
  passcodeSalt?: string;
  autoLockMinutes: number; // 0 for immediately on blur/close, 5, 15, etc.
  useBiometrics: boolean;
  isEncryptedStorage: boolean;
  notionConfig?: NotionSyncConfig;
}

export type FilterView = 'all' | 'favorites' | 'recents' | 'most_used' | 'folder' | 'activity' | 'analytics' | 'settings';

export interface ContactFilterOptions {
  folderId: string | null; // null for any, 'none' for unlabeled, or folder ID
  relationship: string | null; // null for any, or specific relationship
  favoritesOnly: boolean;
  hasBank: boolean;
  hasPhone: boolean;
  hasNotes: boolean;
  sortBy: 'name-asc' | 'name-desc' | 'recent' | 'newest' | 'interactions';
}

export const DEFAULT_FILTER_OPTIONS: ContactFilterOptions = {
  folderId: null,
  relationship: null,
  favoritesOnly: false,
  hasBank: false,
  hasPhone: false,
  hasNotes: false,
  sortBy: 'name-asc',
};
