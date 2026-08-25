import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  ShieldCheck,
  FileText, 
  TrendingUp, 
  Phone, 
  Mail, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  Coins, 
  ChevronDown
} from 'lucide-react';
import { StudentDashboardStats, AttendanceRecord, LeaveRequest, SectionCaptainInfo } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { StudentAttendanceCharts } from './StudentAttendanceCharts';

interface StudentOverviewViewProps {
  stats: StudentDashboardStats | null;
  records: AttendanceRecord[];
  leaves?: LeaveRequest[];
  captains?: SectionCaptainInfo[];
  loading?: boolean;
  onOpenLeaveModal?: () => void;
}

export const StudentOverviewView: React.FC<StudentOverviewViewProps> = ({
  stats,
  records = [],
  captains = [],
}) => {
  const { user } = useAuth();

  // Extract available months from records
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    records.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        monthsSet.add(r.date.slice(0, 7)); // 'YYYY-MM'
      }
    });

    const sortedMonths = Array.from(monthsSet).sort().reverse();
    if (sortedMonths.length === 0) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return [currentMonthKey];
    }
    return sortedMonths;
  }, [records]);

  // Selected month filter - defaults to the latest active month
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (availableMonths.length > 0) return availableMonths[0];
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate monthly stats for the selected time period
  const monthlyMetrics = useMemo(() => {
    const list = selectedMonth === 'All'
      ? records
      : records.filter((r) => r.date.startsWith(selectedMonth));

    const totalDays = list.length;
    const daysPresent = list.filter((r) => String(r.status).toLowerCase() === 'present').length;
    const daysAbsent = list.filter((r) => String(r.status).toLowerCase() === 'absent').length;
    const daysLeave = list.filter((r) => ['leave', 'excused', 'late'].includes(String(r.status).toLowerCase())).length;
    const attendancePercentage = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0;
    const monthlyFine = daysAbsent * 100; // 1 day absent = 100 Tk fine

    // Formatted label for selected month
    let monthLabel = 'All Recorded Sessions';
    if (selectedMonth !== 'All') {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
      monthLabel = isNaN(d.getTime())
        ? selectedMonth
        : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return {
      monthKey: selectedMonth,
      monthLabel,
      totalDays,
      daysPresent,
      daysAbsent,
      daysLeave,
      attendancePercentage,
      monthlyFine
    };
  }, [records, selectedMonth]);

  const formatMonthOptionLabel = (monthKey: string) => {
    if (monthKey === 'All') return 'All Time (Cumulative)';
    const [y, m] = monthKey.split('-');
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return isNaN(d.getTime()) ? monthKey : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Monthly Time Period Filter & Summary Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-emerald-950 tracking-tight">
                Monthly Attendance Performance
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {monthlyMetrics.monthLabel}
              </span>
            </div>
            <p className="text-xs font-medium text-emerald-700/80 mt-0.5">
              Statistics and absence fines calculated for the selected monthly time period.
            </p>
          </div>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="select-overview-month" className="text-xs font-bold text-emerald-900 shrink-0">
            Select Month:
          </label>
          <div className="relative">
            <select
              id="select-overview-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-black bg-emerald-50/80 text-emerald-950 border border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-2xs"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthOptionLabel(m)}
                </option>
              ))}
              <option value="All">All Time (Cumulative)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Monthly Metrics Cards Row - Includes Presence, Present, Absent, Fine (100tk/day), and Leaves */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Monthly Presence Rate */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-emerald-700/70">
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Monthly Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {monthlyMetrics.attendancePercentage}%
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-800/70 truncate">
            {monthlyMetrics.totalDays > 0 ? `${monthlyMetrics.daysPresent} of ${monthlyMetrics.totalDays} in ${monthlyMetrics.monthLabel.split(' ')[0]}` : 'No sessions recorded'}
          </p>
        </div>

        {/* 2. Monthly Present Days */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-emerald-700/70">
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Present Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {monthlyMetrics.daysPresent}
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-800/70 truncate">
            {monthlyMetrics.monthLabel.split(' ')[0]} Sessions
          </p>
        </div>

        {/* 3. Monthly Absent Days */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-emerald-700/70">
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Absences</span>
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {monthlyMetrics.daysAbsent}
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-rose-700/80 truncate">
            {monthlyMetrics.daysAbsent > 0 ? `${monthlyMetrics.daysAbsent} days missed` : 'Zero absences'}
          </p>
        </div>

        {/* 4. Total Monthly Fine (100tk per absent day) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 backdrop-blur-md border border-rose-200/80 shadow-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-rose-700/80">
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Monthly Fine</span>
            <Coins className="w-4 h-4 text-rose-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight font-mono">
            ৳{monthlyMetrics.monthlyFine}
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-rose-800/80 truncate">
            {monthlyMetrics.daysAbsent > 0 ? `${monthlyMetrics.daysAbsent} days × ৳100 Tk` : 'No fine accrued'}
          </p>
        </div>

        {/* 5. Monthly Leaves */}
        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-emerald-700/70">
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Leaves Granted</span>
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700 tracking-tight">
            {monthlyMetrics.daysLeave}
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-800/70 truncate">
            {monthlyMetrics.monthLabel.split(' ')[0]} Excused
          </p>
        </div>
      </div>

      {/* Interactive Attendance Graph & Visual Analytics Section */}
      <StudentAttendanceCharts records={records} stats={stats} selectedMonth={selectedMonth} />

      {/* Section Captain Information Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-md shadow-emerald-950/10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-300">
                Assigned Section Captain • {user?.batch} (Sec {user?.section})
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              Class Leadership
            </span>
          </div>

          {captains && captains.length > 0 ? (
            <div className="space-y-2.5">
              {captains.map((cap) => (
                <div key={cap.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-xs shrink-0">
                      {cap.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-white tracking-tight truncate">{cap.fullName}</h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300">
                          Captain
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/90 font-semibold truncate mt-0.5">
                        Roll: <span className="font-mono text-white font-bold">{cap.rollNumber}</span> • Sec {cap.assignedSection} • {cap.assignedBatch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 text-xs">
                    {cap.email && (
                      <a
                        href={`mailto:${cap.email}`}
                        className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-emerald-100 font-semibold flex items-center gap-1.5 transition-colors truncate"
                        title={cap.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span className="hidden sm:inline truncate max-w-[130px]">{cap.email}</span>
                        <span className="sm:hidden">Email</span>
                      </a>
                    )}
                    {cap.phoneNumber && (
                      <a
                        href={`tel:${cap.phoneNumber}`}
                        className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-emerald-100 font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                        title={cap.phoneNumber}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>{cap.phoneNumber}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Section Captain Team</h4>
                <p className="text-[11px] text-emerald-200/80">
                  Your Section ({user?.section}) is managed by Section Captains for {user?.batch}.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-200/80 flex items-center justify-between gap-2">
          <span className="truncate">Daily attendance certification & leave review.</span>
          <Link
            to="/student/leave"
            className="text-[11px] font-black text-emerald-300 hover:text-white uppercase tracking-wider flex items-center gap-1 shrink-0"
          >
            <span>Apply Leave</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};


