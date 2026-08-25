import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Hash, 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { StudentDashboardStats, AttendanceRecord, LeaveRequest } from '../../../types';

export const CaptainMyProfileView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leaves'>('overview');

  useEffect(() => {
    if (!user) return;
    const fetchPersonalData = async () => {
      setLoading(true);
      try {
        const [statsRes, attRes, leavesRes] = await Promise.all([
          api.getStudentStats(user.userId).catch(() => null),
          api.getStudentAttendance(user.userId).catch(() => ({ records: [] })),
          api.getStudentLeaves(user.userId).catch(() => ({ leaves: [] })),
        ]);

        if (statsRes) setStats(statsRes);
        if (attRes?.records) setAttendance(attRes.records);
        if (leavesRes?.leaves) setLeaves(leavesRes.leaves);
      } catch (err) {
        console.error('Error fetching captain personal student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalData();
  }, [user]);

  if (!user) return null;

  const currentBatch = user.assignedBatch || user.batch || 'HSC 2026';
  const currentSection = user.assignedSection || user.section || 'A';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with Captain & Student Identity */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white rounded-3xl border border-sky-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shrink-0 border-2 border-white/20">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white truncate">
                  {user.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-sky-500/20 text-sky-200 border border-sky-400/30 inline-flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Captain & Student
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-200/80 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  Roll: <span className="font-mono text-white font-bold">{user.rollNumber}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                  {currentBatch}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  Sec {currentSection}
                </span>
                {user.group && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-white">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      {user.group}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shrink-0 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-300">
                Personal Attendance
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {stats ? `${stats.attendancePercentage}%` : '--'}
              </div>
              <p className="text-[10px] text-sky-200/70 font-semibold">
                {stats ? `${stats.daysPresent} of ${stats.totalDays} sessions` : 'Loading records...'}
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 ${
              (stats?.attendancePercentage ?? 100) >= 75 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
            }`}>
              {(stats?.attendancePercentage ?? 100) >= 75 ? '✓' : '!'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-sky-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex-1 sm:flex-none ${
            activeTab === 'overview'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100/60 bg-white/50'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Profile Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex-1 sm:flex-none ${
            activeTab === 'attendance'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100/60 bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">My Attendance ({attendance.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex-1 sm:flex-none ${
            activeTab === 'leaves'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100/60 bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">My Leaves ({leaves.length})</span>
        </button>
      </div>

      {/* TAB 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Low Attendance Warning */}
          {stats && stats.attendancePercentage < 75 && stats.totalDays > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black block uppercase tracking-wider">Attendance Warning &lt; 75%</span>
                <span>Your personal attendance rate is below the institutional 75% requirement. Ensure your presence is certified in upcoming classes.</span>
              </div>
            </div>
          )}

          {/* 4 Metrics KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                <Award className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats ? `${stats.attendancePercentage}%` : '0%'}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                {stats && stats.totalDays > 0 ? `${stats.daysPresent} of ${stats.totalDays} sessions` : 'No sessions recorded'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Days Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {stats ? stats.daysPresent : 0}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Regular attendance</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Days Absent</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {stats ? stats.daysAbsent : 0}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                {stats ? `${stats.daysLate} late entries` : '0 late entries'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sky-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Leaves Granted</span>
                <FileText className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-sky-600">
                {stats ? stats.approvedLeaves : 0}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                {stats ? `${stats.pendingLeaves} pending review` : '0 pending'}
              </p>
            </div>
          </div>

          {/* Academic & Contact Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Information */}
            <div className="p-6 bg-white rounded-3xl border border-sky-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                Academic Enrollment & Responsibilities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">HSC Batch</span>
                  <span className="text-sm font-black text-slate-900">{currentBatch}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Section</span>
                  <span className="text-sm font-black text-sky-700 font-bold">Section {currentSection}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Academic Group</span>
                  <span className="text-sm font-black text-slate-900">{user.group || 'Science'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Official Role</span>
                  <span className="text-sm font-black text-emerald-700">Section Captain</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 bg-white rounded-3xl border border-sky-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-600" />
                Institutional & Contact Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Email</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">{user.email}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Phone</span>
                    <span className="text-xs font-bold text-slate-900">{user.phoneNumber || '+880 1700-000000'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Address</span>
                    <span className="text-xs font-bold text-slate-900">{user.address || 'Dhaka, Bangladesh'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Personal Attendance Log */}
      {activeTab === 'attendance' && (
        <div className="p-4 sm:p-6 bg-white rounded-3xl border border-sky-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-sky-100/70">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                My Attendance Record History
              </h3>
              <p className="text-[11px] font-semibold text-slate-500">
                Official verified records for your class sessions
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-sky-100/80 text-sky-800 text-xs font-black uppercase tracking-wider border border-sky-200/80">
              {attendance.length} {attendance.length === 1 ? 'Session' : 'Sessions'} Logged
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold animate-pulse space-y-2">
              <Calendar className="w-8 h-8 text-sky-400 mx-auto animate-bounce" />
              <p>Loading your personal attendance history...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No attendance sessions recorded yet for your roll number.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {attendance.map((rec) => {
                const statusClean = String(rec.status || '').toLowerCase().trim();
                const isPresent = statusClean === 'present';
                const isAbsent = statusClean === 'absent';
                const isLeave = !isPresent && !isAbsent;
                
                // Convert YYYY-MM-DD to DD-MM-YYYY and extract weekday/month
                const parts = rec.date.split('-');
                let formattedDate = rec.date;
                let dayNum = '--';
                let monthShort = 'DAY';
                let weekdayName = '';

                if (parts.length === 3) {
                  formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  dayNum = parts[2];
                  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  if (!isNaN(d.getTime())) {
                    monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    weekdayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  }
                }

                const StatusIcon = isPresent ? CheckCircle2 : isAbsent ? XCircle : Clock;
                
                // Element-wise aesthetic theme colors
                const cardTheme = isPresent
                  ? {
                      cardBg: 'bg-emerald-50/90 border-2 border-emerald-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md',
                      dateTile: 'bg-white border-emerald-200/90',
                      monthBar: 'bg-emerald-600 text-white',
                      dayText: 'text-emerald-950',
                      weekdayText: 'text-emerald-700',
                      statusBadge: 'bg-emerald-600 text-white shadow-emerald-600/30 ring-emerald-400/40',
                      remarksBg: 'bg-white/80 border-emerald-200/90 text-emerald-950',
                      remarksTag: 'bg-emerald-200 text-emerald-800',
                      certBox: 'bg-emerald-100/70 border-emerald-200/90 text-emerald-900',
                      certLabel: 'text-emerald-700/80',
                      certName: 'text-emerald-950',
                      roleBadge: 'bg-emerald-600 text-white',
                      iconColor: 'text-emerald-600',
                    }
                  : isAbsent
                  ? {
                      cardBg: 'bg-rose-50/90 border-2 border-rose-200/90 hover:border-rose-300 shadow-xs hover:shadow-md',
                      dateTile: 'bg-white border-rose-200/90',
                      monthBar: 'bg-rose-600 text-white',
                      dayText: 'text-rose-950',
                      weekdayText: 'text-rose-700',
                      statusBadge: 'bg-rose-600 text-white shadow-rose-600/30 ring-rose-400/40',
                      remarksBg: 'bg-white/80 border-rose-200/90 text-rose-950',
                      remarksTag: 'bg-rose-200 text-rose-800',
                      certBox: 'bg-rose-100/70 border-rose-200/90 text-rose-900',
                      certLabel: 'text-rose-700/80',
                      certName: 'text-rose-950',
                      roleBadge: 'bg-rose-600 text-white',
                      iconColor: 'text-rose-600',
                    }
                  : {
                      cardBg: 'bg-amber-50/90 border-2 border-amber-200/90 hover:border-amber-300 shadow-xs hover:shadow-md',
                      dateTile: 'bg-white border-amber-200/90',
                      monthBar: 'bg-amber-600 text-white',
                      dayText: 'text-amber-950',
                      weekdayText: 'text-amber-700',
                      statusBadge: 'bg-amber-600 text-white shadow-amber-600/30 ring-amber-400/40',
                      remarksBg: 'bg-white/80 border-amber-200/90 text-amber-950',
                      remarksTag: 'bg-amber-200 text-amber-800',
                      certBox: 'bg-amber-100/70 border-amber-200/90 text-amber-900',
                      certLabel: 'text-amber-700/80',
                      certName: 'text-amber-950',
                      roleBadge: 'bg-amber-600 text-white',
                      iconColor: 'text-amber-600',
                    };

                return (
                  <div
                    key={rec.id}
                    className={`p-4 sm:p-5 rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[170px] ${cardTheme.cardBg}`}
                  >
                    {/* Top Section: Date Tile + Status Pill */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      {/* Iconic Calendar Date Tile */}
                      <div className="flex items-center gap-3">
                        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border shadow-xs flex flex-col items-center justify-between overflow-hidden shrink-0 ${cardTheme.dateTile}`}>
                          <div className={`w-full py-0.5 text-center text-[9px] font-black uppercase tracking-wider leading-none ${cardTheme.monthBar}`}>
                            {monthShort}
                          </div>
                          <span className={`text-base sm:text-lg font-black leading-none my-auto ${cardTheme.dayText}`}>
                            {dayNum}
                          </span>
                          <div className={`text-[8px] font-extrabold uppercase tracking-widest pb-0.5 leading-none ${cardTheme.weekdayText}`}>
                            {weekdayName || 'SEC'}
                          </div>
                        </div>

                        <div>
                          <div className={`font-mono font-black text-sm tracking-tight ${cardTheme.dayText}`}>
                            {formattedDate}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${cardTheme.weekdayText}`}>
                            Class Session
                          </span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isAbsent && (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-lg border border-rose-300/80 font-mono shadow-2xs">
                            ৳100 Fine
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs ring-2 shrink-0 flex items-center gap-1.5 ${cardTheme.statusBadge}`}>
                          <StatusIcon className="w-3.5 h-3.5" strokeWidth={3} />
                          {rec.status || (isLeave ? 'Leave' : 'Unknown')}
                        </span>
                      </div>
                    </div>

                    {/* Optional Remarks Section */}
                    {rec.remarks ? (
                      <div className={`p-2.5 sm:p-3 rounded-2xl mb-3 border text-xs font-medium flex items-start gap-2 shadow-2xs ${cardTheme.remarksBg}`}>
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cardTheme.iconColor}`} />
                        <div className="min-w-0 flex-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mr-1.5 inline-block ${cardTheme.remarksTag}`}>
                            Remarks
                          </span>
                          <span className="text-xs leading-relaxed">{rec.remarks}</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Bottom Row: Certified By Stamp Bar */}
                    <div className={`mt-auto p-2.5 rounded-2xl border flex items-center justify-between text-xs shadow-2xs ${cardTheme.certBox}`}>
                      <span className={`font-black text-[10px] uppercase tracking-widest ${cardTheme.certLabel}`}>
                        Certified by
                      </span>
                      {rec.markedBy ? (
                        <div className={`font-bold flex items-center gap-1.5 ${cardTheme.certName}`}>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[130px] sm:max-w-[180px]">{rec.markedBy.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${cardTheme.roleBadge}`}>
                            {rec.markedBy.role}
                          </span>
                        </div>
                      ) : (
                        <span className={`font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${cardTheme.roleBadge}`}>
                          System
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Personal Leaves */}
      {activeTab === 'leaves' && (
        <div className="p-4 sm:p-6 bg-white rounded-3xl border border-sky-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-sky-100/70">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                My Leave Applications
              </h3>
              <p className="text-[11px] font-semibold text-slate-500">
                Review your submitted student leave requests
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-sky-100/80 text-sky-800 text-xs font-black uppercase tracking-wider border border-sky-200/80">
              {leaves.length} {leaves.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold animate-pulse space-y-2">
              <FileText className="w-8 h-8 text-sky-400 mx-auto animate-bounce" />
              <p>Loading leave records...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">You have not submitted any student leave applications.</p>
            </div>
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {leaves.map((leave) => {
                const isApproved = leave.status === 'Approved';
                const isRejected = leave.status === 'Rejected';
                
                const StatusIcon = isApproved ? CheckCircle2 : isRejected ? XCircle : Clock;
                
                const cardBg = isApproved 
                  ? 'bg-emerald-50/90 border-2 border-emerald-200/90 hover:border-emerald-300' 
                  : isRejected 
                  ? 'bg-rose-50/90 border-2 border-rose-200/90 hover:border-rose-300'
                  : 'bg-amber-50/90 border-2 border-amber-200/90 hover:border-amber-300';
                  
                const badgeStyle = isApproved
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-emerald-400/40'
                  : isRejected
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-rose-400/40'
                  : 'bg-amber-600 text-white shadow-amber-600/30 ring-amber-400/40';

                const textMuted = isApproved ? 'text-emerald-700/80' : isRejected ? 'text-rose-700/80' : 'text-amber-700/80';
                const textBold = isApproved ? 'text-emerald-950' : isRejected ? 'text-rose-950' : 'text-amber-950';
                const innerBg = isApproved ? 'bg-white/80 border-emerald-200/90' : isRejected ? 'bg-white/80 border-rose-200/90' : 'bg-white/80 border-amber-200/90';
                const certBox = isApproved ? 'bg-emerald-100/70 border-emerald-200/90' : isRejected ? 'bg-rose-100/70 border-rose-200/90' : 'bg-amber-100/70 border-amber-200/90';

                return (
                  <div key={leave.id} className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${cardBg}`}>
                    <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs ring-2 shrink-0 flex items-center gap-1.5 ${badgeStyle}`}>
                          <StatusIcon className="w-3.5 h-3.5" strokeWidth={3} />
                          {leave.status}
                        </span>
                        <span className={`text-sm sm:text-base font-black tracking-tight ${textBold}`}>
                          {leave.leaveType} Leave
                        </span>
                      </div>
                      
                      <div className={`p-3 rounded-2xl border text-xs font-medium shadow-2xs ${innerBg} ${textBold}`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${textMuted}`}>
                          Reason provided:
                        </span>
                        <p className="leading-relaxed">{leave.reason}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${innerBg} ${textBold}`}>
                          <Calendar className={`w-3.5 h-3.5 ${textMuted}`} />
                          {leave.startDate} <span className={textMuted}>to</span> {leave.endDate}
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${innerBg} ${textBold}`}>
                          {leave.daysCount} {leave.daysCount === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex flex-col sm:items-end text-[10px] uppercase tracking-widest shrink-0 mt-1 sm:mt-0 p-2.5 sm:p-3 rounded-2xl border ${certBox} ${textMuted}`}>
                      <span className="font-black">Reviewed by</span>
                      {leave.reviewedBy ? (
                        <div className={`font-bold flex items-center gap-1.5 mt-0.5 ${textBold}`}>
                          <span>{leave.reviewedBy}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase text-white ${isApproved ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-amber-600'}`}>
                            Captain
                          </span>
                        </div>
                      ) : (
                        <span className={`font-bold mt-0.5 ${textBold}`}>Pending Review</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
