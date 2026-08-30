import React, { useState, useMemo } from 'react';
import { Student, Exam } from '../types';
import { formatEid } from '../utils/id';
import {
  Award, Calendar, Users, Trophy, Percent, Search,
  Filter, Sparkles, ClipboardList, CheckCircle2, XCircle,
  Edit3, Trash2, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { formatBatch } from '../utils/formatBatch';
import { EditExamModal, DeleteConfirmModal } from './modals/EditDeleteModals';
import { useAuth } from '../context/AuthContext';

interface GlobalExamListProps {
  exams: Exam[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onUpdateExam?: (updated: Exam) => Promise<void> | void;
  onDeleteExam?: (eid: string) => Promise<void> | void;
}

export default function GlobalExamList({
  exams,
  students,
  onSelectStudent,
  onUpdateExam,
  onDeleteExam,
}: GlobalExamListProps) {
  const { user } = useAuth();
  const isStudentUser = user?.userType === 'student';

  // Modal State
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentSid, setSelectedStudentSid] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'percentage' | 'obtained'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper mapping: SID -> Student Object
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.sid, s));
    return map;
  }, [students]);

  // Filtered and sorted exams list
  const filteredExams = useMemo(() => {
    return exams
      .filter(ex => {
        const student = studentMap.get(ex.studentSid);
        const name = student ? student.name.toLowerCase() : '';
        const sid = ex.studentSid.toLowerCase();
        const topic = (ex.subjectAndTopic || '').toLowerCase();
        const remarks = (ex.remarks || '').toLowerCase();
        const comment = (ex.comment || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          name.includes(search) ||
          sid.includes(search) ||
          topic.includes(search) ||
          remarks.includes(search) ||
          comment.includes(search) ||
          ex.date.includes(search);

        const matchesStudent = selectedStudentSid === 'ALL' || ex.studentSid === selectedStudentSid;
        const matchesStatus = selectedStatus === 'ALL' || ex.status === selectedStatus;

        return matchesSearch && matchesStudent && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'name') {
          const nameA = studentMap.get(a.studentSid)?.name || '';
          const nameB = studentMap.get(b.studentSid)?.name || '';
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === 'obtained') {
          const obtA = a.obtainedMarks ?? 0;
          const obtB = b.obtainedMarks ?? 0;
          comparison = obtA - obtB;
        } else if (sortBy === 'percentage') {
          const pctA = a.totalMarks > 0 ? (a.obtainedMarks ?? 0) / a.totalMarks : 0;
          const pctB = b.totalMarks > 0 ? (b.obtainedMarks ?? 0) / b.totalMarks : 0;
          comparison = pctA - pctB;
        }

        if (comparison === 0) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [exams, studentMap, searchTerm, selectedStudentSid, selectedStatus, sortBy, sortOrder]);

  // Aggregate stats on exams
  const stats = useMemo(() => {
    const total = filteredExams.length;
    if (total === 0) return { avgPercentage: 0, highestPercentage: 0, passCount: 0, failCount: 0, presentCount: 0, absentCount: 0 };

    const presentExams = filteredExams.filter(e => e.status === 'Present');
    const presentCount = presentExams.length;

    let totalPctSum = 0;
    let highestPct = 0;
    let passCount = 0; // >= 50%
    let failCount = 0;

    presentExams.forEach(e => {
      const pct = e.totalMarks > 0 ? (e.obtainedMarks ?? 0) / e.totalMarks : 0;
      totalPctSum += pct;
      if (pct > highestPct) highestPct = pct;

      if (pct >= 0.5) {
        passCount++;
      } else {
        failCount++;
      }
    });

    const avgPercentage = presentCount > 0 ? Math.round((totalPctSum / presentCount) * 100) : 0;
    const highestPercentage = Math.round(highestPct * 100);

    return {
      avgPercentage,
      highestPercentage,
      passCount,
      failCount,
      presentCount,
      absentCount: total - presentCount
    };
  }, [filteredExams]);

  const handleSaveEdit = async (updatedExam: Exam) => {
    if (onUpdateExam) {
      await onUpdateExam(updatedExam);
    } else {
      const res = await fetch(`/api/exams/${updatedExam.eid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExam),
      });
      if (!res.ok) throw new Error('Failed to update exam record');
    }
    setEditingExam(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingExam) return;
    if (onDeleteExam) {
      await onDeleteExam(deletingExam.eid);
    } else {
      const res = await fetch(`/api/exams/${deletingExam.eid}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete exam record');
    }
    setDeletingExam(null);
  };

  return (
    <div className="space-y-6" id="global-exams-dashboard">
      {/* Top Banner & Title with Vibrant Glowing Theme */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 border border-purple-500/40 shadow-xl shadow-purple-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-glow-purple">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl text-purple-300 shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
                Global Exams Dashboard
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </h2>
              <p className="text-xs text-purple-200/90 font-medium leading-relaxed">
                Detailed grading history, success metrics, and class performance averages across all student evaluation tests.
              </p>
            </div>
          </div>
        </div>
        <div className="text-xs text-purple-200 bg-white/10 border border-white/20 font-bold px-4 py-2 rounded-2xl font-mono shadow-inner flex items-center gap-2 self-start md:self-auto">
          <ClipboardList className="w-4 h-4 text-purple-300" />
          <span>Total Exams Logged: <strong className="text-white text-sm font-black">{filteredExams.length}</strong></span>
        </div>
      </div>

      {/* Analytics Widgets Grid with Vibrant Element-Wise Coloring & Glowing Vibes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Widget 1: Evaluations Held */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-indigo-50 text-slate-900 p-5 rounded-3xl border border-indigo-200/90 shadow-md flex items-start justify-between animate-glow-indigo">
          <div>
            <span className="text-[10px] text-indigo-900 uppercase tracking-wider font-extrabold block font-mono">Evaluations Held</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-display font-black text-indigo-950">{filteredExams.length}</span>
              <span className="text-xs text-indigo-700 font-bold font-mono">Tests</span>
            </div>
            <p className="text-[10px] text-indigo-800 mt-1 font-mono">{stats.presentCount} attended • {stats.absentCount} absent</p>
          </div>
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 shadow-2xs">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 2: Average Exam Score */}
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-purple-500/40 shadow-md shadow-purple-500/20 flex items-start justify-between animate-glow-purple">
          <div>
            <span className="text-[10px] text-purple-300 uppercase tracking-wider font-extrabold block font-mono">Average Exam Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-display font-black text-purple-300">{stats.avgPercentage}%</span>
            </div>
            <div className="w-full bg-purple-950/80 h-2 rounded-full mt-2.5 overflow-hidden border border-purple-400/30">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full transition-all duration-700" style={{ width: `${stats.avgPercentage}%` }}></div>
            </div>
          </div>
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 3: Highest Score Achieved */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 text-white p-5 rounded-3xl border border-amber-300/40 shadow-md shadow-amber-500/20 flex items-start justify-between animate-glow-amber">
          <div>
            <span className="text-[10px] text-amber-100 uppercase tracking-wider font-extrabold block font-mono">Highest Score Achieved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-display font-black text-white">{stats.highestPercentage}%</span>
            </div>
            <p className="text-[10px] text-amber-100 mt-1 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-200" /> Top tier evaluation
            </p>
          </div>
          <div className="p-3 bg-white/20 text-white rounded-2xl border border-white/30 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 4: Pass / Benchmark Split */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-emerald-50 text-slate-900 p-5 rounded-3xl border border-emerald-200/90 shadow-md flex items-start justify-between animate-glow-emerald">
          <div>
            <span className="text-[10px] text-teal-900 uppercase tracking-wider font-extrabold block font-mono">Pass / Benchmark Split</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-display font-black text-emerald-950">{stats.passCount}</span>
              <span className="text-xs text-rose-700 font-extrabold font-mono">/ {stats.failCount} Needs Work</span>
            </div>
            <p className="text-[10px] text-teal-800 mt-1 font-mono">Pass rate of 50% benchmark</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 shadow-2xs">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Element-Wise Filter and Controls Panel */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Element-wise Text Search input */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subject, topic, remarks..."
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
                <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>{s.name} ({s.sid})</option>
              ))}
            </select>
          </div>

          {/* Element-wise Attendance Status Filter select (Emerald Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
            <div className="p-1.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-emerald-950 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Attendance Statuses</option>
              <option value="Present">Attended (Present)</option>
              <option value="Absent">Unattended (Absent)</option>
            </select>
          </div>
        </div>

        {/* Sort & Filter Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/50">
          <div className="flex items-center gap-2 text-xs">
            {(selectedStudentSid !== 'ALL' || selectedStatus !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStudentSid('ALL');
                  setSelectedStatus('ALL');
                }}
                className="text-[10px] font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
                type="button"
              >
                Reset Filters
              </button>
            )}
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider font-mono">
              Showing {filteredExams.length} evaluation records
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden transition-all cursor-pointer shadow-2xs"
            >
              <option value="date">Date</option>
              <option value="name">Student Name</option>
              <option value="obtained">Obtained Score</option>
              <option value="percentage">Percentage %</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 rounded-xl text-xs font-black text-purple-950 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Exams Ledger View - Stacked Cards */}
      <div className="space-y-4">
        {filteredExams.length > 0 ? (
          <div className="space-y-4 flex flex-col">
            {filteredExams.map((ex, idx) => {
              const student = studentMap.get(ex.studentSid);
              const isAbsent = ex.status === 'Absent';
              const scorePercentage = ex.status === 'Present' && ex.totalMarks > 0
                ? Math.round(((ex.obtainedMarks || 0) / ex.totalMarks) * 100)
                : null;

              let scoreGrade = { label: 'Absent', color: 'bg-slate-100 text-slate-600 border-slate-200', barGradient: 'bg-slate-300' };
              let scoreBg = 'bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200/80';
              let pctBadge = 'bg-slate-100 text-slate-700 border-slate-200';

              if (scorePercentage !== null) {
                if (scorePercentage >= 80) {
                  scoreGrade = { label: 'A+ (Excellent)', color: 'bg-emerald-600 text-white shadow-xs animate-glow-emerald', barGradient: 'from-emerald-500 to-teal-400' };
                  scoreBg = 'bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-100/40 border-emerald-200/90';
                  pctBadge = 'bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-2xs';
                } else if (scorePercentage >= 60) {
                  scoreGrade = { label: 'B (Good)', color: 'bg-indigo-600 text-white shadow-xs animate-glow-indigo', barGradient: 'from-indigo-500 to-violet-400' };
                  scoreBg = 'bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-indigo-100/40 border-indigo-200/90';
                  pctBadge = 'bg-indigo-100/90 text-indigo-900 border-indigo-300 shadow-2xs';
                } else if (scorePercentage >= 40) {
                  scoreGrade = { label: 'C (Average)', color: 'bg-amber-600 text-white shadow-xs animate-glow-amber', barGradient: 'from-amber-500 to-orange-400' };
                  scoreBg = 'bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-100/40 border-amber-200/90';
                  pctBadge = 'bg-amber-100/90 text-amber-900 border-amber-300 shadow-2xs';
                } else {
                  scoreGrade = { label: 'Needs Improvement', color: 'bg-rose-600 text-white shadow-xs', barGradient: 'from-rose-500 to-red-400' };
                  scoreBg = 'bg-gradient-to-r from-rose-50/90 via-red-50/40 to-rose-100/40 border-rose-200/90';
                  pctBadge = 'bg-rose-100/90 text-rose-900 border-rose-300 shadow-2xs';
                }
              }

              return (
                <div
                  key={ex.eid ? `${ex.eid}-${idx}` : `exam-${idx}`}
                  className="bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/70 border border-purple-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all relative group animate-fadeIn space-y-4"
                >
                  {/* Top Bar Header: EID, Student, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-purple-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-black text-purple-950 bg-purple-100/90 border border-purple-300 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        {formatEid(ex.eid)}
                      </span>

                      <button
                        onClick={() => onSelectStudent(ex.studentSid)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-3 py-1 rounded-xl border border-indigo-200/90 text-left transition-all group/btn cursor-pointer shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-xs font-black text-indigo-950 group-hover/btn:text-indigo-600 transition-colors">
                          {student?.name || 'Unknown Student'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                          ID : {ex.studentSid}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-indigo-500 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                      </button>

                      <span className="text-xs font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80 font-mono flex items-center gap-1.5 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        {ex.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {scorePercentage !== null && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${scoreGrade.color}`}>
                          {scoreGrade.label}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border shadow-2xs flex items-center gap-1.5 ${
                        isAbsent 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-glow-emerald'
                      }`}>
                        {isAbsent ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {ex.status}
                      </span>

                      {/* Edit and Delete Buttons */}
                      {!isStudentUser && (
                        <div className="flex items-center gap-1.5 border-l border-purple-200/80 pl-2.5 ml-1">
                          <button
                            onClick={() => setEditingExam(ex)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Edit Exam Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExam(ex)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Delete Exam Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Exam Details & Scores Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Subject & Topic (col-span-7) */}
                    <div className="md:col-span-7 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-4 rounded-2xl border border-indigo-200/80 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block font-mono">Exam Topic / Syllabus</span>
                      </div>
                      <h4 className="font-display font-black text-slate-900 text-base leading-snug break-words pl-0.5">
                        {isAbsent ? (
                          <span className="text-slate-400 italic font-medium">No Exam (Absent)</span>
                        ) : (
                          ex.subjectAndTopic
                        )}
                      </h4>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 pt-0.5">
                        <span className="text-indigo-600 font-bold">{student?.college || 'Institution N/A'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">{formatBatch(student?.hscBatch, 'HSC')}</span>
                      </div>
                    </div>

                    {/* Right: Score Box & Progress Bar (col-span-5) */}
                    {!isAbsent && (
                      <div className="md:col-span-5 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl border border-purple-300/40 text-white shadow-md shadow-purple-500/20 animate-glow-purple space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black text-purple-200 uppercase tracking-wider block font-mono">Obtained Score</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-2xl font-black text-white font-mono tracking-tight">
                                {ex.obtainedMarks ?? 0}
                              </span>
                              <span className="text-xs font-bold text-purple-200 font-mono">
                                / {ex.totalMarks} Total
                              </span>
                            </div>
                          </div>
                          {scorePercentage !== null && (
                            <div className="text-sm px-3.5 py-1.5 rounded-2xl font-black font-mono bg-white text-purple-950 border border-purple-200 shadow-2xs">
                              {scorePercentage}%
                            </div>
                          )}
                        </div>

                        {/* Smart Progress Bar */}
                        {scorePercentage !== null && (
                          <div className="space-y-1">
                            <div className="w-full bg-purple-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-purple-400/30">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${scoreGrade.barGradient} transition-all duration-700`}
                                style={{ width: `${Math.min(100, Math.max(0, scorePercentage))}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remarks & Notes Footer */}
                  {(ex.remarks || ex.comment) && (
                    <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      {ex.remarks && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-950 rounded-xl text-xs font-black border border-purple-300 font-mono shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-purple-700 mr-1.5 shrink-0" />
                            Tag: {ex.remarks}
                          </span>
                        </div>
                      )}
                      {ex.comment && (
                        <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 leading-relaxed flex-grow flex items-center gap-2 shadow-2xs">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>"{ex.comment}"</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 bg-purple-50/30 rounded-3xl border border-dashed border-purple-200 space-y-3">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-3xl w-14 h-14 flex items-center justify-center mx-auto shadow-inner border border-purple-200 animate-glow-purple">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-800 font-black">No exam logs found matching criteria</p>
              <p className="text-xs text-slate-500">Try modifying your search or dropdown filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Exam Modal */}
      <EditExamModal
        isOpen={!!editingExam}
        exam={editingExam}
        students={students}
        onClose={() => setEditingExam(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Exam Record"
        itemIdLabel={deletingExam ? formatEid(deletingExam.eid) : ''}
        details={
          deletingExam
            ? [
                { label: 'Student', value: studentMap.get(deletingExam.studentSid)?.name || deletingExam.studentSid },
                { label: 'Date', value: deletingExam.date },
                { label: 'Subject / Topic', value: deletingExam.subjectAndTopic },
              ]
            : []
        }
      />
    </div>
  );
}
