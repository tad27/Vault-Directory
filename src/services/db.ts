import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Contact, PhoneNumber, BankAccount, Folder, InteractionLog, AppSettings } from '../types';

interface VaultDB extends DBSchema {
  contacts: {
    key: string;
    value: Contact;
    indexes: {
      'by-folder': string;
      'by-favorite': number;
      'by-created': number;
      'by-updated': number;
    };
  };
  phoneNumbers: {
    key: string;
    value: PhoneNumber;
    indexes: {
      'by-contact': string;
    };
  };
  bankAccounts: {
    key: string;
    value: BankAccount;
    indexes: {
      'by-contact': string;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      'by-name': string;
    };
  };
  interactions: {
    key: string;
    value: InteractionLog;
    indexes: {
      'by-contact': string;
      'by-timestamp': number;
    };
  };
  settings: {
    key: string;
    value: { id: string; data: AppSettings };
  };
}

const DB_NAME = 'VaultDirectory_DB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VaultDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<VaultDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VaultDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Contacts store
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactStore.createIndex('by-folder', 'folderId');
          contactStore.createIndex('by-favorite', 'isFavorite');
          contactStore.createIndex('by-created', 'createdAt');
          contactStore.createIndex('by-updated', 'updatedAt');
        }

        // Phone numbers store
        if (!db.objectStoreNames.contains('phoneNumbers')) {
          const phoneStore = db.createObjectStore('phoneNumbers', { keyPath: 'id' });
          phoneStore.createIndex('by-contact', 'contactId');
        }

        // Bank accounts store
        if (!db.objectStoreNames.contains('bankAccounts')) {
          const bankStore = db.createObjectStore('bankAccounts', { keyPath: 'id' });
          bankStore.createIndex('by-contact', 'contactId');
        }

        // Folders store
        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
          folderStore.createIndex('by-name', 'name');
        }

        // Interactions store
        if (!db.objectStoreNames.contains('interactions')) {
          const interactionStore = db.createObjectStore('interactions', { keyPath: 'id' });
          interactionStore.createIndex('by-contact', 'contactId');
          interactionStore.createIndex('by-timestamp', 'timestamp');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ================= CRUD FOR CONTACTS =================
export async function getAllContacts(): Promise<Contact[]> {
  const db = await getDB();
  return db.getAll('contacts');
}

export async function getContactById(id: string): Promise<Contact | undefined> {
  const db = await getDB();
  return db.get('contacts', id);
}

export async function saveContact(contact: Contact): Promise<void> {
  const db = await getDB();
  await db.put('contacts', contact);
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['contacts', 'phoneNumbers', 'bankAccounts', 'interactions'], 'readwrite');
  
  await tx.objectStore('contacts').delete(id);
  
  // Cascade delete phone numbers
  const phoneIndex = tx.objectStore('phoneNumbers').index('by-contact');
  let phoneCursor = await phoneIndex.openCursor(id);
  while (phoneCursor) {
    await phoneCursor.delete();
    phoneCursor = await phoneCursor.continue();
  }

  // Cascade delete bank accounts
  const bankIndex = tx.objectStore('bankAccounts').index('by-contact');
  let bankCursor = await bankIndex.openCursor(id);
  while (bankCursor) {
    await bankCursor.delete();
    bankCursor = await bankCursor.continue();
  }

  // Cascade delete interactions
  const logIndex = tx.objectStore('interactions').index('by-contact');
  let logCursor = await logIndex.openCursor(id);
  while (logCursor) {
    await logCursor.delete();
    logCursor = await logCursor.continue();
  }

  await tx.done;
}

// ================= PHONE NUMBERS =================
export async function getAllPhoneNumbers(): Promise<PhoneNumber[]> {
  const db = await getDB();
  return db.getAll('phoneNumbers');
}

export async function getPhoneNumbersForContact(contactId: string): Promise<PhoneNumber[]> {
  const db = await getDB();
  return db.getAllFromIndex('phoneNumbers', 'by-contact', contactId);
}

