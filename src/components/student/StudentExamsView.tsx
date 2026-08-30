'use client';

import React, { useState } from 'react';
import { Student, Exam } from '../../types';
import { formatEid } from '../../utils/id';
import { 
  ClipboardList, Search, Calendar, Clock, Sparkles, 
  Trophy, Percent, Award, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck 
} from 'lucide-react';

interface StudentExamsViewProps {
  student: Student;
  exams: Exam[];
}

export default function StudentExamsView({
  student,
  exams,
}: StudentExamsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'obtained'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort exams
  const studentExams = exams
    .filter(e => e.studentSid === student.sid)
    .filter(e => {
      // Search term
      let matchesText = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const top = (e.subjectAndTopic || '').toLowerCase();
        const com = (e.comment || '').toLowerCase();
        const rem = (e.remarks || '').toLowerCase();
        const statusStr = e.status.toLowerCase();
        const dateStr = e.date.toLowerCase();
        matchesText = top.includes(term) || com.includes(term) || rem.includes(term) || statusStr.includes(term) || dateStr.includes(term);
      }

      // Specific Date
      let matchesDate = true;
      if (filterDate) {
        matchesDate = e.date === filterDate;
      }

      // Month & Year
      let matchesMonth = true;
      if (filterMonth) {
        matchesMonth = e.date.startsWith(filterMonth);
      }

      return matchesText && matchesDate && matchesMonth;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'subject') {
        cmp = (a.subjectAndTopic || '').localeCompare(b.subjectAndTopic || '');
      } else if (sortBy === 'obtained') {
        const aObt = a.status === 'Absent' ? 0 : (a.obtainedMarks || 0);
        const bObt = b.status === 'Absent' ? 0 : (b.obtainedMarks || 0);
        cmp = aObt - bObt;
      }

      if (cmp === 0) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });

  // Analytics for student
  const presentExams = studentExams.filter(e => e.status === 'Present');
  let avgPct = 0;
  let highestPct = 0;
  if (presentExams.length > 0) {
    let sumPct = 0;
    presentExams.forEach(e => {
      const pct = e.totalMarks > 0 ? ((e.obtainedMarks || 0) / e.totalMarks) * 100 : 0;
      sumPct += pct;
      if (pct > highestPct) highestPct = pct;
    });
    avgPct = Math.round(sumPct / presentExams.length);
    highestPct = Math.round(highestPct);
  }

  return (
    <div className="bg-emerald-50/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-5 animate-fadeIn" id="student-exams-panel">
      {/* Aesthetic Glowing Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 text-white rounded-2xl shadow-md shadow-purple-500/20 animate-glow-purple">
              <ClipboardList className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Exam Results & Marks Ledger
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-purple-100 text-purple-950 rounded-full border border-purple-300 shadow-2xs">
                  GRADES
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Read-only academic log of topic exams & marks</p>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl text-xs font-black font-mono shadow-md shadow-purple-500/25 border border-purple-400/50 flex items-center gap-2 animate-glow-purple">
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Avg Score: {avgPct}%</span>
          </div>

          <div className="px-3 py-2 bg-indigo-50/90 border border-indigo-200 text-indigo-950 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Best: {highestPct}%</span>
          </div>

          <div className="px-3 py-2 bg-purple-50/90 border border-purple-200 text-purple-950 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{studentExams.length} Exams</span>
          </div>
        </div>
      </div>

      {/* Element-Wise Filters & Search */}
      <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50 p-3.5 sm:p-4 rounded-2xl border border-purple-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Text Search (Purple Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-purple-500/20">
            <div className="p-1.5 bg-purple-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or remarks..."
              className="w-full py-1 pr-6 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-purple-900/40 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg mr-1 font-black shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Specific Date Filter (Sky Theme) */}
          <div className="flex items-center bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-1.5 shadow-2xs">
            <div className="p-1.5 bg-sky-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setFilterMonth('');
              }}
              className="w-full bg-transparent text-xs font-black text-sky-950 focus:outline-hidden cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg mr-1 font-black shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Filter (Violet Theme) */}
          <div className="flex items-center bg-gradient-to-r from-violet-50 via-fuchsia-50/60 to-violet-50 border border-violet-200/90 rounded-2xl p-1.5 shadow-2xs">
            <div className="p-1.5 bg-violet-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate('');
              }}
              className="w-full bg-transparent text-xs font-black text-violet-950 focus:outline-hidden cursor-pointer"
            />
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg mr-1 font-black shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sorting controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-purple-200/60 text-xs">
          <span className="text-[10px] sm:text-[11px] font-black text-purple-950 uppercase tracking-wider font-mono">
            Showing {studentExams.length} evaluation records
          </span>
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-emerald-100/80 border border-purple-200 rounded-xl text-xs font-bold text-purple-950 focus:outline-hidden"
            >
              <option value="date">Date</option>
              <option value="subject">Subject / Topic</option>
              <option value="obtained">Obtained Score</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 bg-emerald-100/80 border border-purple-200 rounded-xl text-xs font-black text-purple-950 cursor-pointer shadow-2xs"
            >
              {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Exam Cards */}
      {studentExams.length > 0 ? (
        <div className="space-y-4">
          {studentExams.map((exam, index) => {
            const isAbsent = exam.status === 'Absent';
            const pct = !isAbsent && exam.totalMarks > 0 
              ? Math.round(((exam.obtainedMarks || 0) / exam.totalMarks) * 100) 
              : null;

            let badgeColor = 'bg-emerald-600 text-white';
            let bgStyle = 'bg-emerald-50/50 border-emerald-200';
            let barColor = 'from-emerald-500 to-teal-400';
            let gradeLabel = 'Passed';

            if (pct !== null) {
              if (pct >= 80) {
                badgeColor = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30 animate-glow-emerald';
                bgStyle = 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-teal-100/40 border-emerald-300/80';
                barColor = 'from-emerald-500 to-teal-400';
                gradeLabel = 'A+ (Excellent)';
              } else if (pct >= 60) {
                badgeColor = 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 animate-glow-indigo';
                bgStyle = 'bg-gradient-to-br from-indigo-50 via-purple-50/50 to-emerald-50/40 border-indigo-300/80';
                barColor = 'from-indigo-500 to-purple-400';
                gradeLabel = 'B (Good)';
              } else if (pct >= 40) {
                badgeColor = 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 animate-glow-amber';
                bgStyle = 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-emerald-50/40 border-amber-300/80';
                barColor = 'from-amber-500 to-orange-400';
                gradeLabel = 'C (Average)';
              } else {
                badgeColor = 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30';
                bgStyle = 'bg-gradient-to-br from-rose-50 via-pink-50/50 to-emerald-50/40 border-rose-300/80';
                barColor = 'from-rose-500 to-red-400';
                gradeLabel = 'Needs Improvement';
              }
            }

            return (
              <div 
                key={exam.eid ? `${exam.eid}-${index}` : `exam-${index}`}
                className={`border rounded-3xl p-5 transition-all duration-300 space-y-4 ${
                  isAbsent 
                    ? 'bg-gradient-to-r from-rose-50/80 via-emerald-50/30 to-rose-50/50 border-rose-200/90' 
                    : 'bg-gradient-to-r from-purple-50/70 via-emerald-50/40 to-indigo-50/70 border-purple-200/90 hover:border-purple-300 shadow-2xs hover:shadow-lg hover:shadow-purple-100'
                }`}
              >
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-purple-100/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-black text-purple-950 bg-purple-100/90 px-2.5 py-1 rounded-xl border border-purple-300 shadow-2xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      {formatEid(exam.eid)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1 bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      {exam.date}
                    </span>
                    {pct !== null && (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {gradeLabel}
                      </span>
                    )}
                  </div>

                  <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase border shadow-2xs flex items-center gap-1.5 ${
                    isAbsent 
                      ? 'bg-rose-100/90 text-rose-900 border-rose-300' 
                      : 'bg-emerald-100/90 text-emerald-950 border-emerald-300 animate-glow-emerald'
                  }`}>
                    {isAbsent ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {exam.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-emerald-50/60 p-3.5 rounded-2xl border border-indigo-200/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 shadow-2xs">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block font-mono">Exam Topic & Syllabus</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug pt-0.5">
                      {isAbsent ? <span className="text-slate-400 italic font-normal">No Exam (Absent)</span> : exam.subjectAndTopic}
                    </h4>
                  </div>

                  {!isAbsent && (
                    <div className="md:col-span-5 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl border border-purple-300/40 text-white shadow-md shadow-purple-500/20 animate-glow-purple space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest block font-mono">Obtained Score</span>
                          <span className="text-2xl font-black font-mono text-white tracking-tight">
                            {exam.obtainedMarks ?? 0} <span className="text-xs text-purple-200 font-sans font-bold">/ {exam.totalMarks} Total</span>
                          </span>
                        </div>
                        {pct !== null && (
                          <span className="text-sm px-3.5 py-1.5 rounded-2xl font-black font-mono bg-white text-purple-950 border border-purple-200 shadow-2xs">
                            {pct}%
                          </span>
                        )}
                      </div>

                      {pct !== null && (
                        <div className="w-full bg-purple-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-purple-400/30">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`} 
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Feedback & remarks */}
                {(exam.remarks || exam.comment) && (
                  <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    {exam.remarks && (
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-950 rounded-xl text-xs font-black border border-purple-300 shadow-2xs font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-purple-700 mr-1.5 shrink-0" />
                        Tag: {exam.remarks}
                      </span>
                    )}
                    {exam.comment && (
                      <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 flex items-center gap-2 shadow-2xs flex-1">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>"{exam.comment}"</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-14 text-center text-slate-400 border border-dashed border-purple-200 rounded-3xl bg-purple-50/30 space-y-3">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-3xl w-14 h-14 mx-auto flex items-center justify-center shadow-inner border border-purple-200 animate-glow-purple">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800">No Exam Logs Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">No evaluation entries match your filter or search query.</p>
          </div>
        </div>
      )}
    </div>
  );
}
