import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  CheckCircle2,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Layers
} from 'lucide-react';
import { User, ApprovalStatus, AdminOverviewStats } from '../../../types';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminUserProfileModal } from './AdminUserProfileModal';

interface AdminPendingStudentsViewProps {
  students: User[];
  stats?: AdminOverviewStats | null;
  onUpdateApproval: (id: string, approval: ApprovalStatus) => Promise<{ success: boolean; message?: string }>;
  onUpdateRole: (id: string, role: 'student' | 'captain', assignedBatch?: string, assignedSection?: string) => Promise<{ success: boolean; message?: string }>;
  onRefresh: () => void;
  loading: boolean;
}

export const AdminPendingStudentsView: React.FC<AdminPendingStudentsViewProps> = ({
  students,
  onUpdateApproval,
  onUpdateRole,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter ONLY pending students
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

  const handleApproval = async (id: string, approval: ApprovalStatus) => {
    setUpdatingId(id);
    setActionNotice(null);
    try {
      const result = await onUpdateApproval(id, approval);
      if (result.success) {
        setActionNotice({
          type: 'success',
          message: result.message || `Student approval status set to '${approval}'.`,
        });
        onRefresh();
      } else {
        setActionNotice({
          type: 'error',
          message: result.message || 'Failed to update approval status.',
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'An error occurred while processing approval.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Clock className="w-5 h-5 text-amber-100" />
            </span>
            <h2 className="text-xl font-black tracking-tight">Pending Registrations Queue</h2>
          </div>
          <p className="text-xs text-amber-100 font-medium max-w-2xl">
            Review student registration applications requiring administrator verification and authorization. Approved students gain access to section features immediately.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-amber-300/30 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 block">Pending Queue</span>
            <span className="text-2xl font-black text-white">{pendingStudentsList.length} Applications</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all shadow-xs"
            title="Refresh Registration Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border shadow-xs animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {actionNotice.message}
        </div>
      )}

      {/* Main Container */}
      <div className="p-6 bg-amber-50/40 backdrop-blur-md rounded-3xl border border-amber-200/80 shadow-xs space-y-6">
        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll number, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All">All Batches</option>
              <option value="HSC 2024">HSC 2024</option>
              <option value="HSC 2025">HSC 2025</option>
              <option value="HSC 2026">HSC 2026</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All">All Sections (A, B, C, D)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
        </div>

        {/* Directory Cards (Stacked Vertical Blocks) */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-amber-700 animate-pulse flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            <span>Scanning student registration database...</span>
          </div>
        ) : pendingStudentsList.length > 0 ? (
          <div className="space-y-3">
            {pendingStudentsList.map((st, index) => (
              <div
                key={st.id ? `pending-${st.id}-${index}` : `pending-idx-${index}`}
                className="p-4 bg-white rounded-2xl border border-amber-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left Info: Identity & Academic Placement */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                    {st.rollNumber || (st.fullName ? st.fullName.charAt(0) : 'P')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                        {st.fullName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pending Approval</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-0.5">
                      <span className="inline-flex items-center gap-1 text-slate-600 truncate">
                        <Mail className="w-3 h-3 text-amber-600/70 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </span>
                      {st.phoneNumber && (
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3 text-amber-600/70 shrink-0" />
                          <span>{st.phoneNumber}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-800 font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Batch {st.batch}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-900 font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-amber-100 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForProfile(st)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    title="Inspect Registration Dossier"
                  >
                    <Eye className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="hidden xs:inline">Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproval(st.id, 'approved')}
                    disabled={updatingId === st.id}
                    className="px-3 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50"
                    title="Approve Registration"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="hidden xs:inline">Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproval(st.id, 'rejected')}
                    disabled={updatingId === st.id}
                    className="px-2.5 sm:px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50"
                    title="Reject Registration"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span className="hidden xs:inline">Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-3xl border border-amber-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 tracking-tight">Queue Completely Empty</h4>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              There are currently no pending student registration requests matching your filter criteria. All applicants have been processed.
            </p>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
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
