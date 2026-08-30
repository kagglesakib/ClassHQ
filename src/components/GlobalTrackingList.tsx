import React, { useState, useMemo } from 'react';
import { Student, Activity } from '../types';
import { formatAid } from '../utils/id';
import {
  Calendar, Users, BookOpen, Clock, CheckCircle2, XCircle, Search,
  ArrowUpDown, Filter, GraduationCap, Award, Percent, ClipboardList,
  Edit3, Trash2, Sparkles
} from 'lucide-react';
import { formatBatch } from '../utils/formatBatch';
import { EditActivityModal, DeleteConfirmModal } from './modals/EditDeleteModals';
import { useAuth } from '../context/AuthContext';

interface GlobalTrackingListProps {
  activities: Activity[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onUpdateActivity?: (updated: Activity) => Promise<void> | void;
  onDeleteActivity?: (aid: string) => Promise<void> | void;
}

export default function GlobalTrackingList({
  activities,
  students,
  onSelectStudent,
  onUpdateActivity,
  onDeleteActivity,
}: GlobalTrackingListProps) {
  const { user } = useAuth();
  const isStudentUser = user?.userType === 'student';

  const formatMark = (value?: number | null) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return value.toFixed(2);
  };

  // Modal State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentSid, setSelectedStudentSid] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'hw' | 'cw'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper mapping: SID -> Student Object
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.sid, s));
    return map;
  }, [students]);

  // Unique lists for filter dropdowns
  const activeMonths = useMemo(() => {
    const months = activities.map(a => a.date.substring(0, 7));
    return Array.from(new Set(months)).sort().reverse();
  }, [activities]);

  // Toggle sorting helper
  const handleSort = (field: 'date' | 'name' | 'hw' | 'cw') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filtered and sorted tracking list
  const filteredActivities = useMemo(() => {
    return activities
      .filter(act => {
        const student = studentMap.get(act.studentSid);
        const name = student ? student.name.toLowerCase() : '';
        const sid = act.studentSid.toLowerCase();
        const sub = (act.subjectTuitioned || '').toLowerCase();
        const comment = (act.comment || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        // Search term matching
        const matchesSearch =
          name.includes(search) ||
          sid.includes(search) ||
          sub.includes(search) ||
          comment.includes(search) ||
          act.date.includes(search);

        // Student dropdown filter
        const matchesStudent = selectedStudentSid === 'ALL' || act.studentSid === selectedStudentSid;

        // Month filter
        const matchesMonth = !selectedMonth || act.date.startsWith(selectedMonth);

        // Status filter
        const matchesStatus = selectedStatus === 'ALL' || act.status === selectedStatus;

        return matchesSearch && matchesStudent && matchesMonth && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'name') {
          const nameA = studentMap.get(a.studentSid)?.name || '';
          const nameB = studentMap.get(b.studentSid)?.name || '';
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === 'hw') {
          const hwA = a.hwMarks ?? 0;
          const hwB = b.hwMarks ?? 0;
          comparison = hwA - hwB;
        } else if (sortBy === 'cw') {
          const cwA = a.cwMarks ?? 0;
          const cwB = b.cwMarks ?? 0;
          comparison = cwA - cwB;
        }

        if (comparison === 0) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [activities, studentMap, searchTerm, selectedStudentSid, selectedMonth, selectedStatus, sortBy, sortOrder]);

  // Aggregate stats on filtered data
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    if (total === 0) return { attendanceRate: 0, avgHw: 0, avgCw: 0, presentCount: 0, absentCount: 0 };

    const present = filteredActivities.filter(a => a.status === 'Present');
    const presentCount = present.length;
    const absentCount = total - presentCount;
    const attendanceRate = Math.round((presentCount / total) * 100);

    const hwValid = present.filter(a => a.hwMarks !== undefined && a.hwMarks !== null);
    const avgHw = hwValid.length > 0
      ? Math.round((hwValid.reduce((sum, a) => sum + (a.hwMarks || 0), 0) / hwValid.length) * 100) / 100
      : 0;

    const cwValid = present.filter(a => a.cwMarks !== undefined && a.cwMarks !== null);
    const avgCw = cwValid.length > 0
      ? Math.round((cwValid.reduce((sum, a) => sum + (a.cwMarks || 0), 0) / cwValid.length) * 100) / 100
      : 0;

    return { attendanceRate, avgHw, avgCw, presentCount, absentCount };
  }, [filteredActivities]);

  const handleSaveEdit = async (updatedActivity: Activity) => {
    if (onUpdateActivity) {
      await onUpdateActivity(updatedActivity);
    } else {
      const res = await fetch(`/api/activities/${updatedActivity.aid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedActivity),
      });
      if (!res.ok) throw new Error('Failed to update activity log');
    }
    setEditingActivity(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;
    if (onDeleteActivity) {
      await onDeleteActivity(deletingActivity.aid);
    } else {
      const res = await fetch(`/api/activities/${deletingActivity.aid}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete activity log');
    }
    setDeletingActivity(null);
  };

  return (
    <div className="space-y-6" id="global-tracking-dashboard">
      {/* Top Banner & Title */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-indigo-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-sky-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 animate-glow-indigo">
            <ClipboardList className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
              Unified Student Tracking Feed
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">Daily lesson summaries, attendance status, and coursework performance logged across all students.</p>
          </div>
        </div>
        <div className="text-xs text-white bg-gradient-to-r from-indigo-700 to-sky-700 font-black px-4 py-2 rounded-2xl font-mono shadow-md shadow-indigo-500/20 animate-glow-indigo shrink-0">
          Total Logs: {filteredActivities.length}
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 rounded-2xl border border-indigo-400/40 shadow-md shadow-indigo-500/20 animate-glow-indigo">
          <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-mono font-black block">Lessons Covered</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-display font-black text-white">{filteredActivities.length}</span>
            <ClipboardList className="w-5 h-5 text-indigo-200" />
          </div>
          <p className="text-[10px] text-indigo-100 font-bold mt-1">{stats.presentCount} present • {stats.absentCount} absent</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white p-4 rounded-2xl border border-emerald-400/40 shadow-md shadow-emerald-500/20 animate-glow-emerald">
          <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-mono font-black block">Avg Attendance Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-display font-black text-white">{stats.attendanceRate}%</span>
            <Percent className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden border border-white/20">
            <div className="bg-emerald-300 h-full transition-all duration-500" style={{ width: `${stats.attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white p-4 rounded-2xl border border-amber-300/40 shadow-md shadow-amber-500/20 animate-glow-amber">
          <span className="text-[10px] text-amber-100 uppercase tracking-wider font-mono font-black block">Avg Homework Score</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-display font-black text-white">{stats.avgHw.toFixed(2)}</span>
            <Award className="w-5 h-5 text-amber-200" />
          </div>
          <p className="text-[10px] text-amber-100 font-bold mt-1">From Present log records</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 text-white p-4 rounded-2xl border border-purple-400/40 shadow-md shadow-purple-500/20 animate-glow-purple">
          <span className="text-[10px] text-purple-200 uppercase tracking-wider font-mono font-black block">Avg Classwork Score</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-display font-black text-white">{stats.avgCw.toFixed(2)}</span>
            <GraduationCap className="w-5 h-5 text-purple-200" />
          </div>
          <p className="text-[10px] text-purple-100 font-bold mt-1">From active classroom practice</p>
        </div>
      </div>

      {/* Element-Wise Filter Toolbar Card */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Element-wise Text Search input */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic, comment, or date..."
              className="w-full py-1 pr-8 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-indigo-900/40 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Element-wise Student Filter dropdown (Sky Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-sky-400/30 transition-all">
            <div className="p-1.5 bg-sky-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Users className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedStudentSid}
              onChange={(e) => setSelectedStudentSid(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-sky-950 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Students</option>
              {students.map((s, idx) => (
                <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>{s.name} (ID : {s.sid})</option>
              ))}
            </select>
          </div>

          {/* Element-wise Month filter select (Purple Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-violet-50/60 to-purple-50 border border-purple-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-purple-400/30 transition-all">
            <div className="p-1.5 bg-purple-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-purple-950 focus:outline-hidden cursor-pointer"
            >
              <option value="">All Months</option>
              {activeMonths.map(m => {
                const [y, mm] = m.split('-');
                const d = new Date(Number(y), Number(mm) - 1, 1);
                const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                return <option key={m} value={m}>{monthName}</option>;
              })}
            </select>
          </div>

          {/* Element-wise Status filter selector (Emerald Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
            <div className="p-1.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-emerald-950 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <span className="text-xs font-bold text-slate-500 font-mono">
          Showing {filteredActivities.length} daily logs
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1 font-mono">Sort by:</span>
          {(['date', 'name', 'hw', 'cw'] as const).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                sortBy === field
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>
                {field === 'date' ? 'Date' : field === 'name' ? 'Student' : field === 'hw' ? 'HW Marks' : 'CW Marks'}
              </span>
              {sortBy === field && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Responsive Cards View */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          <div className="space-y-4 flex flex-col">
            {filteredActivities.map((act, idx) => {
              const student = studentMap.get(act.studentSid);
              const isAbsent = act.status === 'Absent';

              return (
                <div
                  key={act.aid ? `${act.aid}-${idx}` : `act-${idx}`}
                  className={`bg-white/95 backdrop-blur-xl border rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative group animate-fadeIn space-y-4 ${
                    isAbsent
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : 'border-slate-200/90 hover:border-indigo-300'
                  }`}
                >
                  {/* Top Bar Header: AID, Student Link, Date, Attendance Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                        {formatAid(act.aid)}
                      </span>

                      <button
                        onClick={() => onSelectStudent(act.studentSid)}
                        className="flex items-center gap-2 bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1 rounded-xl border border-indigo-200/80 text-left transition-all group/btn cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-950 group-hover/btn:text-indigo-600 transition-colors">
                          {student?.name || 'Unknown Student'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                          ID : {act.studentSid}
                        </span>
                      </button>

                      <span className="text-xs font-black text-slate-700 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200/80 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {act.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border shadow-2xs flex items-center gap-1.5 ${
                        isAbsent 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {isAbsent ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Absent
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present
                          </>
                        )}
                      </span>

                      {/* Edit and Delete Buttons */}
                      {!isStudentUser && (
                        <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-2.5 ml-1">
                          <button
                            onClick={() => setEditingActivity(act)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 border border-indigo-200/80 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Edit Daily Log"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingActivity(act)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Delete Daily Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Left Column: Subject & Topic Covered (col-span-7) */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                          <BookOpen className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Topic / Lesson Covered</span>
                      </div>

                      <h4 className="font-display font-black text-slate-900 text-base leading-snug break-words pl-0.5">
                        {isAbsent ? (
                          <span className="text-slate-400 italic font-medium">No Lesson (Absent)</span>
                        ) : (
                          act.subjectTuitioned || 'General Study Session'
                        )}
                      </h4>

                      {/* Elementwise Colorful Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px] font-bold">
                          {formatBatch(student?.hscBatch)}
                        </span>
                        {student?.subject && (
                          <span className="bg-violet-100 text-violet-900 px-2.5 py-1 rounded-lg border border-violet-200 font-bold text-[11px]">
                            {student.subject}
                          </span>
                        )}
                        {student?.college && (
                          <span className="bg-sky-100 text-sky-900 px-2.5 py-1 rounded-lg border border-sky-200 font-bold text-[11px]">
                            {student.college}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: HW & CW Marks Boxes (col-span-5) */}
                    {!isAbsent ? (
                      <div className="md:col-span-5 grid grid-cols-2 gap-3">
                        {/* HW Score Card */}
                        <div className="bg-gradient-to-br from-indigo-50 via-indigo-50/70 to-violet-50/50 p-3.5 rounded-2xl border border-indigo-200/90 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">HW Marks</span>
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div className="text-xl font-black text-indigo-950 font-mono">
                            {formatMark(act.hwMarks)}
                          </div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100/90 text-indigo-900 border border-indigo-300 font-mono">
                            Homework
                          </span>
                        </div>

                        {/* CW Score Card */}
                        <div className="bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50/50 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">CW Marks</span>
                            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="text-xl font-black text-amber-950 font-mono">
                            {formatMark(act.cwMarks)}
                          </div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 font-mono">
                            Classwork
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="md:col-span-5 bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 text-rose-800 text-xs font-bold text-center">
                        Student was absent for this daily session
                      </div>
                    )}

                  </div>

                  {/* Comment & Remarks Footer */}
                  {act.comment && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-200/90 px-2 py-0.5 rounded-md font-mono shrink-0">
                          Teacher Note
                        </span>
                        <p className="text-xs text-slate-800 font-semibold italic leading-relaxed">
                          "{act.comment}"
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <div className="p-4 bg-slate-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-700 font-extrabold">No daily logs found matching criteria</p>
              <p className="text-xs text-slate-400">Try modifying your search or dropdown filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={!!editingActivity}
        activity={editingActivity}
        students={students}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Daily Activity Entry"
        itemIdLabel={deletingActivity ? formatAid(deletingActivity.aid) : ''}
        details={
          deletingActivity
            ? [
                { label: 'Student', value: studentMap.get(deletingActivity.studentSid)?.name || deletingActivity.studentSid },
                { label: 'Date', value: deletingActivity.date },
                { label: 'Topic', value: deletingActivity.subjectTuitioned || 'General Session' },
              ]
            : []
        }
      />
    </div>
  );
}
