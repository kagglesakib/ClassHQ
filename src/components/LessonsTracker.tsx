import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student, Activity } from '../types';
import { generateActivityId, formatAid } from '../utils/id';
import { 
  Plus, X, Calendar, Clock, Edit, Trash2, BookOpen, Search, Sparkles,
  CheckCircle2, XCircle, Award, GraduationCap, ShieldCheck, Flame, Filter
} from 'lucide-react';

interface LessonsTrackerProps {
  student: Student;
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (aid: string) => void;
  onUpdateActivity: (activity: Activity) => void;
}

export default function LessonsTracker({
  student,
  activities,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
}: LessonsTrackerProps) {
  const [mounted, setMounted] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'hw' | 'cw' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // New/Editing Activity form states
  const [actDate, setActDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [actStatus, setActStatus] = useState<string>('Present');
  const [actSubjectTuitioned, setActSubjectTuitioned] = useState('');
  const [actHwMarks, setActHwMarks] = useState('');
  const [actCwMarks, setActCwMarks] = useState('');
  const [isHwNull, setIsHwNull] = useState(false);
  const [isCwNull, setIsCwNull] = useState(false);
  const [actComment, setActComment] = useState('');
  const [formError, setFormError] = useState('');
  const [editingActivityAid, setEditingActivityAid] = useState<string | undefined>(undefined);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  
  // Auto-generated activity ID (AID) starting with "D_"
  const [tempAid, setTempAid] = useState(() => generateActivityId());

  const formatMarkValue = (value?: number | null) => {
    if (value === undefined || value === null) {
      return '';
    }

    return value.toFixed(2);
  };

  const parseMarkValue = (value: string) => {
    if (value.trim() === '') {
      return undefined;
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      return undefined;
    }

    return Math.round(parsedValue * 100) / 100;
  };

  const resetForm = () => {
    setActSubjectTuitioned('');
    setActComment('');
    setActHwMarks('');
    setActCwMarks('');
    setIsHwNull(false);
    setIsCwNull(false);
    setActStatus('Present');
    setEditingActivityAid(undefined);
    setFormError('');
    setShowLogForm(false);
  };

  const toggleLogForm = () => {
    if (showLogForm) {
      resetForm();
    } else {
      setTempAid(generateActivityId());
      setShowLogForm(true);
    }
  };

  // Reset local form/filters when active student changes
  useEffect(() => {
    resetForm();
    setActivityToDelete(null);
    setSearchTerm('');
    setFilterDate('');
    setFilterMonth('');
  }, [student.sid]);

  // Lock body scroll and close on ESC when modal is active
  useEffect(() => {
    if (showLogForm) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') resetForm();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showLogForm]);

  // Filter and sort activities
  const studentActivities = activities
    .filter(a => a.studentSid === student.sid)
    .filter(a => {
      // 1. Text Search Filter (subject, comment, status, date strings)
      let matchesText = true;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const sub = (a.subjectTuitioned || '').toLowerCase();
        const com = (a.comment || '').toLowerCase();
        const statusStr = a.status.toLowerCase();
        const dateStr = a.date.toLowerCase();
        
        // Map months to support textual queries like "July"
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const monthShortNames = [
          'jan', 'feb', 'mar', 'apr', 'may', 'jun',
          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
        ];
        
        let matchesMonthText = false;
        const matchedMonthIdx = monthNames.findIndex(m => m.includes(term)) !== -1
          ? monthNames.findIndex(m => m.includes(term))
          : monthShortNames.findIndex(m => m.includes(term));
          
        if (matchedMonthIdx !== -1) {
          const formattedMonth = String(matchedMonthIdx + 1).padStart(2, '0');
          matchesMonthText = dateStr.includes(`-${formattedMonth}-`);
        }

        matchesText = sub.includes(term) || 
                      com.includes(term) || 
                      statusStr.includes(term) || 
                      dateStr.includes(term) ||
                      matchesMonthText;
      }

      // 2. Specific Date Filter (YYYY-MM-DD)
      let matchesDate = true;
      if (filterDate) {
        matchesDate = a.date === filterDate;
      }

      // 3. Month & Year Filter (YYYY-MM)
      let matchesMonth = true;
      if (filterMonth) {
        matchesMonth = a.date.startsWith(filterMonth);
      }

      return matchesText && matchesDate && matchesMonth;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'subject') {
        const subA = a.subjectTuitioned || '';
        const subB = b.subjectTuitioned || '';
        comparison = subA.localeCompare(subB);
      } else if (sortBy === 'hw') {
        const hwA = a.hwMarks !== undefined && a.hwMarks !== null ? a.hwMarks : 0;
        const hwB = b.hwMarks !== undefined && b.hwMarks !== null ? b.hwMarks : 0;
        comparison = hwA - hwB;
      } else if (sortBy === 'cw') {
        const cwA = a.cwMarks !== undefined && a.cwMarks !== null ? a.cwMarks : 0;
        const cwB = b.cwMarks !== undefined && b.cwMarks !== null ? b.cwMarks : 0;
        comparison = cwA - cwB;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      // Safe fallback stable sort
      if (comparison === 0) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actStatus === 'Present' && !actSubjectTuitioned.trim()) {
      setFormError('Subject & Tuitioned Topic is required when Present.');
      return;
    }

    const isAbsent = actStatus === 'Absent';
    const finalActivity: Activity = {
      aid: tempAid,
      studentSid: student.sid,
      date: actDate,
      status: actStatus,
      subjectTuitioned: isAbsent ? 'N/A' : actSubjectTuitioned.trim(),
      hwMarks: isAbsent ? 0 : (isHwNull ? null : parseMarkValue(actHwMarks)),
      cwMarks: isAbsent ? 0 : (isCwNull ? null : parseMarkValue(actCwMarks)),
      comment: actComment.trim() || undefined,
    };

    if (editingActivityAid) {
      onUpdateActivity(finalActivity);
    } else {
      onAddActivity(finalActivity);
    }

    resetForm();
  };

  const startEditActivity = (act: Activity) => {
    setEditingActivityAid(act.aid);
    setTempAid(act.aid);
    setActDate(act.date);
    setActStatus(act.status);
    setActSubjectTuitioned(act.status === 'Absent' ? '' : (act.subjectTuitioned || ''));
    
    const hwIsNull = act.hwMarks === null || act.hwMarks === undefined;
    setIsHwNull(act.status === 'Absent' ? false : hwIsNull);
    setActHwMarks(act.status === 'Absent' ? '0.00' : (hwIsNull ? '' : formatMarkValue(act.hwMarks)));

    const cwIsNull = act.cwMarks === null || act.cwMarks === undefined;
    setIsCwNull(act.status === 'Absent' ? false : cwIsNull);
    setActCwMarks(act.status === 'Absent' ? '0.00' : (cwIsNull ? '' : formatMarkValue(act.cwMarks)));

    setActComment(act.comment || '');
    setShowLogForm(true);
    setFormError('');
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-6 animate-fadeIn" id="activity-logs-panel">
      {/* Activities Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-sky-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 animate-glow-indigo">
            <BookOpen className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              Smart Lessons Ledger
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </h3>
            <p className="text-xs text-slate-500">Log daily lesson topics, homework completion levels, and classwork evaluations</p>
          </div>
        </div>

        <button
          onClick={toggleLogForm}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 via-sky-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white rounded-2xl text-xs font-black flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer shadow-md shadow-indigo-500/20 animate-glow-indigo"
        >
          {showLogForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-amber-300" />}
          {showLogForm ? (editingActivityAid ? 'Cancel Editing' : 'Close Tracker') : 'Log Daily Lesson Progress'}
        </button>
      </div>

      {/* Pop Up Window Modal for Adding / Editing Lesson Log */}
      {showLogForm && mounted && createPortal(
        <div 
          className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden my-auto flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md animate-glow-indigo">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 backdrop-blur-md rounded-2xl border border-indigo-400/30 text-amber-300 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                    {editingActivityAid ? 'Edit Daily Activity Record' : 'Log New Daily Lesson Record'}
                  </h4>
                  <p className="text-[11px] text-indigo-200 font-medium flex items-center gap-2 mt-0.5">
                    <span>Student: <strong className="text-white font-bold">{student.name}</strong></span>
                    <span className="opacity-50">•</span>
                    <span className="font-mono text-[10px] bg-white/15 px-2 py-0.5 rounded-lg text-indigo-100 font-bold">SID: {student.sid}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10"
                title="Close window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleLogSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-2xl font-bold border border-rose-200 flex items-center gap-2 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Activity ID (AID) - NOT EDITABLE */}
                <div className="space-y-1 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200/80">
                  <label className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>Activity ID (AID)</span>
                    <span className="text-[9px] text-indigo-600 font-normal">(Auto)</span>
                  </label>
                  <input
                    type="text"
                    value={formatAid(tempAid)}
                    disabled
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold text-indigo-950 cursor-not-allowed focus:outline-hidden"
                  />
                </div>

                {/* Student ID (SID) - NOT EDITABLE */}
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>Student ID (SID)</span>
                    <span className="text-[9px] text-slate-400 font-normal">(Locked)</span>
                  </label>
                  <input
                    type="text"
                    value={student.sid}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed focus:outline-hidden"
                  />
                </div>

                {/* Date Picker */}
                <div className="space-y-1 bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200/80">
                  <label className="text-[10px] font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    Date of Lesson
                  </label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-300 focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Attendance Status */}
                <div className="space-y-1 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider font-mono">Attendance Status</label>
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setActStatus('Present')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        actStatus === 'Present'
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs animate-glow-emerald'
                          : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setActStatus('Absent')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        actStatus === 'Absent'
                          ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                          : 'bg-white border-rose-200 text-rose-900 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Absent
                    </button>
                  </div>
                </div>

                {/* Subject Tuitioned */}
                <div className="space-y-1 sm:col-span-2 bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200/80">
                  <label className="text-[10px] font-black text-purple-950 uppercase tracking-wider font-mono">Subject & Lesson Topic</label>
                  <input
                    type="text"
                    value={actStatus === 'Absent' ? 'N/A' : actSubjectTuitioned}
                    onChange={(e) => setActSubjectTuitioned(e.target.value)}
                    disabled={actStatus === 'Absent'}
                    placeholder="e.g. Physics - Circular Motion & Gravitational Fields"
                    className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-100 disabled:text-slate-400 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-300 focus:outline-hidden"
                  />
                </div>

                {/* Homework Marks */}
                <div className="space-y-1.5 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Homework Marks
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-amber-950 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-300 transition-all select-none">
                      <input
                        type="checkbox"
                        checked={isHwNull}
                        disabled={actStatus === 'Absent'}
                        onChange={(e) => {
                          setIsHwNull(e.target.checked);
                          if (e.target.checked) setActHwMarks('');
                        }}
                        className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                      />
                      Not Graded
                    </label>
                  </div>
                  {isHwNull ? (
                    <input
                      type="text"
                      value="Null / Not Graded"
                      disabled
                      className="w-full px-3 py-2 bg-amber-100/80 border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-950 cursor-not-allowed shadow-inner"
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={actStatus === 'Absent' ? '0.00' : actHwMarks}
                      onChange={(e) => setActHwMarks(e.target.value)}
                      disabled={actStatus === 'Absent'}
                      placeholder="e.g. 8.50"
                      className="w-full px-3 py-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 focus:outline-hidden"
                    />
                  )}
                </div>

                {/* Classwork Marks */}
                <div className="space-y-1.5 bg-violet-50/80 p-3.5 rounded-2xl border border-violet-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-violet-950 uppercase tracking-wider font-mono flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-violet-600" />
                      Classwork Marks
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-violet-950 bg-white/90 px-2 py-0.5 rounded-lg border border-violet-300 transition-all select-none">
                      <input
                        type="checkbox"
                        checked={isCwNull}
                        disabled={actStatus === 'Absent'}
                        onChange={(e) => {
                          setIsCwNull(e.target.checked);
                          if (e.target.checked) setActCwMarks('');
                        }}
                        className="w-3.5 h-3.5 accent-violet-600 rounded cursor-pointer"
                      />
                      Not Graded
                    </label>
                  </div>
                  {isCwNull ? (
                    <input
                      type="text"
                      value="Null / Not Graded"
                      disabled
                      className="w-full px-3 py-2 bg-violet-100/80 border border-violet-300 rounded-xl text-xs font-mono font-bold text-violet-950 cursor-not-allowed shadow-inner"
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={actStatus === 'Absent' ? '0.00' : actCwMarks}
                      onChange={(e) => setActCwMarks(e.target.value)}
                      disabled={actStatus === 'Absent'}
                      placeholder="e.g. 9.00"
                      className="w-full px-3 py-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 border border-violet-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-violet-300 focus:outline-hidden"
                    />
                  )}
                </div>

                {/* Comment / Remarks */}
                <div className="space-y-1 sm:col-span-2 bg-teal-50/80 p-3.5 rounded-2xl border border-teal-200/80">
                  <label className="text-[10px] font-black text-teal-950 uppercase tracking-wider font-mono">Remarks & Feedback Notes</label>
                  <textarea
                    value={actComment}
                    onChange={(e) => setActComment(e.target.value)}
                    placeholder="Add lesson remarks, key concepts covered, student comprehension levels, or reason for absence..."
                    rows={2.5}
                    className="w-full px-3.5 py-2.5 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-300 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-extrabold rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-700 via-sky-700 to-amber-600 hover:from-indigo-800 hover:to-sky-800 text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-2 animate-glow-indigo text-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {editingActivityAid ? 'Save Changes' : 'Log Activity Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Lesson Filter and sorting control bar */}
      <div className="space-y-6" id="activity-timeline">
        {/* Element-Wise Filter and sorting control bar */}
        <div className="bg-gradient-to-r from-indigo-50/60 via-sky-50/40 to-slate-50 p-4 rounded-3xl border border-indigo-200/80 shadow-md space-y-3 animate-fadeIn">
          {/* Search & Date Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Element-wise Text search */}
            <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic, status, remarks..."
                className="w-full py-1 pr-8 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-indigo-900/40 focus:outline-hidden"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs"
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Element-wise Filter by Specific Date (Sky Theme) */}
            <div className="relative flex items-center bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-sky-400/30 transition-all min-w-0">
              <div className="p-1.5 bg-sky-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setFilterMonth(''); // Clear month filter if specific date is selected
                }}
                className="min-w-0 w-full bg-transparent text-xs text-sky-950 focus:outline-hidden font-black cursor-pointer py-0"
                title="Filter by Specific Lesson Date"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="ml-1.5 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
                  title="Clear Date Filter"
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Element-wise Filter by Month + Year (Purple Theme) */}
            <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-violet-50/60 to-purple-50 border border-purple-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-purple-400/30 transition-all min-w-0">
              <div className="p-1.5 bg-purple-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setFilterDate(''); // Clear specific date filter if month is selected
                }}
                className="min-w-0 w-full bg-transparent text-xs text-purple-950 focus:outline-hidden font-black cursor-pointer py-0"
                title="Filter by Lesson Month & Year"
              />
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth('')}
                  className="ml-1.5 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  title="Clear Month Filter"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-indigo-200/60">
            <div className="flex items-center gap-2 text-xs">
              {(filterDate || filterMonth || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDate('');
                    setFilterMonth('');
                  }}
                  className="text-[10px] font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
                  type="button"
                >
                  Reset Filters
                </button>
              )}
              <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider font-mono">
                Showing {studentActivities.length} lesson records
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 focus:outline-hidden transition-all cursor-pointer shadow-2xs"
              >
                <option value="date">Date</option>
                <option value="subject">Subject / Topic</option>
                <option value="hw">Homework Marks</option>
                <option value="cw">Classwork Marks</option>
                <option value="status">Status (Present/Absent)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl text-xs font-black text-indigo-950 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title={sortOrder === 'asc' ? 'Sorting Ascending' : 'Sorting Descending'}
              >
                {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Smart Stacked Lesson Cards View */}
        {studentActivities.length > 0 ? (
          <div className="space-y-4 flex flex-col">
            {studentActivities.map((act, index) => {
              const isAbsent = act.status === 'Absent';
              const hasHw = act.hwMarks !== undefined && act.hwMarks !== null;
              const hasCw = act.cwMarks !== undefined && act.cwMarks !== null;

              return (
                <div 
                  key={act.aid ? `${act.aid}-${index}` : `act-${index}`} 
                  className="bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/70 border border-sky-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all relative group animate-fadeIn space-y-4"
                >
                  {/* Top Bar Header: AID, Date, Status, Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-black text-indigo-950 bg-indigo-100/90 border border-indigo-300 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        {formatAid(act.aid)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80 font-mono flex items-center gap-1.5 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {act.date}
                      </span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border shadow-2xs flex items-center gap-1.5 ${
                        isAbsent 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-glow-emerald'
                      }`}>
                        {isAbsent ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {act.status}
                      </span>
                    </div>

                    {/* Action Buttons: Edit and Delete buttons */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto font-sans">
                      <button
                        onClick={() => startEditActivity(act)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl border border-indigo-200/90 transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                        title="Edit activity record"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-600" />
                        Edit
                      </button>
                      <button
                        onClick={() => setActivityToDelete(act)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl border border-rose-200/90 transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                        title="Delete activity record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Main Lesson Details & Scores Block */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Subject & Topic (col-span-7) */}
                    <div className="md:col-span-7 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-4 rounded-2xl border border-indigo-200/80 space-y-1.5">
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

                    {/* Right: Score Evaluation Box (col-span-5) */}
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
                          {/* HW Box */}
                          <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20 space-y-0.5">
                            <span className="text-[9px] font-black uppercase text-amber-200 font-mono flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-300" />
                              Homework
                            </span>
                            <p className="text-base font-black text-white font-mono">
                              {hasHw ? act.hwMarks!.toFixed(2) : 'N/A'}
                            </p>
                          </div>

                          {/* CW Box */}
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

                  {/* Remarks & Notes Footer */}
                  {act.comment && (
                    <div className="pt-2 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 leading-relaxed flex-grow flex items-center gap-2 shadow-2xs">
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
              <p className="text-sm font-black text-slate-800">No Lesson Entries Found</p>
              <p className="text-xs text-slate-500">Click "Log Daily Lesson Progress" to track daily academic logs.</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Detailed Warning Window for Activity Deletion */}
      {activityToDelete && mounted && createPortal(
        <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden my-auto max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col animate-scaleIn">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0 border border-rose-200 shadow-xs">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Delete Activity Log Entry?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    You are about to permanently remove this daily progress record. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Detailed warning metadata container */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs space-y-2.5 font-medium text-slate-700">
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Activity ID (AID)</span>
                  <span className="font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">{formatAid(activityToDelete.aid)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Student Name</span>
                  <span className="text-slate-900 font-bold">{student.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Lesson Date</span>
                  <span className="text-slate-900 font-bold">{activityToDelete.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                    activityToDelete.status === 'Absent' 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {activityToDelete.status}
                  </span>
                </div>
                {activityToDelete.status !== 'Absent' && (
                  <>
                    <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                      <span className="text-slate-500 font-bold">Subject / Topic</span>
                      <span className="text-slate-900 font-bold break-all max-w-[200px] text-right">{activityToDelete.subjectTuitioned || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                      <span className="text-slate-500 font-bold">HW Marks</span>
                      <span className="text-slate-900 font-black font-mono">{(activityToDelete.hwMarks ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                      <span className="text-slate-500 font-bold">CW Marks</span>
                      <span className="text-slate-900 font-black font-mono">{(activityToDelete.cwMarks ?? 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {activityToDelete.comment && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-slate-500 font-bold">Remarks / Comment</span>
                    <p className="text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed italic text-[11px]">
                      "{activityToDelete.comment}"
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActivityToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel, Keep Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteActivity(activityToDelete.aid);
                    setActivityToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer text-center shadow-md shadow-rose-200"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

