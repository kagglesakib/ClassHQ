'use client';

import React, { useState } from 'react';
import { Lock, Save, CheckCircle2, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentPasswordForm() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg('Please enter your current access password.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and password confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          sid: user?.sid,
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update access credentials');
      }

      setSuccessMsg(data.message || 'Security passcode updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating access credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-rose-950/80 to-red-950 p-5 sm:p-7 rounded-3xl border-2 border-rose-500/40 shadow-2xl space-y-5 max-w-xl mx-auto text-white animate-fadeIn" id="student-password-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-rose-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 shadow-inner shrink-0">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
              Account Security & Credentials
            </h3>
            <p className="text-[11px] sm:text-xs text-rose-200/80 mt-0.5 font-medium">
              Update your security passcode to maintain account access protection.
            </p>
          </div>
        </div>
        <span className="p-2 bg-rose-950 text-rose-300 rounded-xl font-mono text-xs font-extrabold border border-rose-500/40 tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <KeyRound className="w-3.5 h-3.5 text-rose-400" />
          Credentials
        </span>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-rose-300 uppercase tracking-wider block">
            Current Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showOldPass ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="Enter current password"
              className="w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-slate-900/90 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all shadow-inner"
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowOldPass(!showOldPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white cursor-pointer p-1 transition-colors"
              title={showOldPass ? 'Hide password' : 'Show password'}
            >
              {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              type={showNewPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password (min. 4 characters)"
              className="w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-slate-900/90 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all shadow-inner"
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white cursor-pointer p-1 transition-colors"
              title={showNewPass ? 'Hide password' : 'Show password'}
            >
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              type={showConfirmPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-type new password to confirm"
              className={`w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-slate-900/90 border rounded-xl text-xs font-bold text-rose-100 placeholder:text-rose-300/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 transition-all shadow-inner ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-rose-500/90 bg-rose-950/40'
                  : 'border-rose-500/40'
              }`}
            />
            <Lock className="w-4 h-4 text-rose-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-white cursor-pointer p-1 transition-colors"
              title={showConfirmPass ? 'Hide password' : 'Show password'}
            >
              {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] py-3 mt-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-98 border border-rose-400/40"
        >
          <Save className="w-4 h-4 text-rose-200" />
          <span>{isSubmitting ? 'Updating Passcode...' : 'Update Security Passcode'}</span>
        </button>
      </form>
    </div>
  );
}

