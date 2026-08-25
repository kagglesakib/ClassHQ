import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  X, 
  ShieldAlert, 
  GraduationCap, 
  Building2, 
  Eye, 
  UserCheck, 
  UserMinus,
  RefreshCw,
  Award,
  Mail,
  Phone,
  BookOpen,
  Layers
} from 'lucide-react';
import { User, ApprovalStatus, AdminOverviewStats } from '../../../types';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminUserProfileModal } from './AdminUserProfileModal';

interface AdminStudentsViewProps {
  students: User[];
  stats?: AdminOverviewStats | null;
  onUpdateApproval: (id: string, approval: ApprovalStatus) => Promise<{ success: boolean; message?: string }>;
  onUpdateRole: (id: string, role: 'student' | 'captain', assignedBatch?: string, assignedSection?: string) => Promise<{ success: boolean; message?: string }>;
  onRefresh: () => void;
  loading: boolean;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({
  students = [],
  stats = null,
  onUpdateApproval,
  onUpdateRole,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'captain' | 'student' | 'pending'>('All');
  const [approvalFilter, setApprovalFilter] = useState<'All' | 'approved' | 'pending' | 'rejected'>('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [confirmPromoteId, setConfirmPromoteId] = useState<string | null>(null);
  const [confirmDemoteId, setConfirmDemoteId] = useState<string | null>(null);

  // Counts for quick tabs
  const totalApprovedCount = students.filter((s) => s.approval === 'approved').length;
  const captainCount = students.filter((s) => s.role === 'captain' && s.approval === 'approved').length;
  const approvedStudentCount = students.filter((s) => s.role === 'student' && s.approval === 'approved').length;
  const pendingCount = students.filter((s) => s.approval === 'pending').length;

  // Dedicated Pending Students list (Filtered by search/batch/section if provided)
  const pendingStudentsList = (students || []).filter((st) => {
    if (!st || st.approval !== 'pending') return false;
    const term = (searchTerm || '').trim().toLowerCase();
    const matchSearch =
      !term ||
      (st.fullName ? st.fullName.toLowerCase().includes(term) : false) ||
      (st.rollNumber ? st.rollNumber.toLowerCase().includes(term) : false) ||
      (st.email ? st.email.toLowerCase().includes(term) : false) ||
      (st.phoneNumber ? st.phoneNumber.toLowerCase().includes(term) : false);

    const matchBatch =
      batchFilter === 'All'
        ? true
        : st.batch === batchFilter ||
          String(st.batch || '').replace(/\D+/g, '') === String(batchFilter || '').replace(/\D+/g, '');
    const matchSection =
      sectionFilter === 'All'
        ? true
        : String(st.section || '').trim().toUpperCase() === String(sectionFilter || '').trim().toUpperCase();

    return matchSearch && matchBatch && matchSection;
  });

  // Dedicated Approved/Active Directory List (STRICTLY excludes pending students)
  const approvedDirectoryList = (students || []).filter((st) => {
    if (!st || st.approval === 'pending') return false;

    const term = (searchTerm || '').trim().toLowerCase();
    const matchSearch =
      !term ||
      (st.fullName ? st.fullName.toLowerCase().includes(term) : false) ||
      (st.rollNumber ? st.rollNumber.toLowerCase().includes(term) : false) ||
      (st.email ? st.email.toLowerCase().includes(term) : false) ||
      (st.phoneNumber ? st.phoneNumber.toLowerCase().includes(term) : false);

    const matchBatch =
      batchFilter === 'All'
        ? true
        : st.batch === batchFilter ||
          String(st.batch || '').replace(/\D+/g, '') === String(batchFilter || '').replace(/\D+/g, '');
    const matchSection =
      sectionFilter === 'All'
        ? true
        : String(st.section || '').trim().toUpperCase() === String(sectionFilter || '').trim().toUpperCase();

    const matchApproval =
      approvalFilter === 'All' ? true : st.approval === approvalFilter;

    let matchRole = true;
    if (roleFilter === 'captain') {
      matchRole = st.role === 'captain';
    } else if (roleFilter === 'student') {
      matchRole = st.role === 'student';
    }

    return matchSearch && matchBatch && matchSection && matchApproval && matchRole;
  });

  const handleApproval = async (id: string, status: ApprovalStatus) => {
    setUpdatingId(id);
    setActionNotice(null);
    try {
      const res = await onUpdateApproval(id, status);
      if (res.success) {
        setActionNotice({
          type: 'success',
          text: res.message || `Student registration status updated to '${status}'.`,
        });
        onRefresh();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice({ type: 'error', text: 'Failed to update approval status.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Error updating approval.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleToggle = async (user: User, targetRole: 'student' | 'captain') => {
    setUpdatingId(user.id);
    setActionNotice(null);
    try {
      const res = await onUpdateRole(user.id, targetRole, user.batch, user.section);
      if (res.success) {
        setActionNotice({
          type: 'success',
          text: res.message || `User ${user.fullName} role successfully updated to ${targetRole === 'captain' ? 'Class Captain' : 'Student'}.`,
        });
        setConfirmPromoteId(null);
        setConfirmDemoteId(null);
        onRefresh();
        setTimeout(() => setActionNotice(null), 4500);
      } else {
        setActionNotice({ type: 'error', text: 'Failed to change role.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Error occurred while updating role.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const getApprovalBadge = (approval: ApprovalStatus) => {
    switch (approval) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (user: User) => {
    if (user.role === 'captain') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1 shadow-2xs">
          <ShieldAlert className="w-3 h-3 text-blue-600" />
          Class Captain
        </span>
      );
    }
    if (user.role === 'student') {
      return (
        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
          <GraduationCap className="w-3 h-3 text-emerald-600" />
          Student
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
        <Building2 className="w-3 h-3 text-rose-600" />
        Admin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls - Light Red Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Directory & Role Governance</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            View profiles, audit student records, and promote or demote Class Captains across sections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-rose-200 flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setRoleFilter('All');
            setApprovalFilter('All');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'All'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200 ring-1 ring-rose-500'
              : 'bg-white border-rose-200/80 hover:border-rose-300 text-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${roleFilter === 'All' ? 'text-rose-100' : 'text-slate-500'}`}>Approved Roster</span>
            <Users className={`w-4 h-4 ${roleFilter === 'All' ? 'text-white' : 'text-rose-500'}`} />
          </div>
          <span className={`text-2xl font-black block mt-1 ${roleFilter === 'All' ? 'text-white' : 'text-slate-900'}`}>{totalApprovedCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleFilter('captain');
            setApprovalFilter('All');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'captain'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 ring-1 ring-blue-500'
              : 'bg-white border-rose-200/80 hover:border-blue-300 text-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${roleFilter === 'captain' ? 'text-blue-100' : 'text-blue-600'}`}>Class Captains</span>
            <ShieldAlert className={`w-4 h-4 ${roleFilter === 'captain' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <span className={`text-2xl font-black block mt-1 ${roleFilter === 'captain' ? 'text-white' : 'text-slate-900'}`}>{captainCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleFilter('student');
            setApprovalFilter('approved');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'student'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 ring-1 ring-emerald-500'
              : 'bg-white border-rose-200/80 hover:border-emerald-300 text-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${roleFilter === 'student' ? 'text-emerald-100' : 'text-emerald-600'}`}>Approved Students</span>
            <GraduationCap className={`w-4 h-4 ${roleFilter === 'student' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <span className={`text-2xl font-black block mt-1 ${roleFilter === 'student' ? 'text-white' : 'text-slate-900'}`}>{approvedStudentCount}</span>
        </button>

        <Link
          to="/admin/pending-students"
          className="p-4 rounded-2xl border text-left transition-all bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200 hover:bg-amber-600 cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">Pending Requests</span>
            <Clock className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="text-2xl font-black block mt-1 text-white">{pendingCount}</span>
        </Link>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* APPROVED STUDENTS & CAPTAINS ROSTER TABLE */}
      <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Approved Accounts & Roster Directory
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Official institutional roster of active students and Class Captains across sections.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-rose-50/50 border border-rose-200 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-rose-50/50 border border-rose-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All HSC Batches</option>
              <option value="HSC 2024">HSC 2024</option>
              <option value="HSC 2025">HSC 2025</option>
              <option value="HSC 2026">HSC 2026</option>
              <option value="HSC 2027">HSC 2027</option>
              <option value="HSC 2028">HSC 2028</option>
              <option value="HSC 2029">HSC 2029</option>
              <option value="HSC 2030">HSC 2030</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-rose-50/50 border border-rose-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Sections (A-I)</option>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Cards (Stacked Vertical Blocks) */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-rose-600 animate-pulse flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
              <span>Querying institutional directory and role profiles...</span>
            </div>
          ) : approvedDirectoryList.length > 0 ? (
            <div className="space-y-3">
              {approvedDirectoryList.map((st, index) => (
                <div
                  key={st.id ? `st-${st.id}-${index}` : `st-idx-${index}`}
                  className="p-4 bg-white rounded-2xl border border-rose-200/80 hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left: User Avatar & Identity Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ${
                      st.role === 'captain'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                        : st.role === 'admin'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-100'
                        : 'bg-emerald-600 text-white ring-2 ring-emerald-100'
                    }`}>
                      {st.rollNumber || (st.fullName ? st.fullName.charAt(0) : 'U')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                          {st.fullName}
                        </span>
                        {getRoleBadge(st)}
                        {getApprovalBadge(st.approval)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="inline-flex items-center gap-1 text-slate-600 truncate">
                          <Mail className="w-3 h-3 text-rose-500/70 shrink-0" />
                          <span className="truncate">{st.email}</span>
                        </span>
                        {st.phoneNumber && (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-rose-500/70 shrink-0" />
                            <span>{st.phoneNumber}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-slate-800 font-bold">
                          <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Batch {st.batch}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-rose-900 font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Sec {st.section}</span>
                        </span>
                        {st.group && (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{st.group}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-rose-100 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForProfile(st)}
                      className="px-2.5 sm:px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-2xs"
                      title="View Student Dossier"
                    >
                      <Eye className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="hidden xs:inline">Profile</span>
                    </button>

                    {st.role === 'student' && st.approval === 'approved' && (
                      <div>
                        {confirmPromoteId !== st.id ? (
                          <button
                            type="button"
                            onClick={() => setConfirmPromoteId(st.id)}
                            disabled={updatingId === st.id}
                            className="px-2.5 sm:px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Promote this student to Class Captain"
                          >
                            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="hidden xs:inline">Promote</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-blue-50 p-1 rounded-xl border border-blue-200">
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(st, 'captain')}
                              disabled={updatingId === st.id}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmPromoteId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {st.role === 'captain' && (
                      <div>
                        {confirmDemoteId !== st.id ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDemoteId(st.id)}
                            disabled={updatingId === st.id}
                            className="px-2.5 sm:px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Demote Class Captain to regular student"
                          >
                            <UserMinus className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="hidden xs:inline">Demote</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200">
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(st, 'student')}
                              disabled={updatingId === st.id}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase"
                            >
                              Demote
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDemoteId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleApproval(st.id, 'rejected')}
                      disabled={updatingId === st.id}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                      title="Revoke Approval"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              icon={Users}
              title="No Accounts Found"
              description="No registered approved students or captains matched the selected directory filters."
            />
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUserForProfile && (
        <AdminUserProfileModal
          user={selectedUserForProfile}
          onClose={() => setSelectedUserForProfile(null)}
          onUpdateApproval={onUpdateApproval}
          onUpdateRole={onUpdateRole}
          onUserModified={onRefresh}
        />
      )}
    </div>
  );
};
