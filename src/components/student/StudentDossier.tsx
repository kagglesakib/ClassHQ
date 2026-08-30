'use client';

import React, { useState } from 'react';
import { Student, Exam } from '../../types';
import { 
  User, Mail, Building, GraduationCap, BookOpen, Layers, 
  Phone, Home, ShieldCheck, Download, Sparkles, FileText, ChevronRight, Award, PhoneCall, Lock
} from 'lucide-react';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { formatBatch } from '../../utils/formatBatch';

interface StudentDossierProps {
  student: Student;
  exams: Exam[];
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
}

export default function StudentDossier({
  student,
  exams,
  onEditProfileClick,
  onChangePasswordClick
}: StudentDossierProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Student's exam statistics
  const studentExams = exams.filter(e => e.studentSid === student.sid);
  const presentExams = studentExams.filter(e => e.status === 'Present');
  const totalObtained = presentExams.reduce((acc, curr) => acc + (curr.obtainedMarks || 0), 0);
  const totalPossible = presentExams.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const avgPercentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
  const attendancePct = studentExams.length > 0 ? Math.round((presentExams.length / studentExams.length) * 100) : 100;

  // Generate PDF report card for student
  const handleExportPDF = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    generatePdfReport(student, [], exams, currentMonth, setIsGeneratingPdf);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn" id="student-dossier-panel">
      {/* Primary Dossier Hero Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/80 animate-gradient-bg">
        {/* Background Decorative Ripples */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

        <div className="relative z-10 space-y-5">
          {/* Avatar & Key Metadata Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/30 border-2 border-white/20 shrink-0 animate-glow-indigo">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-md shadow-xs">
                  SID: {student.sid}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 backdrop-blur-md flex items-center gap-1 shadow-xs animate-glow-emerald">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Active Student
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-black text-white tracking-tight truncate">{student.name}</h2>
              <p className="text-xs text-indigo-200 font-medium flex items-center gap-2 truncate">
                <span className="flex items-center gap-1 truncate"><Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {student.college || 'College N/A'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (2x2 on Mobile, 4-col on Desktop) */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-indigo-900/40 backdrop-blur-md p-3 rounded-2xl border border-indigo-400/20">
              <span className="text-[9px] font-black text-indigo-200 uppercase tracking-wider block">Exams Taken</span>
              <span className="text-lg sm:text-xl font-black font-mono text-white mt-0.5 block">{presentExams.length}</span>
            </div>
            <div className="bg-emerald-950/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-400/30 animate-glow-emerald">
              <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider block">Avg Exam Score</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-300 mt-0.5 block">{avgPercentage}%</span>
            </div>
            <div className="bg-sky-950/40 backdrop-blur-md p-3 rounded-2xl border border-sky-400/20">
              <span className="text-[9px] font-black text-sky-200 uppercase tracking-wider block">Attendance</span>
              <span className="text-lg sm:text-xl font-black font-mono text-sky-300 mt-0.5 block">{attendancePct}%</span>
            </div>
            <div className="bg-purple-950/40 backdrop-blur-md p-3 rounded-2xl border border-purple-400/20">
              <span className="text-[9px] font-black text-purple-200 uppercase tracking-wider block">HSC Batch</span>
              <span className="text-xs font-extrabold text-white mt-1.5 block truncate">{formatBatch(student.hscBatch, 'No Batch')}</span>
            </div>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="w-full min-h-[46px] py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 animate-glow-emerald"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Academic Transcript'}</span>
            </button>

            <button
              onClick={onEditProfileClick}
              className="w-full min-h-[46px] py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md flex items-center justify-center gap-2 active:scale-98"
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Edit Profile Details</span>
            </button>

            <button
              onClick={onChangePasswordClick}
              className="w-full min-h-[46px] py-2.5 px-4 bg-rose-600/30 hover:bg-rose-600/50 text-white border border-rose-400/40 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md flex items-center justify-center gap-2 active:scale-98 shadow-sm"
            >
              <Lock className="w-4 h-4 text-rose-300" />
              <span>Update Security Passcode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Profile Metadata Fields */}
      <div className="bg-emerald-50/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Official Academic Profile
          </h3>
          <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2.5 py-1 rounded-xl shadow-2xs">
            {student.subject}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1 transition-all">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block flex items-center gap-1">
              <User className="w-3 h-3 text-indigo-600" /> Full Name
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{student.name}</p>
          </div>

          <div className="p-3.5 bg-sky-50/70 hover:bg-sky-50 border border-sky-100 rounded-2xl space-y-1 transition-all">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block flex items-center gap-1">
              <Building className="w-3 h-3 text-sky-600" /> College / Institution
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{student.college || 'Not specified'}</p>
          </div>

          <div className="p-3.5 bg-purple-50/70 hover:bg-purple-50 border border-purple-100 rounded-2xl space-y-1 transition-all">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-purple-600" /> HSC Batch
            </span>
            <p className="font-extrabold text-slate-900 text-sm font-mono">{formatBatch(student.hscBatch, 'Not specified')}</p>
          </div>

          <div className="p-3.5 bg-violet-50/70 hover:bg-violet-50 border border-violet-100 rounded-2xl space-y-1 transition-all">
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider block flex items-center gap-1">
              <Layers className="w-3 h-3 text-violet-600" /> Academic Group
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{student.group}</p>
          </div>

          {/* Interactive Mobile Contact Fields with Tap-To-Call */}
          {student.mobile ? (
            <a 
              href={`tel:${student.mobile}`}
              className="p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 rounded-2xl space-y-1 transition-all block group shadow-xs hover:shadow-indigo-100"
              title="Tap to call student mobile"
            >
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-indigo-600" /> Student Mobile</span>
                <PhoneCall className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              </span>
              <p className="font-mono font-black text-indigo-900 text-sm flex items-center gap-1">
                {student.mobile}
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-md font-sans">Call</span>
              </p>
            </a>
          ) : (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Phone className="w-3 h-3 text-indigo-600" /> Student Mobile
              </span>
              <p className="font-extrabold text-slate-900 text-sm font-mono">Not provided</p>
            </div>
          )}

          {student.guardiansPhone ? (
            <a 
              href={`tel:${student.guardiansPhone}`}
              className="p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200/80 rounded-2xl space-y-1 transition-all block group shadow-xs hover:shadow-rose-100"
              title="Tap to call guardian mobile"
            >
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-rose-600" /> Guardian's Phone</span>
                <PhoneCall className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              </span>
              <p className="font-mono font-black text-rose-950 text-sm flex items-center gap-1">
                {student.guardiansPhone}
                <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded-md font-sans">Call</span>
              </p>
            </a>
          ) : (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Phone className="w-3 h-3 text-rose-600" /> Guardian's Phone
              </span>
              <p className="font-extrabold text-slate-900 text-sm font-mono">Not provided</p>
            </div>
          )}

          {student.email ? (
            <a 
              href={`mailto:${student.email}`}
              className="p-3.5 bg-amber-50/70 hover:bg-amber-100/80 rounded-2xl border border-amber-200/80 space-y-1 transition-all block group shadow-2xs"
              title="Tap to email student"
            >
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-600" /> Email Address</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <p className="font-extrabold text-slate-900 text-sm truncate">{student.email}</p>
            </a>
          ) : (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Mail className="w-3 h-3 text-indigo-600" /> Email Address
              </span>
              <p className="font-extrabold text-slate-900 text-sm">Not provided</p>
            </div>
          )}

          <div className="p-3.5 bg-teal-50/70 hover:bg-teal-50 rounded-2xl border border-teal-100 space-y-1 sm:col-span-2 transition-all">
            <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider block flex items-center gap-1">
              <Home className="w-3 h-3 text-teal-600" /> Residential Address
            </span>
            <p className="font-extrabold text-slate-900 text-sm leading-relaxed">{student.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