export async function savePhoneNumbersForContact(contactId: string, numbers: PhoneNumber[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('phoneNumbers', 'readwrite');
  const index = tx.store.index('by-contact');
  
  // Remove existing
  let cursor = await index.openCursor(contactId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Insert new
  for (const item of numbers) {
    await tx.store.put({ ...item, contactId });
  }

  await tx.done;
}

// ================= BANK ACCOUNTS =================
export async function getAllBankAccounts(): Promise<BankAccount[]> {
  const db = await getDB();
  return db.getAll('bankAccounts');
}

export async function getBankAccountsForContact(contactId: string): Promise<BankAccount[]> {
  const db = await getDB();
  return db.getAllFromIndex('bankAccounts', 'by-contact', contactId);
}

export async function saveBankAccountsForContact(contactId: string, accounts: BankAccount[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('bankAccounts', 'readwrite');
  const index = tx.store.index('by-contact');

  // Remove existing
  let cursor = await index.openCursor(contactId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Insert new
  for (const item of accounts) {
    await tx.store.put({ ...item, contactId });
  }

  await tx.done;
}

// ================= FOLDERS =================
export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return db.getAll('folders');
}

export async function saveFolder(folder: Folder): Promise<void> {
  const db = await getDB();
  await db.put('folders', folder);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['folders', 'contacts'], 'readwrite');
  await tx.objectStore('folders').delete(folderId);

  // Unlink contacts that belonged to this folder
  const contactStore = tx.objectStore('contacts');
  const index = contactStore.index('by-folder');
  let cursor = await index.openCursor(folderId);
  while (cursor) {
    const contact = cursor.value;
    contact.folderId = null;
    await cursor.update(contact);
    cursor = await cursor.continue();
  }

  await tx.done;
}

// ================= INTERACTIONS =================
export async function getAllInteractions(): Promise<InteractionLog[]> {
  const db = await getDB();
  const logs = await db.getAll('interactions');
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getInteractionsForContact(contactId: string): Promise<InteractionLog[]> {
  const db = await getDB();
  const logs = await db.getAllFromIndex('interactions', 'by-contact', contactId);
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

export async function logInteraction(log: InteractionLog): Promise<void> {
  const db = await getDB();
  await db.put('interactions', log);

  // Update contact lastInteractedAt
  const contact = await db.get('contacts', log.contactId);
  if (contact) {
    contact.lastInteractedAt = log.timestamp;
    await db.put('contacts', contact);
  }
}

export async function clearAllInteractions(): Promise<void> {
  const db = await getDB();
  await db.clear('interactions');
}

// ================= SETTINGS =================
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const res = await db.get('settings', 'app_settings');
  if (res && res.data) {
    return {
      ...res.data,
      themeColor: res.data.themeColor || 'indigo',
    };
  }
  return {
    isDarkMode: true,
    themeColor: 'indigo',
    isLockEnabled: false,
    autoLockMinutes: 5,
    useBiometrics: false,
    isEncryptedStorage: false,
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { id: 'app_settings', data: settings });
}

// ================= BACKUP & BULK EXPORT/IMPORT =================
export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  contacts: Contact[];
  phoneNumbers: PhoneNumber[];
  bankAccounts: BankAccount[];
  folders: Folder[];
  interactions: InteractionLog[];
  settings: AppSettings;
}

export async function exportAllData(): Promise<ExportDataPayload> {
  const db = await getDB();
  const [contacts, phoneNumbers, bankAccounts, folders, interactions, settings] = await Promise.all([
    db.getAll('contacts'),
    db.getAll('phoneNumbers'),
    db.getAll('bankAccounts'),
    db.getAll('folders'),
    db.getAll('interactions'),
    getSettings(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    contacts,
    phoneNumbers,
    bankAccounts,
    folders,
    interactions,
    settings,
  };
}

export async function importData(payload: ExportDataPayload, mode: 'merge' | 'replace' = 'replace'): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['contacts', 'phoneNumbers', 'bankAccounts', 'folders', 'interactions', 'settings'], 'readwrite');

  if (mode === 'replace') {
    await tx.objectStore('contacts').clear();
    await tx.objectStore('phoneNumbers').clear();
    await tx.objectStore('bankAccounts').clear();
    await tx.objectStore('folders').clear();
    await tx.objectStore('interactions').clear();
  }

  for (const c of payload.contacts || []) {
    await tx.objectStore('contacts').put(c);
  }
  for (const p of payload.phoneNumbers || []) {
    await tx.objectStore('phoneNumbers').put(p);
  }
  for (const b of payload.bankAccounts || []) {
    await tx.objectStore('bankAccounts').put(b);
  }
  for (const f of payload.folders || []) {
    await tx.objectStore('folders').put(f);
  }
  for (const i of payload.interactions || []) {
    await tx.objectStore('interactions').put(i);
  }

  if (payload.settings) {
    await tx.objectStore('settings').put({ id: 'app_settings', data: payload.settings });
  }

  await tx.done;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['contacts', 'phoneNumbers', 'bankAccounts', 'folders', 'interactions'], 'readwrite');
  await tx.objectStore('contacts').clear();
  await tx.objectStore('phoneNumbers').clear();
  await tx.objectStore('bankAccounts').clear();
  await tx.objectStore('folders').clear();
  await tx.objectStore('interactions').clear();
  await tx.done;
}
