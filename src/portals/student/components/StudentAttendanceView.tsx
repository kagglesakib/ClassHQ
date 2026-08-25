import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Filter,
  Sparkles,
  Layers,
  TrendingUp,
  RotateCcw,
  FileText,
  ChevronDown,
  CalendarDays
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, LeaveRequest } from '../../../types';
import { StudentEmptyState } from './StudentEmptyState';
import { useAuth } from '../../../context/AuthContext';
import { generateMonthlyAttendancePDF } from '../../../lib/pdfReport';

interface StudentAttendanceViewProps {
  records: AttendanceRecord[];
  leaves?: LeaveRequest[];
  loading: boolean;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  records = [],
  leaves = [],
  loading,
}) => {
  const { user } = useAuth();
  const [searchDate, setSearchDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus>('All');
  const [monthFilter, setMonthFilter] = useState<'All' | string>('All');

  // Extract distinct and selectable months from records + recent academic months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    (records || []).forEach((r) => {
      if (r.date && r.date.length >= 7) {
        months.add(r.date.substring(0, 7)); // e.g. "2026-08"
      }
    });

    // Also ensure current and recent months are selectable
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(mStr);
    }

    return Array.from(months).sort().reverse();
  }, [records]);

  const formatMonthTitle = (monthStr: string) => {
    if (!monthStr || monthStr === 'All') return 'Full History (All Months)';
    try {
      const [year, month] = monthStr.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter((rec) => {
      const matchSearch = searchDate ? rec.date.includes(searchDate) : true;
      const st = String(rec.status || '').toLowerCase();
      let matchStatus = true;
      if (statusFilter !== 'All') {
        const filterTarget = String(statusFilter).toLowerCase();
        if (filterTarget === 'leave') {
          matchStatus = ['leave', 'excused', 'late'].includes(st);
        } else {
          matchStatus = st === filterTarget;
        }
      }
      const matchMonth = monthFilter === 'All' ? true : rec.date.startsWith(monthFilter);
      return matchSearch && matchStatus && matchMonth;
    });
  }, [records, searchDate, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const list = records || [];
    const total = list.length;
    const present = list.filter((r) => String(r.status).toLowerCase() === 'present').length;
    const absent = list.filter((r) => String(r.status).toLowerCase() === 'absent').length;
    const leave = list.filter((r) => ['leave', 'excused', 'late'].includes(String(r.status).toLowerCase())).length;
    const rate = total > 0 ? Math.round(((present + leave) / total) * 100) : 0;
    return { total, present, absent, leave, rate };
  }, [records]);

  const handleDownloadPDF = () => {
    generateMonthlyAttendancePDF({
      user,
      selectedMonth: monthFilter,
      records: records,
      leaves: leaves || [],
    });
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = 'Date,Batch,Section,Group,Status,MarkedBy,Remarks,Timestamp\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.date}","${r.batch}","${r.section}","${r.group}","${r.status}","${r.markedBy?.name || 'Class Captain'}","${r.remarks || ''}","${r.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDateDetails = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: dateStr, month: '', weekday: '', formatted: dateStr };
      return {
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullWeekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
        year: d.getFullYear(),
        formatted: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    } catch {
      return { day: dateStr, month: '', weekday: '', formatted: dateStr };
    }
  };

  const getStatusBadge = (status: string) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'present':
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 inline-flex items-center gap-1.5 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            Absent
          </span>
        );
      case 'late':
      case 'leave':
      case 'excused':
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 inline-flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Leave
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Institutional College Banner Card with PDF Export Notice */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-800 relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Official College Audit
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">BNC Chittagong</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
            Bangladesh Navy College, Chittagong
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Download your verified monthly attendance & leave statement including cause, leave reason, and certifying authority signatures.
          </p>
        </div>

        {/* Month Selection Dropdown & Download Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
          <div className="flex flex-col gap-1.5 min-w-[220px]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Report Month</span>
              </label>
              {monthFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setMonthFilter('All')}
                  className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                  title="Reset to Full History"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>All</span>
                </button>
              )}
            </div>

            {/* Reliable and Stylized Month Selector Dropdown */}
            <div className="relative flex items-center bg-slate-950 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all shadow-inner h-[44px] px-3.5">
              <CalendarDays className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5 pointer-events-none" />
              
              <select
                id="select-report-month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold text-emerald-200 focus:outline-none cursor-pointer pr-5 appearance-none [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="All">Full History (All Recorded Months)</option>
                {availableMonths.map((m) => {
                  const count = (records || []).filter(r => r.date?.startsWith(m)).length;
                  return (
                    <option key={m} value={m}>
                      {formatMonthTitle(m)} {count > 0 ? `(${count} records)` : ''}
                    </option>
                  );
                })}
              </select>

              <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0 pointer-events-none absolute right-3" />
            </div>
          </div>

          <button
            id="btn-download-pdf-report"
            type="button"
            onClick={handleDownloadPDF}
            className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 shrink-0 active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar - Mobile, Tablet & PC Responsive */}
      <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100/80 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Status Filter Buttons Decorated with Clear Visual Icons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* ALL */}
            <button
              id="filter-status-all"
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-emerald-800/25 ring-2 ring-emerald-400/40'
                  : 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-200/80'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'All' ? 'text-emerald-200' : 'text-emerald-600'}`} />
              <span>All ({records.length})</span>
            </button>

            {/* PRESENT */}
            <button
              id="filter-status-present"
              type="button"
              onClick={() => setStatusFilter('present' as any)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                String(statusFilter).toLowerCase() === 'present'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                  : 'bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200/80'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${String(statusFilter).toLowerCase() === 'present' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Present ({stats.present})</span>
            </button>

            {/* ABSENT */}
            <button
              id="filter-status-absent"
              type="button"
              onClick={() => setStatusFilter('absent' as any)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                String(statusFilter).toLowerCase() === 'absent'
                  ? 'bg-rose-600 text-white shadow-rose-600/25 ring-2 ring-rose-400/40'
                  : 'bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:text-rose-900 border border-rose-200/80'
              }`}
            >
              <XCircle className={`w-3.5 h-3.5 shrink-0 ${String(statusFilter).toLowerCase() === 'absent' ? 'text-white' : 'text-rose-600'}`} />
              <span>Absent ({stats.absent})</span>
            </button>

            {/* LEAVE */}
            <button
              id="filter-status-leave"
              type="button"
              onClick={() => setStatusFilter('leave' as any)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                String(statusFilter).toLowerCase() === 'leave'
                  ? 'bg-amber-600 text-white shadow-amber-600/25 ring-2 ring-amber-400/40'
                  : 'bg-amber-50/80 text-amber-700 hover:bg-amber-100 hover:text-amber-900 border border-amber-200/80'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 shrink-0 ${String(statusFilter).toLowerCase() === 'leave' ? 'text-white' : 'text-amber-600'}`} />
              <span>Leave ({stats.leave})</span>
            </button>
          </div>

          {/* Month Filter Dropdown & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative min-w-[180px]">
              <select
                id="select-filter-month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-emerald-50/80 text-emerald-950 border border-emerald-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-hidden appearance-none pr-8 cursor-pointer shadow-2xs"
              >
                <option value="All">All Months ({availableMonths.length})</option>
                {availableMonths.map((m) => {
                  const count = (records || []).filter(r => r.date?.startsWith(m)).length;
                  return (
                    <option key={m} value={m}>
                      {formatMonthTitle(m)} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700 pointer-events-none absolute right-2.5 top-3" />
            </div>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search date (YYYY-MM-DD)..."
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-emerald-50/60 border border-emerald-200 text-emerald-950 placeholder:text-emerald-700/40 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {(statusFilter !== 'All' || monthFilter !== 'All' || searchDate) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setMonthFilter('All');
                  setSearchDate('');
                }}
                className="px-3 py-2 text-xs font-black uppercase tracking-wider text-emerald-800 hover:text-rose-600 bg-emerald-50 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Feed: Stackwise Dynamic Attendance Blocks */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-600 animate-pulse bg-white/80 rounded-3xl border border-emerald-100">
            Querying attendance database...
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {filteredRecords.map((rec) => {
              const dateDetails = formatDateDetails(rec.date);
              const isPresent = String(rec.status).toLowerCase() === 'present';
              const isAbsent = String(rec.status).toLowerCase() === 'absent';

                const StatusIcon = isPresent ? CheckCircle2 : isAbsent ? XCircle : Clock;
                
                const cardBg = isPresent 
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' 
                  : isAbsent 
                  ? 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200';
                  
                const badgeStyle = isPresent
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-emerald-600/20'
                  : isAbsent
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-rose-600/20'
                  : 'bg-amber-600 text-white shadow-amber-600/30 ring-amber-600/20';

                const dateBlockStyle = isPresent
                  ? 'bg-emerald-600/10 text-emerald-800 border-emerald-200/60'
                  : isAbsent
                  ? 'bg-rose-600/10 text-rose-800 border-rose-200/60'
                  : 'bg-amber-600/10 text-amber-800 border-amber-200/60';

                const textMuted = isPresent ? 'text-emerald-700/70' : isAbsent ? 'text-rose-700/70' : 'text-amber-700/70';
                const textBold = isPresent ? 'text-emerald-950' : isAbsent ? 'text-rose-950' : 'text-amber-950';
                const divider = isPresent ? 'border-emerald-200/60' : isAbsent ? 'border-rose-200/60' : 'border-amber-200/60';

                return (
                  <div
                    key={rec.id}
                    className={`w-full p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}
                  >
                    {/* Date Block & Cohort Meta */}
                    <div className="flex items-center gap-3.5 min-w-56 shrink-0">
                      {/* Calendar Date Block */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border shrink-0 ${dateBlockStyle}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider leading-none opacity-80">
                          {dateDetails.month || 'DAY'}
                        </span>
                        <span className="text-base font-black leading-none mt-1">
                          {dateDetails.day}
                        </span>
                      </div>

                      <div>
                        <div className={`text-sm font-black tracking-tight flex items-center gap-1.5 ${textBold}`}>
                          <span className="font-mono">{rec.date}</span>
                          {dateDetails.weekday && (
                            <span className={`text-xs font-bold ${textMuted}`}>({dateDetails.weekday})</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold mt-0.5 ${textMuted}`}>
                          <span>{rec.batch}</span>
                          <span>•</span>
                          <span>Section {rec.section}</span>
                          {rec.group && (
                            <>
                              <span>•</span>
                              <span>{rec.group}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Session Remarks / Notes */}
                    <div className="flex-1 min-w-0 md:px-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${textMuted}`}>
                        Session Remarks:
                      </span>
                      {rec.remarks ? (
                        <div className={`p-2.5 sm:p-3 rounded-2xl bg-white/40 border text-xs font-medium flex items-start gap-2 ${divider} ${textBold}`}>
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${textMuted}`} />
                          <p className="text-xs leading-relaxed line-clamp-2">{rec.remarks}</p>
                        </div>
                      ) : (
                        <div className={`p-2 rounded-xl bg-white/20 border text-xs italic ${divider} ${textMuted}`}>
                          No specific session remarks provided for this date.
                        </div>
                      )}
                    </div>

                    {/* Right Section: Status Badge, Fine & Certification Stamp */}
                    <div className={`flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 ${divider}`}>
                      <div className="flex items-center gap-2">
                        {isAbsent && (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-lg border border-rose-200/60 font-mono">
                            ৳100 Fine
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset shrink-0 flex items-center gap-1.5 ${badgeStyle}`}>
                          <StatusIcon className="w-3 h-3" strokeWidth={3} />
                          {rec.status || 'Unknown'}
                        </span>
                      </div>

                      <div className={`flex flex-col md:items-end text-[10px] uppercase tracking-widest ${textMuted}`}>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Certified by</span>
                        </div>
                        {rec.markedBy ? (
                          <div className={`font-bold flex items-center gap-1.5 mt-0.5 ${textBold}`}>
                            {rec.markedBy.name}
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-white/50 border ${divider}`}>
                              {rec.markedBy.role}
                            </span>
                          </div>
                        ) : (
                          <span className={`font-bold mt-0.5 ${textBold}`}>System</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <StudentEmptyState
            icon={CalendarCheck}
            title={records.length === 0 ? "No Attendance Records Found" : "No Matching Attendance Records"}
            description={
              records.length === 0
                ? "No attendance roll-calls have been logged for your account in the database yet."
                : "No records match the current status and date filters. Try changing or clearing your filters."
            }
            actionLabel={records.length > 0 ? "Reset Filters" : undefined}
            onAction={() => {
              setStatusFilter('All');
              setMonthFilter('All');
              setSearchDate('');
            }}
          />
        )}
      </div>
    </div>
  );
};

