import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Calendar, 
  Users, 
  AlertCircle, 
  Search,
  ShieldCheck
} from 'lucide-react';
import { AttendanceStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { CaptainEmptyState } from './CaptainEmptyState';

export interface RosterItem {
  studentId: string;
  rollNumber: string;
  fullName: string;
  group: string;
  phoneNumber: string;
  email: string;
  role?: string;
  status: AttendanceStatus;
  isMarked: boolean;
  studentsNote?: string;
  captainsNote?: string;
  remarks: string;
}

interface CaptainRollCallViewProps {
  assignedBatch: string;
  assignedSection: string;
  selectedDate: string;
  onChangeDate: (date: string) => void;
  roster: RosterItem[];
  onChangeRosterStatus: (studentId: string, status: AttendanceStatus) => void;
  onChangeRosterRemarks: (studentId: string, remarks: string) => void;
  onBulkSetStatus: (status: AttendanceStatus) => void;
  onSaveAttendance: () => Promise<void>;
  saving: boolean;
  saveSuccess: string | null;
  saveError: string | null;
  loading: boolean;
}

export const CaptainRollCallView: React.FC<CaptainRollCallViewProps> = ({
  assignedBatch,
  assignedSection,
  selectedDate,
  onChangeDate,
  roster = [],
  onChangeRosterStatus,
  onChangeRosterRemarks,
  onBulkSetStatus,
  onSaveAttendance,
  saving,
  saveSuccess,
  saveError,
  loading,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateDDMMYYYY = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    const parts = isoDateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return isoDateStr;
  };

  const filteredRoster = useMemo(() => {
    const list = [...(roster || [])]; // clone to avoid mutating original
    let result = list;
    
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (st) =>
          (st.fullName ? st.fullName.toLowerCase().includes(q) : false) ||
          (st.rollNumber ? st.rollNumber.toLowerCase().includes(q) : false) ||
          (st.email ? st.email.toLowerCase().includes(q) : false)
      );
    }
    
    return result.sort((a, b) => {
      return (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [roster, searchTerm]);

  const summary = useMemo(() => {
    const list = roster || [];
    const present = list.filter((r) => String(r.status).toLowerCase() === 'present').length;
    const absent = list.filter((r) => String(r.status).toLowerCase() === 'absent').length;
    const leave = list.filter((r) => ['leave', 'excused', 'late'].includes(String(r.status).toLowerCase())).length;
    return { present, absent, leave, total: list.length };
  }, [roster]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Control Bar - Light Blue Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Roll-Call Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-100 text-sky-800 border border-sky-200">
              {assignedBatch} • Section {assignedSection}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Log, verify, and synchronize daily student attendance [Present / Absent / Leave] directly to the database.
          </p>
        </div>

        {/* Date Selector & Live Summary */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-sky-50 p-2.5 rounded-2xl border border-sky-200 w-full xs:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600 ml-1" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onChangeDate(e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-hidden pr-2 cursor-pointer"
              />
            </div>
          </div>

          <button
            id="btn-save-captain-attendance"
            type="button"
            onClick={onSaveAttendance}
            disabled={saving || roster.length === 0}
            className="w-full xs:w-auto px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{saving ? 'Syncing...' : `Certify Attendance (${formatDateDDMMYYYY(selectedDate)})`}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Bulk Action & Search Bar */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Bulk Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Bulk Mark:</span>
          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onBulkSetStatus('present')}
              className="px-2.5 sm:px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Present</span>
            </button>
            <button
              type="button"
              onClick={() => onBulkSetStatus('absent')}
              className="px-2.5 sm:px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Absent</span>
            </button>
            <button
              type="button"
              onClick={() => onBulkSetStatus('leave')}
              className="px-2.5 sm:px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Student Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, email or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-sky-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Roster Roll-Call Container */}
      <div className="p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredRoster.length}</strong> of <strong className="text-slate-900">{roster.length}</strong> enrolled students
          </div>
          <div className="flex items-center gap-2.5 text-xs font-black">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{summary.present} Present</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">{summary.absent} Absent</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">{summary.leave} Leave</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-sky-600 animate-pulse">
            Loading section roster from database...
          </div>
        ) : filteredRoster.length > 0 ? (
          <>
            {/* Mobile Touch-Optimized Cards List (< md) */}
            <div className="block md:hidden space-y-3">
              {filteredRoster.map((st) => {
                const isSelf = user && (st.studentId === user.userId || st.email === user.email || (st.rollNumber && st.rollNumber === user.rollNumber));
                const isCoCaptain = st.role === 'captain' && !isSelf;
                const currentStatus = String(st.status || 'present').toLowerCase();

                return (
                  <div
                    key={st.studentId}
                    className={`p-4 rounded-2xl border space-y-3 transition-all ${
                      isSelf
                        ? 'bg-sky-100/70 border-sky-300 ring-2 ring-sky-400/30'
                        : isCoCaptain
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-sky-50/40 border-sky-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {st.rollNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">{st.fullName}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-sky-600 text-white">
                                You
                              </span>
                            )}
                            {isCoCaptain && (
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-500 text-white">
                                Co-Captain
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-sky-700 font-mono block truncate">{st.email}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-white border border-sky-200 text-slate-600 shrink-0">
                        {st.group}
                      </span>
                    </div>

                    {st.studentsNote && (
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-medium">
                        <strong>Student Note:</strong> {st.studentsNote}
                      </div>
                    )}

                    {/* Status Button Group for Touch */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-sky-200">
                      {[
                        { value: 'present', label: 'Present', activeClass: 'bg-emerald-600 text-white shadow-xs' },
                        { value: 'absent', label: 'Absent', activeClass: 'bg-rose-600 text-white shadow-xs' },
                        { value: 'leave', label: 'Leave', activeClass: 'bg-amber-600 text-white shadow-xs' },
                      ].map((opt) => {
                        const isSelected = currentStatus === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChangeRosterStatus(st.studentId, opt.value as AttendanceStatus)}
                            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                              isSelected
                                ? opt.activeClass
                                : 'text-slate-600 hover:bg-sky-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      placeholder="Captain note / remark..."
                      value={st.captainsNote || st.remarks || ''}
                      onChange={(e) => onChangeRosterRemarks(st.studentId, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-sky-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-sky-100">
                  <tr>
                    <th className="py-3.5 px-3 w-28">Roll Number</th>
                    <th className="py-3.5 px-3">Student Email & Name</th>
                    <th className="py-3.5 px-3">Academic Group</th>
                    <th className="py-3.5 px-3">Status [Present / Absent / Leave]</th>
                    <th className="py-3.5 px-3">Captain's Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-slate-800">
                  {filteredRoster.map((st) => {
                    const isSelf = user && (st.studentId === user.userId || st.email === user.email || (st.rollNumber && st.rollNumber === user.rollNumber));
                    const isCoCaptain = st.role === 'captain' && !isSelf;
                    const currentStatus = String(st.status || 'present').toLowerCase();

                    return (
                      <tr
                        key={st.studentId}
                        className={`transition-colors ${
                          isSelf
                            ? 'bg-sky-100/60 font-semibold'
                            : isCoCaptain
                            ? 'bg-amber-50/70 hover:bg-amber-50 font-medium'
                            : 'hover:bg-sky-50/50'
                        }`}
                      >
                        <td className="py-3.5 px-3 font-mono font-black text-sky-800 whitespace-nowrap">
                          {st.rollNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 block">{st.fullName}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sky-600 text-white inline-flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                You (Captain)
                              </span>
                            )}
                            {isCoCaptain && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white inline-flex items-center gap-1 shadow-xs">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Co-Captain
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-sky-700 font-mono font-medium">{st.email}</span>
                          {st.studentsNote && (
                            <div className="mt-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                              <strong>Student's Note:</strong> {st.studentsNote}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-700">
                          {st.group}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="inline-flex rounded-xl p-1 bg-sky-50 border border-sky-200 gap-1">
                            {[
                              { value: 'present', label: 'Present', activeClass: 'bg-emerald-600 text-white shadow-xs' },
                              { value: 'absent', label: 'Absent', activeClass: 'bg-rose-600 text-white shadow-xs' },
                              { value: 'leave', label: 'Leave', activeClass: 'bg-amber-600 text-white shadow-xs' },
                            ].map((opt) => {
                              const isSelected = currentStatus === opt.value;

                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => onChangeRosterStatus(st.studentId, opt.value as AttendanceStatus)}
                                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                    isSelected
                                      ? opt.activeClass
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <input
                            type="text"
                            placeholder="Captain's note / reason..."
                            value={st.captainsNote || st.remarks || ''}
                            onChange={(e) => onChangeRosterRemarks(st.studentId, e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-sky-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <CaptainEmptyState
            icon={Users}
            title={roster.length === 0 ? "No Approved Students in Section" : "No Matching Students"}
            description={
              roster.length === 0
                ? `There are currently no approved students registered under Section ${assignedSection} (${assignedBatch}) in the database.`
                : "No students match your search criteria. Try a different name or roll number."
            }
            actionLabel={roster.length === 0 ? "Class Students & Approvals" : undefined}
            onAction={roster.length === 0 ? () => navigate('/captain/roster') : undefined}
          />
        )}
      </div>

      {/* Bottom Certify Attendance Action Bar */}
      <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-0.5">
          <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Ready to certify section roll-call?</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Saves {summary.present} Present, {summary.absent} Absent, and {summary.leave} Leave records for{' '}
            <span className="font-bold text-slate-700 whitespace-nowrap">{formatDateDDMMYYYY(selectedDate)}</span>.
          </p>
        </div>

        <button
          id="btn-save-captain-attendance-bottom"
          type="button"
          onClick={onSaveAttendance}
          disabled={saving || roster.length === 0}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{saving ? 'Syncing...' : `Certify Attendance (${formatDateDDMMYYYY(selectedDate)})`}</span>
        </button>
      </div>
    </div>
  );
};


