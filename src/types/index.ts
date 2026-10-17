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
  relationship?: string; // e.g. "Mom", "Brother", "Coworker", "Best Friend"
  notes: string;
  avatarUrl?: string;
  avatarColor?: string;
  isFavorite: boolean;
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
  lastInteractedAt?: number;
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

export interface AppSettings {
  isDarkMode: boolean;
  isLockEnabled: boolean;
  passcodeHash?: string; // Salted hash for verification
  passcodeSalt?: string;
  autoLockMinutes: number; // 0 for immediately on blur/close, 5, 15, etc.
  useBiometrics: boolean;
  isEncryptedStorage: boolean;
}

export type FilterView = 'all' | 'favorites' | 'recents' | 'most_used' | 'folder' | 'activity' | 'analytics' | 'settings';
