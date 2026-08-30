'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, X, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PendingSignupCard } from './notifications/PendingSignupCard';
import { UserLogItem } from '../types';

interface SignupNotificationPanelProps {
  onApprovalChanged?: () => void;
}

export default function SignupNotificationPanel({ onApprovalChanged }: SignupNotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserLogItem[]>([]);
  const [suggestedNextSid, setSuggestedNextSid] = useState<string>('S101');
  const [loading, setLoading] = useState(false);
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [sidInputs, setSidInputs] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const list: UserLogItem[] = Array.isArray(data) ? data : data.users || [];
      setUsers(list);
      if (data.suggestedNextSid) {
        setSuggestedNextSid(data.suggestedNextSid);
      }

      // Initialize SIDs for pending users
      const initialSids: Record<string, string> = {};
      list.forEach((u) => {
        if (u.isApproved !== 'yes') {
          initialSids[u.email] = u.sid || data.suggestedNextSid || 'S101';
        }
      });
      setSidInputs((prev) => ({ ...initialSids, ...prev }));
    } catch (err) {
      // Ignore transient network errors during background polling
    }
  };

  // Poll for new signups every 20 seconds
  useEffect(() => {
    fetchPendingUsers();
    const interval = setInterval(fetchPendingUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const pendingUsers = users.filter(
    (u) =>
      u.userType === 'student' &&
      (u.isApproved === 'pending' ||
        (u.isApproved !== 'yes' && u.isApproved !== 'no' && u.isApproved !== 'disapproved'))
  );
  const pendingCount = pendingUsers.length;

  const handleSidChange = (email: string, val: string) => {
    setSidInputs((prev) => ({ ...prev, [email]: val.toUpperCase() }));
  };

  const handleAutoFillSid = (email: string) => {
    setSidInputs((prev) => ({ ...prev, [email]: suggestedNextSid }));
  };

  const handleApprove = async (u: UserLogItem) => {
    const assignedSid = sidInputs[u.email]?.trim() || u.sid || suggestedNextSid;
    if (!assignedSid) {
      setErrorMsg('Please enter an SID to approve student.');
      return;
    }

    setProcessingEmail(u.email);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: u.email,
          sid: assignedSid,
          isApproved: 'yes',
          userType: 'student',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve student');
      }

      setSuccessMsg(`Approved ${u.name} with SID ${assignedSid}!`);
      await fetchPendingUsers();
      if (onApprovalChanged) onApprovalChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval failed');
    } finally {
      setProcessingEmail(null);
    }
  };

  const handleDisapprove = async (u: UserLogItem) => {
    setProcessingEmail(u.email);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: u.email,
          isApproved: 'no',
          userType: 'student',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to disapprove student');
      }

      setSuccessMsg(`Disapproved signup request for ${u.name}.`);
      await fetchPendingUsers();
      if (onApprovalChanged) onApprovalChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Disapproval failed');
    } finally {
      setProcessingEmail(null);
    }
  };

  return (
    <div className="relative shrink-0" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchPendingUsers();
        }}
        className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-md ${
          pendingCount > 0
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-black shadow-amber-500/20'
            : 'bg-slate-900 text-amber-300 hover:text-white border-amber-500/40 hover:bg-amber-950/60'
        }`}
        title={`New Student Registration Requests (${pendingCount})`}
      >
        <Bell className={`w-4 h-4 ${pendingCount > 0 ? 'text-slate-950 animate-bounce' : 'text-amber-400'}`} />
        {pendingCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black font-mono w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-slate-950 animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-3 right-3 top-20 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-4 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] mx-auto sm:mx-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/90 rounded-3xl shadow-2xl border-2 border-amber-500/40 z-[120] overflow-hidden flex flex-col max-h-[78vh] sm:max-h-[82vh] text-white"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 p-4 border-b border-amber-500/40 text-white flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400 shadow-xs shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h4 className="font-display font-black text-sm tracking-tight text-white truncate">
                      New Signup Requests
                    </h4>
                    {pendingCount > 0 && (
                      <span className="whitespace-nowrap shrink-0 bg-amber-500 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow-xs">
                        {pendingCount} Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-200/80 font-medium mt-0.5 truncate">Assign SID and approve or disapprove</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={fetchPendingUsers}
                  className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-200 hover:text-white transition-colors cursor-pointer"
                  title="Refresh registration requests"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banners */}
            {successMsg && (
              <div className="m-3 p-2.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold">✕</button>
              </div>
            )}

            {errorMsg && (
              <div className="m-3 p-2.5 bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-bold rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold">✕</button>
              </div>
            )}

            {/* Body List */}
            <div className="p-3 space-y-3 overflow-y-auto max-h-[60vh] divide-y divide-amber-900/30">
              {pendingUsers.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-950/80 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white">All Caught Up!</p>
                  <p className="text-[11px] text-amber-200/70 max-w-[220px] mx-auto">
                    There are no pending student registration approvals right now.
                  </p>
                </div>
              ) : (
                pendingUsers.map((u, idx) => (
                  <PendingSignupCard
                    key={u._id ? String(u._id) : `${u.email}-${idx}`}
                    user={u}
                    suggestedNextSid={suggestedNextSid}
                    sidInput={sidInputs[u.email]}
                    isProcessing={processingEmail === u.email}
                    onSidChange={handleSidChange}
                    onAutoFillSid={handleAutoFillSid}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900/90 border-t border-amber-500/30 flex items-center justify-between text-[11px] font-bold text-amber-200/80 shrink-0">
              <span>Admin Control Panel</span>
              <a 
                href="/approvals" 
                onClick={() => setIsOpen(false)} 
                className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-extrabold"
              >
                Manage All Approvals & SIDs &rarr;
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
