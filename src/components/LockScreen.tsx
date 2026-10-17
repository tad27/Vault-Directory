import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Fingerprint, Delete, KeyRound, AlertCircle } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { unlockWithPasscode, unlockWithBiometrics, settings, biometricsSupported } = useApp();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAttemptUnlock = useCallback(async (codeToTest: string) => {
    if (!codeToTest) return;
    setIsVerifying(true);
    setError(false);
    const success = await unlockWithPasscode(codeToTest);
    setIsVerifying(false);
    if (!success) {
      setError(true);
      setPasscode('');
    }
  }, [unlockWithPasscode]);

  const handleDigit = (digit: string) => {
    if (passcode.length < 8) {
      const next = passcode + digit;
      setPasscode(next);
      setError(false);
      // Auto-submit if 4 or 6 digits
      if (next.length === 4 || next.length === 6) {
        handleAttemptUnlock(next);
      }
    }
  };

  const handleDelete = () => {
    setPasscode(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometrics = async () => {
    setIsVerifying(true);
    const success = await unlockWithBiometrics();
    setIsVerifying(false);
    if (!success) {
      setError(true);
    }
  };

  // Keyboard support for typing PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleAttemptUnlock(passcode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode, handleAttemptUnlock]);

  // Attempt biometrics on mount if enabled
  useEffect(() => {
    if (settings.useBiometrics && biometricsSupported) {
      handleBiometrics();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-lg shadow-indigo-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Vault Locked</h2>
        <p className="text-xs text-slate-400 mb-8">Enter your master PIN to access contacts and bank accounts</p>

        {/* PIN Dots Display */}
        <div className={`flex items-center gap-3 mb-6 ${error ? 'animate-bounce text-red-400' : ''}`}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                passcode.length > idx
                  ? 'bg-indigo-500 scale-110 shadow-md shadow-indigo-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN. Try again.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              disabled={isVerifying}
              className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-semibold text-slate-100 shadow-sm active:scale-95 transition flex items-center justify-center"
            >
              {d}
            </button>
          ))}
          {/* Biometrics button or empty */}
          {settings.useBiometrics && biometricsSupported ? (
            <button
              onClick={handleBiometrics}
              disabled={isVerifying}
              className="h-14 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/40 text-indigo-400 active:scale-95 transition flex items-center justify-center"
              title="Unlock with Biometrics"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
          ) : (
            <div className="h-14" />
          )}

          <button
            onClick={() => handleDigit('0')}
            disabled={isVerifying}
            className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-semibold text-slate-100 shadow-sm active:scale-95 transition flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            disabled={isVerifying}
            className="h-14 rounded-2xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-400 active:scale-95 transition flex items-center justify-center"
            title="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Direct manual submit if custom length */}
        {passcode.length > 0 && passcode.length !== 4 && passcode.length !== 6 && (
          <button
            onClick={() => handleAttemptUnlock(passcode)}
            disabled={isVerifying}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-md transition active:scale-95 mb-4"
          >
            {isVerifying ? 'Checking...' : 'Unlock Vault'}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Local client-side encryption active</span>
        </div>
      </div>
    </div>
  );
};
