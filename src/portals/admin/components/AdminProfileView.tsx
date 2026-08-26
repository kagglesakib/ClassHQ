import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Mail, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  UserCheck, 
  Server, 
  Key, 
  Activity, 
  Globe 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export const AdminProfileView: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess(res.message || 'Administrative password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError('Failed to change password. Please verify your current credentials.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating administrative password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Admin Profile Banner Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 text-white rounded-3xl border border-rose-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg ring-2 ring-rose-400/40 shrink-0">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {user.fullName || 'Chief Governor'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 inline-flex items-center gap-1 shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Super Administrator
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1 shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  System Active
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-200/80 flex items-center gap-2 flex-wrap">
                <span>Role: <strong className="text-white font-bold">Chief Governor</strong></span>
                <span>•</span>
                <span>Scope: <strong className="text-white font-bold">All Batches & Sections</strong></span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shrink-0 flex items-center gap-3">
            <Server className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 block">ClassHQ HQ Node</span>
              <span className="text-xs font-bold text-white">Full System Authority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative System Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-rose-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Email Account</span>
          </div>
          <p className="text-xs font-bold text-slate-900 truncate">{user.email || 'admin@classhq.edu'}</p>
          <span className="text-[10px] text-slate-500 font-medium block">Institutional primary identity</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-rose-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Key className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Privilege & Rights</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Root Governance / Approval Override</p>
          <span className="text-[10px] text-slate-500 font-medium block">Full database & role control</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-rose-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Activity className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Enforcement</span>
          </div>
          <p className="text-xs font-bold text-slate-900">High-Level Auth Tokens</p>
          <span className="text-[10px] text-slate-500 font-medium block">Encrypted session credentials</span>
        </div>
      </div>

      {/* Admin Portal Change Password Security Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 text-white shadow-xl border border-rose-800/60 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-rose-800/80 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">System Security & Change Password</h3>
              <p className="text-xs text-rose-200/80">Update Chief Administrator portal authentication credentials</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-400/30">
            Governor Security
          </span>
        </div>

        {passwordError && (
          <div className="relative z-10 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="relative z-10 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-900/80 border border-rose-700/60 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-900/80 border border-rose-700/60 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-900/80 border border-rose-700/60 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Admin Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-white" />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
