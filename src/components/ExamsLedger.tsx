import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student, Exam } from '../types';
import { generateExamId, formatEid } from '../utils/id';
import { 
  Plus, X, ClipboardList, Sparkles, Calendar, Clock, Edit, Trash2, Search,
  ShieldCheck, CheckCircle2, XCircle, Award, Trophy, Percent, Filter, ArrowUpDown
} from 'lucide-react';

interface ExamsLedgerProps {
  student: Student;
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (eid: string) => void;
  onUpdateExam: (exam: Exam) => void;
}

export default function ExamsLedger({
  student,
  exams,
  onAddExam,
  onDeleteExam,
  onUpdateExam,
}: ExamsLedgerProps) {
  const [mounted, setMounted] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examSortBy, setExamSortBy] = useState<'date' | 'subject' | 'total' | 'obtained' | 'status'>('date');
  const [examSortOrder, setExamSortOrder] = useState<'asc' | 'desc'>('desc');
  const [examFilterDate, setExamFilterDate] = useState('');
  const [examFilterMonth, setExamFilterMonth] = useState('');

  // New/Editing Exam form states
  const [examDate, setExamDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [examSubjectAndTopic, setExamSubjectAndTopic] = useState('');
  const [examStatus, setExamStatus] = useState<string>('Present');
  const [examTotalMarks, setExamTotalMarks] = useState('10');
  const [examObtainedMarks, setExamObtainedMarks] = useState('');
  const [examRemarks, setExamRemarks] = useState('');
  const [examComment, setExamComment] = useState('');
  const [examFormError, setExamFormError] = useState('');
  const [editingExamEid, setEditingExamEid] = useState<string | undefined>(undefined);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [tempEid, setTempEid] = useState(() => generateExamId());

  const resetExamForm = () => {
    setExamSubjectAndTopic('');
    setExamComment('');
    setExamTotalMarks('10');
    setExamObtainedMarks('');
    setExamStatus('Present');
    setExamRemarks('');
    setEditingExamEid(undefined);
    setExamFormError('');
    setShowExamForm(false);
  };

  const toggleExamForm = () => {
    if (showExamForm) {
      resetExamForm();
    } else {
      setTempEid(generateExamId());
      setShowExamForm(true);
    }
  };

  // Reset states when student.sid changes
  useEffect(() => {
    resetExamForm();
    setExamToDelete(null);
    setExamSearchTerm('');
    setExamFilterDate('');
    setExamFilterMonth('');
  }, [student.sid]);

  // Lock body scroll and close on ESC when modal is active
  useEffect(() => {
    if (showExamForm) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') resetExamForm();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showExamForm]);

  // Filter and sort exams
  const studentExams = exams
    .filter(e => e.studentSid === student.sid)
    .filter(e => {
      // 1. Text Search Filter
      let matchesText = true;
      if (examSearchTerm) {
        const term = examSearchTerm.toLowerCase();
        const sub = (e.subjectAndTopic || '').toLowerCase();
        const com = (e.comment || '').toLowerCase();
        const rem = (e.remarks || '').toLowerCase();
        const statusStr = e.status.toLowerCase();
        const dateStr = e.date.toLowerCase();

        // Month matches
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
                      rem.includes(term) ||
                      statusStr.includes(term) || 
                      dateStr.includes(term) ||
                      matchesMonthText;
      }

      // 2. Specific Date Filter
      let matchesDate = true;
      if (examFilterDate) {
        matchesDate = e.date === examFilterDate;
      }

      // 3. Month & Year Filter
      let matchesMonth = true;
      if (examFilterMonth) {
        matchesMonth = e.date.startsWith(examFilterMonth);
      }

      return matchesText && matchesDate && matchesMonth;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (examSortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (examSortBy === 'subject') {
        comparison = (a.subjectAndTopic || '').localeCompare(b.subjectAndTopic || '');
      } else if (examSortBy === 'total') {
        comparison = a.totalMarks - b.totalMarks;
      } else if (examSortBy === 'obtained') {
        const aObt = a.status === 'Absent' ? 0 : (a.obtainedMarks || 0);
        const bObt = b.status === 'Absent' ? 0 : (b.obtainedMarks || 0);
        comparison = aObt - bObt;
      } else if (examSortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      if (comparison === 0) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return examSortOrder === 'asc' ? comparison : -comparison;
    });

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (examStatus === 'Present' && !examSubjectAndTopic.trim()) {
      setExamFormError('Exam Subject and Topic is required when Present.');
      return;
    }

    if (examTotalMarks === '' || isNaN(Number(examTotalMarks)) || Number(examTotalMarks) < 0) {
      setExamFormError('Total marks must be a positive number.');
      return;
    }

    if (examStatus === 'Present' && (examObtainedMarks === '' || isNaN(Number(examObtainedMarks)) || Number(examObtainedMarks) < 0)) {
      setExamFormError('Obtained marks must be a valid number when Present.');
      return;
    }

    if (examStatus === 'Present' && Number(examObtainedMarks) > Number(examTotalMarks)) {
      setExamFormError('Obtained marks cannot exceed Total marks.');
      return;
    }

    const isAbsent = examStatus === 'Absent';
    const finalExam: Exam = {
      eid: tempEid,
      studentSid: student.sid,
      date: examDate,
      subjectAndTopic: isAbsent ? 'N/A' : examSubjectAndTopic.trim(),
      status: examStatus,
      totalMarks: Number(examTotalMarks),
      obtainedMarks: isAbsent ? 0 : (examObtainedMarks !== '' ? Number(examObtainedMarks) : undefined),
      remarks: examRemarks || undefined,
      comment: examComment.trim() || undefined,
    };

    if (editingExamEid) {
      onUpdateExam(finalExam);
    } else {
      onAddExam(finalExam);
    }

    resetExamForm();
  };

  const startEditExam = (exam: Exam) => {
    setEditingExamEid(exam.eid);
    setTempEid(exam.eid);
    setExamDate(exam.date);
    setExamStatus(exam.status);
    setExamSubjectAndTopic(exam.status === 'Absent' ? '' : exam.subjectAndTopic);
    setExamTotalMarks(String(exam.totalMarks));
    setExamObtainedMarks(exam.status === 'Absent' ? '0' : (exam.obtainedMarks !== undefined && exam.obtainedMarks !== null ? String(exam.obtainedMarks) : ''));
    setExamRemarks(exam.remarks || '');
    setExamComment(exam.comment || '');
    setShowExamForm(true);
    setExamFormError('');
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 shadow-xs space-y-6 animate-fadeIn" id="exam-ledger-panel">
      {/* Exams Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white rounded-2xl shadow-md shadow-purple-500/20 animate-glow-purple">
            <ClipboardList className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              Smart Exam Ledger
              <Sparkles className="w-4 h-4 text-purple-600" />
            </h3>
            <p className="text-xs text-slate-500">Log topic-wise exams, status, marks, remarks, and tutor comments</p>
          </div>
        </div>

        <button
          onClick={toggleExamForm}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-2xl text-xs font-black flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer shadow-md shadow-purple-500/20 animate-glow-purple"
        >
          {showExamForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-amber-300" />}
          {showExamForm ? (editingExamEid ? 'Cancel Editing' : 'Close Exam Logger') : 'Log New Exam'}
        </button>
      </div>

      {/* Pop Up Window Modal for Adding / Editing Exam Log */}
      {showExamForm && mounted && createPortal(
        <div 
          className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetExamForm();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md animate-glow-purple">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 backdrop-blur-md rounded-2xl border border-purple-400/30 text-amber-300 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                    {editingExamEid ? 'Edit Exam Record' : 'Log New Topic Exam Record'}
                  </h4>
                  <p className="text-[11px] text-purple-200 font-medium flex items-center gap-2 mt-0.5">
                    <span>Student: <strong className="text-white font-bold">{student.name}</strong></span>
                    <span className="opacity-50">•</span>
                    <span className="font-mono text-[10px] bg-white/15 px-2 py-0.5 rounded-lg text-purple-100 font-bold">SID: {student.sid}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetExamForm}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10"
                title="Close window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleExamSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {examFormError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-2xl font-bold border border-rose-200 flex items-center gap-2 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  {examFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Exam ID (EID) - NOT EDITABLE */}
                <div className="space-y-1 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80">
                  <label className="text-[10px] font-black text-purple-900 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>Exam ID (EID)</span>
                    <span className="text-[9px] text-purple-600 font-normal">(Auto)</span>
                  </label>
                  <input
                    type="text"
                    value={formatEid(tempEid)}
                    disabled
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-950 cursor-not-allowed focus:outline-hidden"
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

                {/* Exam Date Picker */}
                <div className="space-y-1 bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200/80">
                  <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Attendance Status Selector */}
                <div className="space-y-1 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider font-mono">Attendance Status</label>
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setExamStatus('Present');
                        if (examObtainedMarks === '0') setExamObtainedMarks('');
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        examStatus === 'Present'
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs animate-glow-emerald'
                          : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExamStatus('Absent');
                        setExamObtainedMarks('0');
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        examStatus === 'Absent'
                          ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                          : 'bg-white border-rose-200 text-rose-900 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Absent
                    </button>
                  </div>
                </div>

                {/* Exam Subject And Topic */}
                <div className="space-y-1 sm:col-span-2 bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200/80">
                  <label className="text-[10px] font-black text-purple-950 uppercase tracking-wider font-mono">Exam Subject & Topic</label>
                  <input
                    type="text"
                    value={examStatus === 'Absent' ? 'N/A' : examSubjectAndTopic}
                    onChange={(e) => setExamSubjectAndTopic(e.target.value)}
                    disabled={examStatus === 'Absent'}
                    placeholder="e.g. Physics - Projectile Motion & Vector Algebra"
                    className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-100 disabled:text-slate-400 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-300 focus:outline-hidden"
                  />
                </div>

                {/* Total Marks & Obtained Marks Row */}
                <div className="grid grid-cols-2 gap-3 sm:col-span-2 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider font-mono">Total Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={examTotalMarks}
                      onChange={(e) => setExamTotalMarks(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center justify-between font-mono">
                      <span>Obtained Marks</span>
                      {examStatus === 'Present' && examObtainedMarks && !isNaN(Number(examObtainedMarks)) && Number(examTotalMarks) > 0 && (
                        <span className="text-[10px] font-mono text-amber-950 bg-amber-200/90 px-2 py-0.2 rounded-md font-extrabold border border-amber-300">
                          {Math.round((Number(examObtainedMarks) / Number(examTotalMarks)) * 100)}%
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={examStatus === 'Absent' ? '0' : examObtainedMarks}
                      onChange={(e) => setExamObtainedMarks(e.target.value)}
                      disabled={examStatus === 'Absent'}
                      placeholder="e.g. 8"
                      className="w-full px-3 py-2 bg-white disabled:bg-slate-100 disabled:text-slate-400 border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1 bg-violet-50/80 p-3.5 rounded-2xl border border-violet-200/80">
                  <label className="text-[10px] font-black text-violet-950 uppercase tracking-wider font-mono">Remarks / Rank Tag</label>
                  <input
                    type="text"
                    value={examRemarks}
                    onChange={(e) => setExamRemarks(e.target.value)}
                    placeholder="e.g. Grade A+, 1st in batch"
                    className="w-full px-3.5 py-2.5 bg-white border border-violet-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-violet-300 focus:outline-hidden"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1 bg-teal-50/80 p-3.5 rounded-2xl border border-teal-200/80">
                  <label className="text-[10px] font-black text-teal-950 uppercase tracking-wider font-mono">Feedback Comment</label>
                  <input
                    type="text"
                    value={examComment}
                    onChange={(e) => setExamComment(e.target.value)}
                    placeholder="e.g. Good derivation, work on speed"
                    className="w-full px-3.5 py-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetExamForm}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-extrabold rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-2 animate-glow-purple text-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {editingExamEid ? 'Save Changes' : 'Log Exam Record'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Exam Filter and sorting control bar */}
      <div className="space-y-6" id="exam-timeline">
        {/* Element-Wise Exam Filter and sorting control bar */}
        <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50 p-4 rounded-3xl border border-purple-200/80 shadow-md space-y-3 animate-fadeIn">
          {/* Search & Date Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Element-wise Text search */}
            <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={examSearchTerm}
                onChange={(e) => setExamSearchTerm(e.target.value)}
                placeholder="Search subject, topic, remarks..."
                className="w-full py-1 pr-8 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-indigo-900/40 focus:outline-hidden"
              />
              {examSearchTerm && (
                <button
                  onClick={() => setExamSearchTerm('')}
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
                value={examFilterDate}
                onChange={(e) => {
                  setExamFilterDate(e.target.value);
                  setExamFilterMonth(''); // Clear month filter if specific date is selected
                }}
                className="min-w-0 w-full bg-transparent text-xs text-sky-950 focus:outline-hidden font-black cursor-pointer py-0"
                title="Filter by Specific Exam Date"
              />
              {examFilterDate && (
                <button
                  onClick={() => setExamFilterDate('')}
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
                value={examFilterMonth}
                onChange={(e) => {
                  setExamFilterMonth(e.target.value);
                  setExamFilterDate(''); // Clear specific date filter if month is selected
                }}
                className="min-w-0 w-full bg-transparent text-xs text-purple-950 focus:outline-hidden font-black cursor-pointer py-0"
                title="Filter by Exam Month & Year"
              />
              {examFilterMonth && (
                <button
                  onClick={() => setExamFilterMonth('')}
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
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-purple-200/60">
            <div className="flex items-center gap-2 text-xs">
              {(examFilterDate || examFilterMonth || examSearchTerm) && (
                <button
                  onClick={() => {
                    setExamSearchTerm('');
                    setExamFilterDate('');
                    setExamFilterMonth('');
                  }}
                  className="text-[10px] font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
                  type="button"
                >
                  Reset Filters
                </button>
              )}
              <span className="text-[10px] font-black text-purple-950 uppercase tracking-wider font-mono">
                Showing {studentExams.length} exam records
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Sort:</span>
              <select
                value={examSortBy}
                onChange={(e) => setExamSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-950 focus:outline-hidden transition-all cursor-pointer shadow-2xs"
              >
                <option value="date">Date</option>
                <option value="subject">Subject / Topic</option>
                <option value="total">Total Marks</option>
                <option value="obtained">Obtained Marks</option>
                <option value="status">Status (Present/Absent)</option>
              </select>

              <button
                type="button"
                onClick={() => setExamSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 rounded-xl text-xs font-black text-purple-950 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title={examSortOrder === 'asc' ? 'Sorting Ascending' : 'Sorting Descending'}
              >
                {examSortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Smart Stacked Exam Cards View */}
        {studentExams.length > 0 ? (
          <div className="space-y-4 flex flex-col">
            {studentExams.map((exam, index) => {
              const isAbsent = exam.status === 'Absent';
              const scorePercentage = exam.status === 'Present' && exam.totalMarks > 0 
                ? Math.round(((exam.obtainedMarks || 0) / exam.totalMarks) * 100)
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
                  key={exam.eid ? `${exam.eid}-${index}` : `exam-${index}`} 
                  className="bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/70 border border-purple-200/90 rounded-3xl p-5 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all relative group animate-fadeIn space-y-4"
                >
                  {/* Top Bar Header: EID, Date, Status, Grade, and Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-purple-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-black text-purple-950 bg-purple-100/90 border border-purple-300 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        {formatEid(exam.eid)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80 font-mono flex items-center gap-1.5 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        {exam.date}
                      </span>
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
                        {exam.status}
                      </span>
                    </div>

                    {/* Action Buttons: Nicely placed Edit and Delete buttons */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto font-sans">
                      <button
                        onClick={() => startEditExam(exam)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl border border-indigo-200/90 transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                        title="Edit exam record"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-600" />
                        Edit
                      </button>
                      <button
                        onClick={() => setExamToDelete(exam)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl border border-rose-200/90 transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                        title="Delete exam record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Main Exam Details & Scores Block */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Subject & Topic (col-span-7) */}
                    <div className="md:col-span-7 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-4 rounded-2xl border border-indigo-200/80 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block font-mono">Topic Examined</span>
                      </div>
                      <h4 className="font-display font-black text-slate-900 text-base leading-snug break-words pl-0.5">
                        {isAbsent ? (
                          <span className="text-slate-400 italic font-medium">No Exam (Absent)</span>
                        ) : (
                          exam.subjectAndTopic
                        )}
                      </h4>
                    </div>

                    {/* Right: Score Box & Progress Bar (col-span-5) */}
                    {!isAbsent && (
                      <div className="md:col-span-5 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 p-4 rounded-2xl border border-purple-300/40 text-white shadow-md shadow-purple-500/20 animate-glow-purple space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black text-purple-200 uppercase tracking-wider block font-mono">Obtained Score</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-2xl font-black text-white font-mono tracking-tight">
                                {exam.obtainedMarks ?? 0}
                              </span>
                              <span className="text-xs font-bold text-purple-200 font-mono">
                                / {exam.totalMarks} Total
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
                  {(exam.remarks || exam.comment) && (
                    <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      {exam.remarks && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-950 rounded-xl text-xs font-black border border-purple-300 font-mono shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-purple-700 mr-1.5 shrink-0" />
                            Tag: {exam.remarks}
                          </span>
                        </div>
                      )}
                      {exam.comment && (
                        <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 leading-relaxed flex-grow flex items-center gap-2 shadow-2xs">
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
              <ClipboardList className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800">No Exam Entries Found</p>
              <p className="text-xs text-slate-500">Click "Log New Exam" to track exam performance levels.</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {examToDelete && mounted && createPortal(
        <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden my-auto max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col animate-scaleIn">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0 border border-rose-200 shadow-xs">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Delete Exam Record?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    You are about to permanently remove this academic exam score. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs space-y-2.5 font-medium text-slate-700">
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Exam ID (EID)</span>
                  <span className="font-mono font-black text-purple-900 bg-white px-2 py-0.5 rounded-lg border border-purple-200">{formatEid(examToDelete.eid)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Date</span>
                  <span className="text-slate-900 font-bold">{examToDelete.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Topic</span>
                  <span className="text-slate-900 font-bold break-all max-w-[200px] text-right">{examToDelete.subjectAndTopic}</span>
                </div>
                {examToDelete.status === 'Present' && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Score</span>
                    <span className="text-slate-900 font-black font-mono">{examToDelete.obtainedMarks} / {examToDelete.totalMarks} ({Math.round(((examToDelete.obtainedMarks || 0) / examToDelete.totalMarks) * 100)}%)</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setExamToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel, Keep Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteExam(examToDelete.eid);
                    setExamToDelete(null);
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
