import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { registerBiometricCredential } from '../services/webauthn';
import { ThemeColorPicker } from './ThemeColorPicker';
import {
  X,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Shield,
  Check,
  AlertTriangle,
  HardDrive,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    toggleTheme,
    updateSettings,
    setMasterPasscode,
    disableMasterPasscode,
    biometricsSupported,
    resetToSampleData,
    clearAllDirectoryData,
    exportEncryptedVault,
    exportPlainVault,
    importVault,
    showToast,
  } = useApp();

  // Pin setup states
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Backup states
  const [backupPassword, setBackupPassword] = useState('');
  const [isExportingEncrypted, setIsExportingEncrypted] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [isImportNeedsPassword, setIsImportNeedsPassword] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsModalOpen) return null;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError('PINs do not match');
      return;
    }

    await setMasterPasscode(pinInput);
    setPinInput('');
    setPinConfirm('');
    setPinError('');
    setIsSettingPin(false);
  };

  const handleToggleBiometrics = async () => {
    if (!settings.useBiometrics) {
      const credId = await registerBiometricCredential();
      if (credId) {
        await updateSettings({ useBiometrics: true });
        showToast('Biometric unlock enabled', 'success');
      } else {
        showToast('Biometric registration was not completed', 'warning');
      }
    } else {
      await updateSettings({ useBiometrics: false });
      showToast('Biometrics disabled', 'info');
    }
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportEncrypted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupPassword) return;
    try {
      const data = await exportEncryptedVault(backupPassword);
      triggerDownload(data, `VaultDirectory-encrypted-${new Date().toISOString().slice(0, 10)}.vault.json`);
      setIsExportingEncrypted(false);
      setBackupPassword('');
      showToast('Encrypted backup downloaded', 'success');
    } catch {
      showToast('Failed to export backup', 'warning');
    }
  };

  const handleExportPlain = async () => {
    try {
      const data = await exportPlainVault();
      triggerDownload(data, `VaultDirectory-plain-${new Date().toISOString().slice(0, 10)}.json`);
      showToast('Plain JSON backup downloaded', 'success');
    } catch {
      showToast('Failed to export backup', 'warning');
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setImportFileContent(content);
      try {
        const parsed = JSON.parse(content);
        if (parsed.format === 'encrypted-v1') {
          setIsImportNeedsPassword(true);
        } else {
          setIsImportNeedsPassword(false);
        }
      } catch {
        showToast('Selected file is not valid JSON', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!importFileContent) return;
    const res = await importVault(importFileContent, importPassword);
    if (res.success) {
      setImportFileContent(null);
      setImportFileName('');
      setImportPassword('');
      setIsImportNeedsPassword(false);
      setIsSettingsModalOpen(false);
    } else {
      showToast(res.error || 'Import failed', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* iOS Drag Handle on Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Settings & Privacy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local-first encryption, passcode lock & database backup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Section: Appearance & Theme */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Appearance & Theme
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between dark and light color themes
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (settings.isDarkMode) toggleTheme();
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  !settings.isDarkMode
                    ? 'bg-white border-theme-primary text-theme-primary shadow-xs ring-2 ring-theme-primary'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                  <p className="text-[10px] text-slate-400">Crisp clean surfaces</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!settings.isDarkMode) toggleTheme();
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  settings.isDarkMode
                    ? 'bg-slate-900 border-theme-primary text-theme-primary shadow-xs ring-2 ring-theme-primary'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-[10px] text-slate-400">Deep slate tones</p>
                </div>
              </button>
            </div>

            {/* Accent Color Themes */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
              <ThemeColorPicker variant="full" />
            </div>
          </div>

          {/* Section 1: Passcode & Lock Screen */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Master Passcode Lock
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Require a PIN to unlock your contacts and bank accounts
                  </p>
                </div>
              </div>

              {settings.isLockEnabled ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Enabled
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                  Disabled
                </span>
              )}
            </div>

            {settings.isLockEnabled ? (
              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Auto-lock timer:</span>
                  <select
                    value={settings.autoLockMinutes}
                    onChange={e => updateSettings({ autoLockMinutes: Number(e.target.value) })}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value={0}>Immediately on background</option>
                    <option value={1}>1 minute idle</option>
                    <option value={5}>5 minutes idle</option>
                    <option value={15}>15 minutes idle</option>
                    <option value={30}>30 minutes idle</option>
                  </select>
                </div>

                {biometricsSupported && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Fingerprint className="w-4 h-4 text-indigo-500" />
                      Touch ID / Face ID Biometric Unlock
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleBiometrics}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.useBiometrics ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.useBiometrics ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsSettingPin(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Change PIN
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    onClick={disableMasterPasscode}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    Disable Passcode
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {!isSettingPin ? (
                  <button
                    onClick={() => setIsSettingPin(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Key className="w-4 h-4" />
                    <span>Set Master Passcode</span>
                  </button>
                ) : null}
              </div>
            )}

            {/* Set PIN Form */}
            {isSettingPin && (
              <form onSubmit={handleSavePin} className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {settings.isLockEnabled ? 'Update PIN' : 'Create PIN'}
                </h4>
                {pinError && <p className="text-[11px] text-rose-500">{pinError}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="New PIN (4-8 digits)"
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={pinConfirm}
                    onChange={e => setPinConfirm(e.target.value)}
                    placeholder="Confirm PIN"
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingPin(false);
                      setPinInput('');
                      setPinConfirm('');
                      setPinError('');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    Save PIN
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Backup & Restore (JSON) */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                Database Backup & Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export an encrypted file to sync manually between phone and laptop
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsExportingEncrypted(true)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Encrypted Backup</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">AES-GCM 256-bit protected</p>
              </button>

              <button
                type="button"
                onClick={handleExportPlain}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-left transition"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Plain JSON Backup</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Standard raw JSON export</p>
              </button>
            </div>

            {/* Encrypted Export Form */}
            {isExportingEncrypted && (
              <form onSubmit={handleExportEncrypted} className="space-y-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 animate-in fade-in">
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  Choose a passphrase to encrypt your backup file:
                </p>
                <input
                  type="password"
                  required
                  value={backupPassword}
                  onChange={e => setBackupPassword(e.target.value)}
                  placeholder="Master Passphrase"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportingEncrypted(false);
                      setBackupPassword('');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Download Encrypted File
                  </button>
                </div>
              </form>
            )}

            {/* Restore File */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.vault"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>Restore from Backup File</span>
              </button>

              {importFileContent && (
                <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    File selected: <span className="font-mono">{importFileName}</span>
                  </p>
                  {isImportNeedsPassword && (
                    <input
                      type="password"
                      value={importPassword}
                      onChange={e => setImportPassword(e.target.value)}
                      placeholder="Enter decryption password for backup"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setImportFileContent(null);
                        setImportFileName('');
                      }}
                      className="px-3 py-1 text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteImport}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                    >
                      Confirm Restore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Data Management */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Management
            </h3>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Reset with Sample Data
                </p>
                <p className="text-[11px] text-slate-400">
                  Reloads demo directory with friends, families, multi-numbers & bank accounts
                </p>
              </div>
              <button
                type="button"
                onClick={resetToSampleData}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Reset Demo</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-rose-500">
                  Wipe All Directory Data
                </p>
                <p className="text-[11px] text-slate-400">
                  Permanently deletes all contacts, numbers, and banks from local IndexedDB
                </p>
              </div>

              {confirmWipe ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      clearAllDirectoryData();
                      setConfirmWipe(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    onClick={() => setConfirmWipe(false)}
                    className="px-2 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmWipe(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold hover:bg-rose-100 transition shrink-0"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
