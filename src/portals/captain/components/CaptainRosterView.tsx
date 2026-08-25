import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  UserX,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { User, ApprovalStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { CaptainEmptyState } from './CaptainEmptyState';

interface CaptainRosterViewProps {
  assignedBatch: string;
  assignedSection: string;
  onSelectStudentForModal: (student: User) => void;
}

export const CaptainRosterView: React.FC<CaptainRosterViewProps> = ({
  assignedBatch,
  assignedSection,
  onSelectStudentForModal,
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'approved' | 'pending' | 'rejected'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSectionStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStudents({
        batch: assignedBatch,
        section: assignedSection,
        approval: statusFilter,
        search: searchTerm,
      });
      if (res?.students) {
        setStudents(res.students);
      }
    } catch (err: any) {
      console.error('Error fetching section students:', err);
    } finally {
      setLoading(false);
    }
  }, [assignedBatch, assignedSection, statusFilter, searchTerm]);

  useEffect(() => {
    fetchSectionStudents();
  }, [fetchSectionStudents]);

  const handleApprovalAction = async (studentId: string, approval: ApprovalStatus) => {
    setUpdatingId(studentId);
    setActionNotice(null);
    try {
      const res = await api.updateStudentApproval(studentId, approval);
      if (res.success) {
        setActionNotice(res.message || `Student approval status updated to '${approval}'.`);
        await fetchSectionStudents();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: any) {
      setActionNotice(err.message || 'Failed to update student approval.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = students.filter((s) => s.approval === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Bar - Light Blue Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Class Students & Onboarding Approvals
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Review and certify student accounts for Section {assignedSection} ({assignedBatch}).
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st as any)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0 text-center ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-sky-50/80 border border-sky-100 text-slate-600 hover:text-slate-900 hover:bg-sky-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student by name, roll, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-sky-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-bold text-center md:text-left">
          Total Section Records: <strong className="text-slate-900">{students.length}</strong>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-sky-600 animate-pulse">
            Fetching section student records...
          </div>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((st) => {
              const isSelf = user && (st.id === user.userId || st.email === user.email || (st.rollNumber && st.rollNumber === user.rollNumber));
              return (
                <div
                  key={st.id}
                  className={`p-5 rounded-2xl border space-y-4 transition-all shadow-xs ${
                    isSelf
                      ? 'bg-sky-100/70 border-sky-300 ring-2 ring-sky-400/30'
                      : st.approval === 'pending'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-sky-50/30 border-sky-200/80 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {st.rollNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 leading-snug">{st.fullName}</h4>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sky-600 text-white">
                              You
                            </span>
                          )}
                          {st.role === 'captain' && !isSelf && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white inline-flex items-center gap-0.5 shadow-xs">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Co-Captain
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                          {st.group} Group
                        </span>
                      </div>
                    </div>
                    {getApprovalBadge(st.approval)}
                  </div>

                <div className="space-y-1.5 pt-2 border-t border-sky-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{st.phoneNumber || 'No phone recorded'}</span>
                  </div>
                </div>

                {/* Actions: Approve / Reject / View Profile */}
                <div className="pt-2 border-t border-sky-100 flex items-center justify-between gap-2">
                  {st.approval === 'pending' ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => handleApprovalAction(st.id, 'approved')}
                        disabled={updatingId === st.id}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      {st.role !== 'captain' && (
                        <button
                          type="button"
                          onClick={() => handleApprovalAction(st.id, 'rejected')}
                          disabled={updatingId === st.id}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-xs"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      {st.role === 'captain' ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Protected Status
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleApprovalAction(st.id, st.approval === 'approved' ? 'rejected' : 'approved')
                          }
                          disabled={updatingId === st.id}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline"
                        >
                          {st.approval === 'approved' ? 'Revoke Approval' : 'Approve Student'}
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectStudentForModal(st)}
                    className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-100 rounded-lg transition-colors shrink-0"
                    title="View Full Profile Dossier"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <CaptainEmptyState
            icon={Users}
            title={statusFilter === 'ALL' ? "No Students Registered" : `No ${statusFilter} Students`}
            description={
              statusFilter === 'ALL'
                ? `There are no student accounts registered in Section ${assignedSection} (${assignedBatch}).`
                : `No students match the status '${statusFilter}' in Section ${assignedSection}.`
            }
          />
        )}
      </div>
    </div>
  );
};
