'use client';

import React, { useState } from 'react';
import { Student, Activity } from '../../types';
import { formatAid } from '../../utils/id';
import { 
  BookOpen, Search, Calendar, Clock, Sparkles, CheckCircle2, XCircle, Award, GraduationCap, ShieldCheck
} from 'lucide-react';

interface StudentLessonsViewProps {
  student: Student;
  activities: Activity[];
}

export default function StudentLessonsView({
  student,
  activities,
}: StudentLessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'topic' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & sort student's activities
  const studentActivities = activities
    .filter(a => a.studentSid === student.sid)
    .filter(a => {
      // Search term
      let matchesText = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const top = (a.subjectTuitioned || '').toLowerCase();
        const rem = (a.comment || '').toLowerCase();
        const statusStr = a.status.toLowerCase();
        const dateStr = a.date.toLowerCase();
        matchesText = top.includes(term) || rem.includes(term) || statusStr.includes(term) || dateStr.includes(term);
      }

      // Specific Date
      let matchesDate = true;
      if (filterDate) {
        matchesDate = a.date === filterDate;
      }

      // Month & Year
      let matchesMonth = true;
      if (filterMonth) {
        matchesMonth = a.date.startsWith(filterMonth);
      }

      return matchesText && matchesDate && matchesMonth;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'topic') {
        cmp = (a.subjectTuitioned || '').localeCompare(b.subjectTuitioned || '');
      } else if (sortBy === 'status') {
        cmp = a.status.localeCompare(b.status);
      }

      if (cmp === 0) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="bg-emerald-50/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4 sm:space-y-6 animate-fadeIn" id="student-lessons-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-sky-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 animate-glow-indigo">
            <BookOpen className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              Lessons & Daily Progress Record
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </h3>
            <p className="text-xs text-slate-500">Official student academic study log & daily attendance history</p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-700 to-sky-700 text-white border border-indigo-300 rounded-2xl text-xs font-black font-mono self-start sm:self-auto shadow-md shadow-indigo-500/20 animate-glow-indigo">
          {studentActivities.length} Logs Saved
        </div>
      </div>

      {/* Element-Wise Search & Filters Bar */}
      <div className="bg-gradient-to-r from-indigo-50/60 via-sky-50/40 to-slate-50 p-4 rounded-3xl border border-indigo-200/80 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Text Search */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or remarks..."
              className="w-full py-1 pr-6 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-indigo-900/40 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-sky-400/30 transition-all min-w-0">
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
                className="ml-1 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-violet-50/60 to-purple-50 border border-purple-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-purple-400/30 transition-all min-w-0">
            <div className="p-1.5 bg-purple-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate('');
              }}
              className="w-full bg-transparent text-xs font-black text-purple-950 focus:outline-hidden cursor-pointer"
            />
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center justify-between pt-2.5 border-t border-indigo-200/60 text-xs">
          <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider font-mono">
            Showing {studentActivities.length} entries
          </span>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-emerald-100/80 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="topic">Topic</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 bg-emerald-100/80 border border-indigo-200 hover:bg-emerald-200/80 rounded-xl text-xs font-black text-indigo-950 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      {studentActivities.length > 0 ? (
        <div className="space-y-4">
          {studentActivities.map((act, index) => {
            const isAbsent = act.status === 'Absent';
            const hasHw = act.hwMarks !== undefined && act.hwMarks !== null;
            const hasCw = act.cwMarks !== undefined && act.cwMarks !== null;

            return (
              <div 
                key={act.aid ? `${act.aid}-${index}` : `act-${index}`}
                className="bg-gradient-to-r from-sky-50/70 via-emerald-50/40 to-indigo-50/70 border border-sky-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all relative group animate-fadeIn space-y-4"
              >
                {/* Top bar: AID, Date, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-black text-indigo-950 bg-indigo-100/90 border border-indigo-300 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      {formatAid(act.aid)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-emerald-100/80 px-3 py-1 rounded-xl border border-emerald-200/80 font-mono flex items-center gap-1.5 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {act.date}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-2xs flex items-center gap-1.5 ${
                    isAbsent 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-glow-emerald'
                  }`}>
                    {isAbsent ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {act.status}
                  </span>
                </div>

                {/* Lesson Details & Scores */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Topic Box */}
                  <div className="md:col-span-7 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-emerald-50/60 p-4 rounded-2xl border border-indigo-200/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block font-mono">Topic Taught</span>
                    </div>
                    <h4 className="font-display font-black text-slate-900 text-base leading-snug break-words pl-0.5">
                      {isAbsent ? (
                        <span className="text-slate-400 italic font-medium">No Lesson (Absent)</span>
                      ) : (
                        act.subjectTuitioned || 'General Session'
                      )}
                    </h4>
                  </div>

                  {/* Evaluation Scores Box */}
                  {!isAbsent ? (
                    <div className="md:col-span-5 bg-gradient-to-br from-indigo-600 via-sky-600 to-purple-800 p-4 rounded-2xl border border-indigo-300/40 text-white shadow-md shadow-indigo-500/20 animate-glow-indigo space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-wider block font-mono flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          Lesson Evaluation
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold text-white font-mono">
                          Graded
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20 space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-amber-200 font-mono flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-300" />
                            Homework
                          </span>
                          <p className="text-base font-black text-white font-mono">
                            {hasHw ? act.hwMarks!.toFixed(2) : 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20 space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-violet-200 font-mono flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-violet-300" />
                            Classwork
                          </span>
                          <p className="text-base font-black text-white font-mono">
                            {hasCw ? act.cwMarks!.toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-5 bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 text-rose-950 space-y-1">
                      <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider font-mono">Status Notice</span>
                      <p className="text-xs font-bold text-rose-900">Student was absent on this session date.</p>
                    </div>
                  )}
                </div>

                {/* Remarks */}
                {act.comment && (
                  <div className="pt-2 border-t border-indigo-100">
                    <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 leading-relaxed flex items-center gap-2 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>"{act.comment}"</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-14 text-center text-slate-400 border border-dashed border-indigo-200 rounded-3xl bg-indigo-50/30 space-y-3">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-3xl w-14 h-14 mx-auto flex items-center justify-center shadow-inner border border-indigo-200 animate-glow-indigo">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800">No Lesson Logs Found</p>
            <p className="text-xs text-slate-500">No activity entries match your current search or filter parameters.</p>
          </div>
        </div>
      )}
    </div>
  );
}
