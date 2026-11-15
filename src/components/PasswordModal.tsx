import React, { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordModalProps {
  mode: 'set' | 'unlock';
  targetLabel: string;
  currentPassword: string;
  strongPasswordRequired: boolean;
  onClose: () => void;
  onSubmitSet: (nextPassword: string) => void;
  onSuccessUnlock: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  mode,
  targetLabel,
  currentPassword,
  strongPasswordRequired,
  onClose,
  onSubmitSet,
  onSuccessUnlock,
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setError('');
  }, [mode, targetLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'unlock') {
      if (oldPass === currentPassword) {
        onSuccessUnlock();
      } else {
        setError('Invalid password. Verify the configured BIOS password and try again.');
      }
      return;
    }

    if (currentPassword && oldPass !== currentPassword) {
      setError('Current password does not match.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPass.length > 0 && strongPasswordRequired) {
      const hasUpper = /[A-Z]/.test(newPass);
      const hasLower = /[a-z]/.test(newPass);
      if (newPass.length < 8 || !hasUpper || !hasLower) {
        setError(
          'Strong Password policy is ON: requires 8+ characters with both uppercase and lowercase letters.'
        );
        return;
      }
    }

    onSubmitSet(newPass);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-md border border-[#334155] bg-[#161d27] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#273242] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <h2 id="password-modal-title" className="text-base font-semibold text-slate-100">
              {mode === 'unlock' ? `Unlock ${targetLabel}` : `Configure ${targetLabel}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close password modal"
            className="rounded p-1 text-slate-400 hover:bg-[#222d3d] hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 p-5">
          {mode === 'unlock' ? (
            <>
              <p className="text-[13px] text-slate-300">
                Enter the BIOS {targetLabel} to unlock firmware modifications.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Enter Password
                </label>
                <input
                  type="password"
                  autoFocus
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full rounded border border-[#334155] bg-[#121820] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                />
              </div>
            </>
          ) : (
            <>
              {currentPassword && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full rounded border border-[#334155] bg-[#121820] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  New Password (leave blank to clear)
                </label>
                <input
                  type="password"
                  autoFocus={!currentPassword}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="e.g. dell123"
                  className="w-full rounded border border-[#334155] bg-[#121820] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full rounded border border-[#334155] bg-[#121820] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#273242] bg-[#121820] px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#334155] bg-[#1c2532] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-[#007DB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7]"
          >
            {mode === 'unlock' ? 'Unlock BIOS' : 'Save Password'}
          </button>
        </div>
      </form>
    </div>
  );
};
