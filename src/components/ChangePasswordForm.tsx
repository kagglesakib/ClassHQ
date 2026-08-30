import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Key } from 'lucide-react';

interface ChangePasswordFormProps {
  sid?: string;
  email?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChangePasswordForm({ sid, email, onSuccess, onCancel }: ChangePasswordFormProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword.trim()) {
      setErrorMsg('Please enter your current (old) password.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('Please enter your new password.');
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMsg('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
          sid,
          email,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to change password');
        return;
      }

      setSuccessMsg(data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error connecting to server.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-rose-950/80 to-red-950 rounded-3xl p-6 sm:p-8 border-2 border-rose-500/40 shadow-2xl max-w-lg mx-auto space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-rose-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 shadow-inner shrink-0">
            <Key className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-lg tracking-tight">
              Account Security Credentials
            </h3>
            <p className="text-xs text-rose-200/80 font-medium mt-0.5">
              Update account passcode using current credential verification.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/90 border border-rose-500/60 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Old Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-rose-300 uppercase tracking-wider block">
            Current Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? 'text' : 'password'}
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-rose-500/40 rounded-2xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 transition-all shadow-inner"
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showOldPassword ? 'Hide password' : 'Show password'}
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-rose-300 uppercase tracking-wider block">
            New Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 4 characters)"
              className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-rose-500/40 rounded-2xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 transition-all shadow-inner"
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-rose-300 uppercase tracking-wider block">
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            {confirmPassword && newPassword !== confirmPassword && (
              <span className="text-[10px] text-rose-400 font-extrabold">Passwords do not match</span>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <span className="text-[10px] text-emerald-400 font-extrabold">✓ Passwords match</span>
            )}
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password to confirm"
              className={`w-full pl-10 pr-11 py-3 bg-slate-900/90 border rounded-2xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 transition-all shadow-inner ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-rose-500/90 bg-rose-950/40'
                  : 'border-rose-500/40'
              }`}
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-500/30">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-rose-400/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-rose-200" />
                <span>Update Credentials</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
