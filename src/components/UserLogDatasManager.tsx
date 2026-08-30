'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, RefreshCw, Clock, Search,
  ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import DeleteStudentModal from './DeleteStudentModal';
import { UserRow } from './userlogs/UserRow';
import { UserLogItem } from '../types';

export default function UserLogDatasManager() {
  const [users, setUsers] = useState<UserLogItem[]>([]);
  const [suggestedNextSid, setSuggestedNextSid] = useState<string>('S101');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'disapproved' | 'admin'>('all');

  const [sidInputs, setSidInputs] = useState<Record<string, string>>({});
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [deletingUserItem, setDeletingUserItem] = useState<UserLogItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cleanErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return 'An error occurred while processing.';
    const lower = msg.toLowerCase();
    if (
      lower.includes('unexpected token') ||
      lower.includes('is not valid json') ||
      lower.includes('<html>') ||
      lower.includes('<!doctype') ||
      lower.includes('syntaxerror')
    ) {
      return 'Unable to fetch records due to a temporary server issue. Please try again later.';
    }
    return msg;
  };

  const fetchUserLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (!res.ok) throw new Error('Unable to retrieve user log data.');
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('Received an invalid response format from server.');
      }
      const userList: UserLogItem[] = Array.isArray(data) ? data : data.users || [];
      setUsers(userList);
      if (data.suggestedNextSid) {
        setSuggestedNextSid(data.suggestedNextSid);
      }

      // Pre-fill SID inputs for users without SIDs
      const initialSids: Record<string, string> = {};
      userList.forEach((u) => {
        initialSids[u.email] = u.sid || '';
      });
      setSidInputs(initialSids);
    } catch (err: any) {
      setErrorMsg(cleanErrorMessage(err?.message || 'Error loading user log records'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLogs();
  }, []);

  const handleSidChange = (email: string, val: string) => {
    setSidInputs((prev) => ({ ...prev, [email]: val.toUpperCase() }));
  };

  const handleAutoFillNextSid = (email: string) => {
    setSidInputs((prev) => ({ ...prev, [email]: suggestedNextSid }));
  };

  const handleUpdateUser = async (
    targetEmail: string,
    updatePayload: {
      sid?: string;
      isApproved?: string;
      userType?: 'admin' | 'student';
      password?: string;
      name?: string;
      college?: string;
      mobile?: string;
    }
  ) => {
    setProcessingEmail(targetEmail);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, ...updatePayload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user approval status');
      }

      setSuccessMsg(data.message || `User ${targetEmail} updated successfully.`);
      await fetchUserLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed');
    } finally {
      setProcessingEmail(null);
    }
  };

  const handleApproveStudent = async (u: UserLogItem) => {
    const assignedSid = sidInputs[u.email]?.trim() || u.sid || suggestedNextSid;
    if (!assignedSid) {
      setErrorMsg('Please enter or auto-fill an SID before approving this student.');
      return;
    }

    await handleUpdateUser(u.email, {
      sid: assignedSid,
      isApproved: 'yes',
      userType: 'student',
    });
  };

  const handleDisapproveStudent = async (u: UserLogItem) => {
    await handleUpdateUser(u.email, {
      isApproved: 'no',
      userType: 'student',
    });
  };

  const handleDeleteUser = async (email: string) => {
    setProcessingEmail(email);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/auth/userlogdatas?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setSuccessMsg(`User ${email} deleted successfully.`);
      setDeletingUserItem(null);
      await fetchUserLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete failed');
    } finally {
      setProcessingEmail(null);
    }
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.sid.toLowerCase().includes(q) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.college && u.college.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (filterTab === 'pending') return (u.isApproved === 'pending' || (u.isApproved !== 'yes' && u.isApproved !== 'no' && u.isApproved !== 'disapproved')) && u.userType === 'student';
    if (filterTab === 'approved') return u.isApproved === 'yes' && u.userType === 'student';
    if (filterTab === 'disapproved') return (u.isApproved === 'no' || u.isApproved === 'disapproved') && u.userType === 'student';
    if (filterTab === 'admin') return u.userType === 'admin';
    return true;
  });

  const pendingCount = users.filter((u) => (u.isApproved === 'pending' || (u.isApproved !== 'yes' && u.isApproved !== 'no' && u.isApproved !== 'disapproved')) && u.userType === 'student').length;
  const approvedCount = users.filter((u) => u.isApproved === 'yes' && u.userType === 'student').length;
  const disapprovedCount = users.filter((u) => (u.isApproved === 'no' || u.isApproved === 'disapproved') && u.userType === 'student').length;
  const adminCount = users.filter((u) => u.userType === 'admin').length;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-4 sm:space-y-5 max-w-full overflow-hidden text-white">
      {/* Section Header Banner - Aesthetic Warm Amber/Orange Restrictive Theme */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-slate-950 p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
              RESTRICTED APPROVALS
            </span>
            <span className="text-xs text-amber-300 font-bold font-mono">Access Control Center</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/40 shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-display font-black text-white text-lg sm:text-xl tracking-tight leading-tight">
              Student Registration Approvals & Access Control
            </h3>
          </div>
          <p className="text-xs text-amber-200/80 font-medium mt-1.5 leading-relaxed">
            Review registered accounts, grant or revoke access permissions, and assign Student IDs (SID) in <code className="bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-200 font-mono font-bold border border-amber-500/30">userlogdatas</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 self-start md:self-auto">
          <button
            onClick={fetchUserLogs}
            disabled={loading}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            Refresh Records
          </button>
        </div>
      </div>

      {/* Success and Error Banners */}
      {successMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-black cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/90 border border-rose-500/50 text-rose-200 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="bg-slate-900/90 p-1.5 rounded-2xl flex items-center gap-1.5 border border-amber-500/30 overflow-x-auto no-scrollbar max-w-full shrink">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filterTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200/80 hover:text-white hover:bg-amber-950/50'
            }`}
          >
            All Accounts ({users.length})
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-orange-300 bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/30'
            }`}
          >
            <Clock className="w-3 h-3 text-orange-300" />
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilterTab('disapproved')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterTab === 'disapproved'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30'
            }`}
          >
            <XCircle className="w-3 h-3 text-rose-300" />
            Disapproved ({disapprovedCount})
          </button>

          <button
            onClick={() => setFilterTab('admin')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              filterTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-purple-300" />
            Admins ({adminCount})
          </button>
        </div>

        <div className="relative w-full lg:w-auto lg:min-w-[240px] flex items-center bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-1 shadow-lg focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all shrink-0">
          <div className="p-1.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 shadow-xs ml-0.5 mr-2">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, SID..."
            className="w-full py-1 pr-8 bg-transparent text-xs font-extrabold text-amber-200 placeholder:text-amber-300/40 focus:outline-hidden min-w-0"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-xs border border-rose-500/40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Suggested SID Info Card - Warm Yellow/Amber Styling */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 border-2 border-amber-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-white shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-200 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Next Auto-Suggested SID: <strong className="font-mono text-amber-300 font-black text-sm px-2 py-0.5 bg-amber-900/80 rounded-lg border border-amber-500/40">{suggestedNextSid}</strong></span>
        </div>
        <p className="text-[11px] text-amber-200/80 font-medium">
          Admin enters SID or clicks <span className="font-bold text-amber-300">Auto SID</span> when approving students.
        </p>
      </div>

      {/* Users Vertical Stacked List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-amber-300 font-bold flex items-center justify-center gap-2 bg-slate-900/80 rounded-3xl border border-amber-500/30">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading student approval records...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 text-center text-xs text-amber-200/80 font-bold bg-slate-900/60 rounded-3xl border border-dashed border-amber-500/30 space-y-2">
          <div className="text-2xl">🔍</div>
          <div>No student records match the selected filter or search term.</div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredUsers.map((u, idx) => (
            <UserRow
              key={u._id ? String(u._id) : `${u.email}-${idx}`}
              user={u}
              suggestedNextSid={suggestedNextSid}
              sidInput={sidInputs[u.email]}
              isProcessing={processingEmail === u.email}
              onSidChange={handleSidChange}
              onAutoFillNextSid={handleAutoFillNextSid}
              onApprove={handleApproveStudent}
              onDisapprove={handleDisapproveStudent}
              onUpdateRole={(email, userType, sid) => handleUpdateUser(email, { userType, sid })}
              onDelete={setDeletingUserItem}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserItem && (
        <DeleteStudentModal
          isOpen={!!deletingUserItem}
          onClose={() => setDeletingUserItem(null)}
          onConfirmDelete={async () => {
            await handleDeleteUser(deletingUserItem.email);
          }}
          student={{
            sid: deletingUserItem.sid || 'N/A',
            name: deletingUserItem.name,
            email: deletingUserItem.email,
            mobile: deletingUserItem.mobile || '',
            college: deletingUserItem.college || '',
            hscBatch: deletingUserItem.hscBatch || '',
            subject: deletingUserItem.subject || '',
            group: deletingUserItem.group || '',
            guardiansPhone: deletingUserItem.guardiansPhone || '',
            address: deletingUserItem.address || '',
          }}
        />
      )}
    </div>
  );
}
