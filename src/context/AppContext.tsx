import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Contact, PhoneNumber, BankAccount, Folder, InteractionLog, AppSettings, FilterView } from '../types';
import * as db from '../services/db';
import { SEED_CONTACTS, SEED_PHONES, SEED_BANKS, SEED_FOLDERS, SEED_INTERACTIONS } from '../services/seedData';
import { hashPasscode, generateSalt, encryptObject, decryptObject, type EncryptedPayload } from '../services/crypto';
import { verifyBiometricCredential, isBiometricsAvailable } from '../services/webauthn';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppContextType {
  // Data
  contacts: Contact[];
  phoneNumbers: PhoneNumber[];
  bankAccounts: BankAccount[];
  folders: Folder[];
  interactions: InteractionLog[];
  settings: AppSettings;
  isLoading: boolean;

  // View state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: FilterView;
  setActiveFilter: (filter: FilterView) => void;
  activeFolderId: string | null;
  setActiveFolderId: (folderId: string | null) => void;

  // Selection & Modals
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
  contactToEdit: Contact | null;
  setContactToEdit: (contact: Contact | null) => void;
  isFolderModalOpen: boolean;
  setIsFolderModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Security & Lock
  isLocked: boolean;
  unlockWithPasscode: (passcode: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockVault: () => void;
  setMasterPasscode: (newPasscode: string) => Promise<void>;
  disableMasterPasscode: () => Promise<void>;
  biometricsSupported: boolean;

  // Actions
  saveContactFull: (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    phones: Array<Omit<PhoneNumber, 'id' | 'contactId'> & { id?: string }>,
    banks: Array<Omit<BankAccount, 'id' | 'contactId'> & { id?: string }>
  ) => Promise<string>;
  deleteContact: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  saveFolder: (folder: Folder) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;

  // Interaction logs & Quick actions
  copyToClipboard: (text: string, label: string, contactId?: string, isBank?: boolean) => Promise<void>;
  triggerPhoneCall: (phone: PhoneNumber, contact: Contact) => void;
  addManualInteraction: (contactId: string, notes: string) => Promise<void>;

  // Filtered contacts
  filteredContacts: Contact[];
  getPhonesForContact: (contactId: string) => PhoneNumber[];
  getBanksForContact: (contactId: string) => BankAccount[];
  getInteractionsForContact: (contactId: string) => InteractionLog[];

  // Settings & Sync
  toggleTheme: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetToSampleData: () => Promise<void>;
  clearAllDirectoryData: () => Promise<void>;
  exportEncryptedVault: (password: string) => Promise<string>;
  exportPlainVault: () => Promise<string>;
  importVault: (content: string, password?: string) => Promise<{ success: boolean; error?: string }>;

  // Feedback Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [interactions, setInteractions] = useState<InteractionLog[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    let initialDark = true;
    try {
      const stored = localStorage.getItem('vault_theme');
      if (stored !== null) initialDark = stored === 'dark';
    } catch {}
    return {
      isDarkMode: initialDark,
      isLockEnabled: false,
      autoLockMinutes: 5,
      useBiometrics: false,
      isEncryptedStorage: false,
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  // Navigation & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterView>('all');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Modals
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToast({ id, message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load Initial Data from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedFolders, fetchedContacts, fetchedPhones, fetchedBanks, fetchedLogs] =
        await Promise.all([
          db.getSettings(),
          db.getAllFolders(),
          db.getAllContacts(),
          db.getAllPhoneNumbers(),
          db.getAllBankAccounts(),
          db.getAllInteractions(),
        ]);

      // If database is completely empty on very first visit, seed realistic initial data
      if (fetchedContacts.length === 0 && fetchedFolders.length === 0) {
        for (const f of SEED_FOLDERS) await db.saveFolder(f);
        for (const c of SEED_CONTACTS) await db.saveContact(c);
        for (const c of SEED_CONTACTS) {
          const phones = SEED_PHONES.filter(p => p.contactId === c.id);
          const banks = SEED_BANKS.filter(b => b.contactId === c.id);
          await db.savePhoneNumbersForContact(c.id, phones);
          await db.saveBankAccountsForContact(c.id, banks);
        }
        for (const log of SEED_INTERACTIONS) await db.logInteraction(log);

        setFolders(SEED_FOLDERS);
        setContacts(SEED_CONTACTS);
        setPhoneNumbers(SEED_PHONES);
        setBankAccounts(SEED_BANKS);
        setInteractions(SEED_INTERACTIONS);
      } else {
        setFolders(fetchedFolders);
        setContacts(fetchedContacts);
        setPhoneNumbers(fetchedPhones);
        setBankAccounts(fetchedBanks);
        setInteractions(fetchedLogs);
      }

      const localTheme = localStorage.getItem('vault_theme');
      if (localTheme !== null) {
        fetchedSettings.isDarkMode = localTheme === 'dark';
      }
      setSettingsState(fetchedSettings);

      // Lock on initial boot if passcode lock enabled
      if (fetchedSettings.isLockEnabled && fetchedSettings.passcodeHash) {
        setIsLocked(true);
      }
    } catch (err) {
      console.error('Failed to load local database:', err);
      showToast('Error loading local vault data', 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
    isBiometricsAvailable().then(setBiometricsSupported);
  }, [refreshAllData]);

  // Apply Dark Mode class to <html> and update theme-color meta
  useEffect(() => {
    const root = document.documentElement;
    if (settings.isDarkMode) {
      root.classList.add('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#0f172a');
    } else {
      root.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#f8fafc');
    }
  }, [settings.isDarkMode]);

  // Auto-lock on blur or timer if enabled
  useEffect(() => {
    if (!settings.isLockEnabled || isLocked) return;

    let timeoutId: number | null = null;
    const lockTimer = () => {
      if (settings.autoLockMinutes > 0) {
        if (timeoutId) window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setIsLocked(true);
          showToast('App locked due to inactivity', 'info');
        }, settings.autoLockMinutes * 60 * 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && settings.autoLockMinutes === 0) {
        setIsLocked(true);
      }
    };

    window.addEventListener('mousemove', lockTimer);
    window.addEventListener('keydown', lockTimer);
    window.addEventListener('touchstart', lockTimer);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    lockTimer();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('mousemove', lockTimer);
      window.removeEventListener('keydown', lockTimer);
      window.removeEventListener('touchstart', lockTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.isLockEnabled, settings.autoLockMinutes, isLocked, showToast]);

  // Lock & Unlock
  const unlockWithPasscode = async (passcode: string): Promise<boolean> => {
    if (!settings.passcodeHash || !settings.passcodeSalt) {
      setIsLocked(false);
      return true;
    }
    const enteredHash = await hashPasscode(passcode, settings.passcodeSalt);
    if (enteredHash === settings.passcodeHash) {
      setIsLocked(false);
      showToast('Vault unlocked', 'success');
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const verified = await verifyBiometricCredential();
    if (verified) {
      setIsLocked(false);
      showToast('Vault unlocked with Biometrics', 'success');
      return true;
    }
    return false;
  };

  const lockVault = () => {
    if (settings.isLockEnabled) {
      setIsLocked(true);
      showToast('Vault locked', 'info');
    }
  };

  const setMasterPasscode = async (newPasscode: string) => {
    const salt = generateSalt();
    const hash = await hashPasscode(newPasscode, salt);
    const updated: AppSettings = {
      ...settings,
      isLockEnabled: true,
      passcodeHash: hash,
      passcodeSalt: salt,
    };
    await db.saveSettings(updated);
    setSettingsState(updated);
    showToast('Passcode protection enabled', 'success');
  };

  const disableMasterPasscode = async () => {
    const updated: AppSettings = {
      ...settings,
      isLockEnabled: false,
      passcodeHash: undefined,
      passcodeSalt: undefined,
    };
    await db.saveSettings(updated);
    setSettingsState(updated);
    setIsLocked(false);
    showToast('Passcode lock disabled', 'info');
  };

  const toggleTheme = async () => {
    const nextMode = !settings.isDarkMode;
    const updated = { ...settings, isDarkMode: nextMode };
    setSettingsState(updated);
    try {
      localStorage.setItem('vault_theme', nextMode ? 'dark' : 'light');
    } catch {}
    if (nextMode) {
      document.documentElement.classList.add('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#0f172a');
    } else {
      document.documentElement.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#f8fafc');
    }
    await db.saveSettings(updated);
    showToast(nextMode ? 'Switched to Dark Mode' : 'Switched to Light Mode', 'info');
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    if (newSettings.isDarkMode !== undefined) {
      try {
        localStorage.setItem('vault_theme', newSettings.isDarkMode ? 'dark' : 'light');
      } catch {}
    }
    await db.saveSettings(updated);
    setSettingsState(updated);
    showToast('Settings saved', 'success');
  };

  // Contacts CRUD
  const saveContactFull = async (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    phones: Array<Omit<PhoneNumber, 'id' | 'contactId'> & { id?: string }>,
    banks: Array<Omit<BankAccount, 'id' | 'contactId'> & { id?: string }>
  ): Promise<string> => {
    const contactId = contactData.id || `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    const newContact: Contact = {
      id: contactId,
      name: contactData.name.trim(),
      relationship: contactData.relationship?.trim() || '',
      notes: contactData.notes || '',
      avatarUrl: contactData.avatarUrl,
      avatarColor:
        contactData.avatarColor ||
        ['from-indigo-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'][
          Math.floor(Math.random() * 5)
        ],
      isFavorite: contactData.isFavorite ?? false,
      folderId: contactData.folderId || null,
      createdAt: contactData.id ? (contacts.find(c => c.id === contactData.id)?.createdAt || now) : now,
      updatedAt: now,
      lastInteractedAt: contactData.id ? contacts.find(c => c.id === contactData.id)?.lastInteractedAt : undefined,
    };

    const finalPhones: PhoneNumber[] = phones
      .filter(p => p.number.trim().length > 0)
      .map((p, idx) => ({
        id: p.id || `p-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        contactId,
        label: p.label || 'Mobile',
        number: p.number.trim(),
        isPrimary: p.isPrimary ?? (idx === 0),
      }));

    const finalBanks: BankAccount[] = banks
      .filter(b => b.bankName.trim().length > 0 || b.accountNumber.trim().length > 0)
      .map((b, idx) => ({
        id: b.id || `b-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        contactId,
        bankName: b.bankName.trim(),
        accountNumber: b.accountNumber.trim(),
        accountHolder: b.accountHolder?.trim() || newContact.name,
        branch: b.branch?.trim() || '',
        notes: b.notes?.trim() || '',
        currency: b.currency || 'USD',
      }));

    await db.saveContact(newContact);
    await db.savePhoneNumbersForContact(contactId, finalPhones);
    await db.saveBankAccountsForContact(contactId, finalBanks);

    await refreshAllData();
    showToast(contactData.id ? 'Contact updated' : 'Contact created', 'success');
    return contactId;
  };

  const deleteContact = async (id: string) => {
    const target = contacts.find(c => c.id === id);
    await db.deleteContact(id);
    if (selectedContactId === id) setSelectedContactId(null);
    await refreshAllData();
    showToast(`Deleted ${target?.name || 'contact'}`, 'info');
  };

  const toggleFavorite = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    const updated = { ...contact, isFavorite: !contact.isFavorite, updatedAt: Date.now() };
    await db.saveContact(updated);
    setContacts(prev => prev.map(c => (c.id === id ? updated : c)));
    showToast(updated.isFavorite ? `Starred ${contact.name}` : `Unstarred ${contact.name}`, 'info');
  };

  // Folders
  const saveFolder = async (folder: Folder) => {
    const folderId = folder.id || `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newFolder = { ...folder, id: folderId };
    await db.saveFolder(newFolder);
    await refreshAllData();
    showToast('Folder saved', 'success');
  };

  const deleteFolder = async (folderId: string) => {
    await db.deleteFolder(folderId);
    if (activeFolderId === folderId) setActiveFolderId(null);
    await refreshAllData();
    showToast('Folder deleted', 'info');
  };

  // Interactions & Clipboard
  const copyToClipboard = async (text: string, label: string, contactId?: string, isBank?: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${label}!`, 'success');

      if (contactId) {
        const contact = contacts.find(c => c.id === contactId);
        const log: InteractionLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          contactId,
          contactName: contact?.name || 'Contact',
          timestamp: Date.now(),
          type: isBank ? 'copy_bank' : 'copy_phone',
          notes: `Copied ${label}: ${text.length > 20 ? text.slice(0, 18) + '...' : text}`,
        };
        await db.logInteraction(log);
        setInteractions(prev => [log, ...prev]);
        setContacts(prev =>
          prev.map(c => (c.id === contactId ? { ...c, lastInteractedAt: log.timestamp } : c))
        );
      }
    } catch {
      showToast('Could not copy to clipboard', 'warning');
    }
  };

  const triggerPhoneCall = (phone: PhoneNumber, contact: Contact) => {
    const cleanNumber = phone.number.replace(/[^\d+]/g, '');
    const log: InteractionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      contactId: contact.id,
      contactName: contact.name,
      timestamp: Date.now(),
      type: 'call',
      notes: `Called ${phone.label}: ${phone.number}`,
    };
    db.logInteraction(log).catch(console.error);
    setInteractions(prev => [log, ...prev]);
    setContacts(prev =>
      prev.map(c => (c.id === contact.id ? { ...c, lastInteractedAt: log.timestamp } : c))
    );

    // Trigger native tel: link
    window.location.href = `tel:${cleanNumber}`;
  };

  const addManualInteraction = async (contactId: string, notes: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const log: InteractionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      contactId,
      contactName: contact.name,
      timestamp: Date.now(),
      type: 'note',
      notes,
    };
    await db.logInteraction(log);
    setInteractions(prev => [log, ...prev]);
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, lastInteractedAt: log.timestamp } : c))
    );
    showToast('Activity note logged', 'success');
  };

  // Helpers
  const getPhonesForContact = useCallback((contactId: string) => {
    return phoneNumbers.filter(p => p.contactId === contactId);
  }, [phoneNumbers]);

  const getBanksForContact = useCallback((contactId: string) => {
    return bankAccounts.filter(b => b.contactId === contactId);
  }, [bankAccounts]);

  const getInteractionsForContact = useCallback((contactId: string) => {
    return interactions.filter(i => i.contactId === contactId);
  }, [interactions]);

  // Frequency-based interaction counts for "most_used"
  const interactionCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of interactions) {
      map.set(log.contactId, (map.get(log.contactId) || 0) + 1);
    }
    return map;
  }, [interactions]);

  // Quick-Search & Filtered Contacts computation
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // 1. View / Category filter
    if (activeFilter === 'favorites') {
      result = result.filter(c => c.isFavorite);
    } else if (activeFilter === 'recents') {
      // Sort by lastInteractedAt or updatedAt
      result = result
        .filter(c => c.lastInteractedAt || c.updatedAt)
        .sort((a, b) => (b.lastInteractedAt || b.updatedAt) - (a.lastInteractedAt || a.updatedAt));
    } else if (activeFilter === 'most_used') {
      result = result.sort((a, b) => {
        const countA = interactionCountMap.get(a.id) || 0;
        const countB = interactionCountMap.get(b.id) || 0;
        return countB - countA;
      });
    } else if (activeFilter === 'folder' && activeFolderId) {
      result = result.filter(c => c.folderId === activeFolderId);
    } else {
      // Standard alphabetical sort by default
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 2. Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    return result.filter(c => {
      // Name match
      if (c.name.toLowerCase().includes(q)) return true;
      // Relationship match
      if (c.relationship?.toLowerCase().includes(q)) return true;
      // Notes match
      if (c.notes.toLowerCase().includes(q)) return true;

      // Phone numbers match
      const cPhones = phoneNumbers.filter(p => p.contactId === c.id);
      if (cPhones.some(p => p.number.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) || p.label.toLowerCase().includes(q))) {
        return true;
      }

      // Bank accounts match
      const cBanks = bankAccounts.filter(b => b.contactId === c.id);
      if (cBanks.some(b => 
        b.bankName.toLowerCase().includes(q) ||
        b.accountNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
        b.accountHolder.toLowerCase().includes(q) ||
        (b.branch && b.branch.toLowerCase().includes(q))
      )) {
        return true;
      }

      // Folder match
      const folder = folders.find(f => f.id === c.folderId);
      if (folder && folder.name.toLowerCase().includes(q)) return true;

      return false;
    });
  }, [contacts, phoneNumbers, bankAccounts, folders, activeFilter, activeFolderId, searchQuery, interactionCountMap]);

  // Reset to Sample Data
  const resetToSampleData = async () => {
    await db.resetDatabase();
    for (const f of SEED_FOLDERS) await db.saveFolder(f);
    for (const c of SEED_CONTACTS) await db.saveContact(c);
    for (const c of SEED_CONTACTS) {
      const phones = SEED_PHONES.filter(p => p.contactId === c.id);
      const banks = SEED_BANKS.filter(b => b.contactId === c.id);
      await db.savePhoneNumbersForContact(c.id, phones);
      await db.saveBankAccountsForContact(c.id, banks);
    }
    for (const log of SEED_INTERACTIONS) await db.logInteraction(log);
    await refreshAllData();
    showToast('Reset to sample directory', 'success');
  };

  // Clear all data
  const clearAllDirectoryData = async () => {
    await db.resetDatabase();
    await refreshAllData();
    showToast('All contacts & vaults cleared', 'info');
  };

  // Export encrypted backup
  const exportEncryptedVault = async (password: string): Promise<string> => {
    const rawData = await db.exportAllData();
    const encrypted = await encryptObject(rawData, password);
    const exportFile = {
      app: 'VaultDirectory',
      format: 'encrypted-v1',
      timestamp: new Date().toISOString(),
      payload: encrypted,
    };
    return JSON.stringify(exportFile, null, 2);
  };

  // Export plain JSON backup
  const exportPlainVault = async (): Promise<string> => {
    const rawData = await db.exportAllData();
    const exportFile = {
      app: 'VaultDirectory',
      format: 'plain-v1',
      timestamp: new Date().toISOString(),
      data: rawData,
    };
    return JSON.stringify(exportFile, null, 2);
  };

  // Import vault backup
  const importVault = async (content: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.app !== 'VaultDirectory') {
        return { success: false, error: 'Unrecognized backup file format.' };
      }

      if (parsed.format === 'encrypted-v1') {
        if (!password) {
          return { success: false, error: 'Password required to decrypt this backup file.' };
        }
        const decryptedData = await decryptObject<db.ExportDataPayload>(parsed.payload as EncryptedPayload, password);
        await db.importData(decryptedData, 'replace');
        await refreshAllData();
        showToast('Encrypted backup successfully restored', 'success');
        return { success: true };
      } else if (parsed.format === 'plain-v1' && parsed.data) {
        await db.importData(parsed.data, 'replace');
        await refreshAllData();
        showToast('Directory backup successfully restored', 'success');
        return { success: true };
      } else {
        return { success: false, error: 'Unsupported backup version.' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import backup.';
      return { success: false, error: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        phoneNumbers,
        bankAccounts,
        folders,
        interactions,
        settings,
        isLoading,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        activeFolderId,
        setActiveFolderId,
        selectedContactId,
        setSelectedContactId,
        isFormModalOpen,
        setIsFormModalOpen,
        contactToEdit,
        setContactToEdit,
        isFolderModalOpen,
        setIsFolderModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isLocked,
        unlockWithPasscode,
        unlockWithBiometrics,
        lockVault,
        setMasterPasscode,
        disableMasterPasscode,
        biometricsSupported,
        saveContactFull,
        deleteContact,
        toggleFavorite,
        saveFolder,
        deleteFolder,
        copyToClipboard,
        triggerPhoneCall,
        addManualInteraction,
        filteredContacts,
        getPhonesForContact,
        getBanksForContact,
        getInteractionsForContact,
        toggleTheme,
        updateSettings,
        resetToSampleData,
        clearAllDirectoryData,
        exportEncryptedVault,
        exportPlainVault,
        importVault,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
