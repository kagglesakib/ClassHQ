import React from 'react';
import { Student, Exam } from '../types';
import {
  Phone, Calendar, Layers, Hash, BookOpen, MapPin, Trophy, FileText, Download, Mail, Edit3, Key
} from 'lucide-react';
import { formatBatch } from '../utils/formatBatch';

interface StudentDossierProps {
  student: Student;
  studentExams: Exam[];
  reportMonth: string;
  setReportMonth: (month: string) => void;
  isGeneratingPdf: boolean;
  onGeneratePdf: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

export default function StudentDossier({
  student,
  studentExams,
  reportMonth,
  setReportMonth,
  isGeneratingPdf,
  onGeneratePdf,
  onEditProfile,
  onChangePassword,
}: StudentDossierProps) {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* Student Profile Metadata Card */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4" id="profile-meta-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-black text-slate-900 text-sm tracking-tight">Student Dossier</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg font-mono">
              ID : {student.sid}
            </span>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Edit College, Email, Mobile Phone & Address"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            )}
            {onChangePassword && (
              <button
                onClick={onChangePassword}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Change Account Password"
              >
                <Key className="w-3 h-3" />
                Password
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-700 font-medium">
          {/* Email Address */}
          <div className="p-3 bg-violet-50/90 rounded-2xl border border-violet-200/80 flex items-center gap-3">
            <div className="p-2 bg-violet-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-violet-800/80 block font-black text-[10px] uppercase tracking-wider">Email Address</span>
              <span className="font-extrabold text-violet-950 text-xs truncate block" title={student.email || 'No email on record'}>
                {student.email || 'Not specified'}
              </span>
            </div>
          </div>

          {/* College */}
          <div className="p-3 bg-sky-50/90 rounded-2xl border border-sky-200/80 flex items-center gap-3">
            <div className="p-2 bg-sky-500 text-white rounded-xl shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sky-800/80 block font-black text-[10px] uppercase tracking-wider">College / Institution</span>
              <span className="font-extrabold text-sky-950 text-xs truncate block">{student.college || 'N/A'}</span>
            </div>
          </div>

          {/* HSC Batch */}
          <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-emerald-800/80 block font-black text-[10px] uppercase tracking-wider">HSC Batch</span>
              <span className="font-extrabold text-emerald-950 text-xs truncate block">{formatBatch(student.hscBatch)}</span>
            </div>
          </div>

          {/* Group */}
          <div className="p-3 bg-purple-50/90 rounded-2xl border border-purple-200/80 flex items-center gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Hash className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-purple-800/80 block font-black text-[10px] uppercase tracking-wider">Academic Group</span>
              <span className="font-extrabold text-purple-950 text-xs truncate block">{student.group || 'N/A'}</span>
            </div>
          </div>

          {/* Subject */}
          <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex items-center gap-3">
            <div className="p-2 bg-amber-600 text-white rounded-xl shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-amber-800/80 block font-black text-[10px] uppercase tracking-wider">Tuitioned Subject</span>
              <span className="font-extrabold text-amber-950 text-xs truncate block">{student.subject || 'N/A'}</span>
            </div>
          </div>

          {/* Mobile */}
          <div className="p-3 bg-teal-50/90 rounded-2xl border border-teal-200/80 flex items-center gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-teal-800/80 block font-black text-[10px] uppercase tracking-wider">Mobile Number</span>
              <span className="font-black text-teal-950 text-xs font-mono truncate block">{student.mobile || 'N/A'}</span>
            </div>
          </div>

          {/* Guardians Phone */}
          {student.guardiansPhone && (
            <div className="p-3 bg-rose-50/90 rounded-2xl border border-rose-200/80 flex items-center gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 shadow-2xs">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-rose-800/80 block font-black text-[10px] uppercase tracking-wider">Guardian's Contact</span>
                <span className="font-black text-rose-950 text-xs font-mono truncate block">{student.guardiansPhone}</span>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="p-3 bg-indigo-50/90 rounded-2xl border border-indigo-200/80 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-indigo-800/80 block font-black text-[10px] uppercase tracking-wider">Residence Address</span>
              <span className="font-semibold text-indigo-950 text-xs leading-relaxed break-words">{student.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Exam Stats */}
      {studentExams.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 animate-fadeIn" id="smart-exam-stats">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-display font-black text-slate-900 text-sm">Exam Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/60">
              <span className="text-[10px] text-amber-800 block font-bold uppercase tracking-wider">Average Score</span>
              <span className="text-lg font-display font-black text-amber-900">
                {(() => {
                  const presentExams = studentExams.filter(e => e.status === 'Present');
                  if (presentExams.length === 0) return 'N/A';
                  const avgPct = presentExams.reduce((acc, curr) => {
                    const pct = curr.totalMarks > 0 ? (curr.obtainedMarks || 0) / curr.totalMarks : 0;
                    return acc + pct;
                  }, 0) / presentExams.length;
                  return `${Math.round(avgPct * 100)}%`;
                })()}
              </span>
            </div>

            <div className="p-3 bg-gradient-to-br from-indigo-50 to-violet-50/50 rounded-2xl border border-indigo-200/60">
              <span className="text-[10px] text-indigo-800 block font-bold uppercase tracking-wider font-sans">Attendance</span>
              <span className="text-lg font-display font-black text-indigo-900">
                {(() => {
                  const total = studentExams.length;
                  const present = studentExams.filter(e => e.status === 'Present').length;
                  return total > 0 ? `${Math.round((present / total) * 100)}%` : '0%';
                })()}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Total Exams Logged:</span>
              <span className="text-slate-900 font-black font-mono">{studentExams.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Highest Score:</span>
              <span className="text-emerald-700 font-black font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {(() => {
                  const presentExams = studentExams.filter(e => e.status === 'Present' && e.obtainedMarks !== undefined && e.obtainedMarks !== null);
                  if (presentExams.length === 0) return 'N/A';
                  const maxPct = Math.max(...presentExams.map(e => e.totalMarks > 0 ? (e.obtainedMarks || 0) / e.totalMarks : 0));
                  return `${Math.round(maxPct * 100)}%`;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Academic Report Card (PDF) */}
      <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 animate-fadeIn" id="pdf-report-card">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="font-display font-black text-slate-900 text-sm">Academic Report (PDF)</h3>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Generate a graphical PDF performance report card for this student for a specific month.
        </p>
        <div className="space-y-3 pt-1">
          <div>
            <label htmlFor="report-month" className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Select Month
            </label>
            <input
              id="report-month"
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50/80 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-3 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-200"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}
          </button>
        </div>
      </div>
    </div>
  );
}
