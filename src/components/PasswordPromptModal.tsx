/**
 * Document Password Lock / Unlock Modal
 */

import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, X } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSettingPassword?: boolean;
  onSuccess: (password: string) => void;
  expectedHash?: string;
  onRemovePassword?: () => void;
}

// Simple deterministic hash for on-device document locks
export async function hashPassword(pass: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pass + '_lipiword_salt');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  isSettingPassword = false,
  onSuccess,
  expectedHash,
  onRemovePassword
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSettingPassword) {
      if (password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const hash = await hashPassword(password);
      onSuccess(hash);
      onClose();
    } else {
      if (!expectedHash) return;
      const enteredHash = await hashPassword(password);
      if (enteredHash === expectedHash) {
        onSuccess(enteredHash);
        onClose();
      } else {
        setError('Incorrect password. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              {isSettingPassword ? 'Set Document Password' : 'Password Protected'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSettingPassword ? (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter 4+ characters"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">This document is locked. Enter password to view & edit.</p>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {isSettingPassword ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {isSettingPassword ? 'Protect Document' : 'Unlock Document'}
            </button>

            {isSettingPassword && onRemovePassword && expectedHash && (
              <button
                type="button"
                onClick={() => {
                  onRemovePassword();
                  onClose();
                }}
                className="w-full py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Remove Password Protection
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
