import React, { useState } from 'react';
import { Student, Activity, Exam, Payment } from '../types';
import {
  Edit, Trash2, BookOpen, ClipboardList, Banknote, ArrowLeft
} from 'lucide-react';
import StudentDossier from './StudentDossier';
import LessonsTracker from './LessonsTracker';
import ExamsLedger from './ExamsLedger';
import PaymentsLedger from './PaymentsLedger';
import DeleteStudentModal from './DeleteStudentModal';
import { generatePdfReport } from '../utils/pdfGenerator';
import { formatBatch } from '../utils/formatBatch';

interface StudentDetailProps {
  student: Student;
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (sid: string) => void;
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (aid: string) => void;
  onUpdateActivity: (activity: Activity) => void;
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (eid: string) => void;
  onUpdateExam: (exam: Exam) => void;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (pid: string) => void;
  onUpdatePayment: (payment: Payment) => void;
  onBackToList?: () => void; // for mobile views
}

export default function StudentDetail({
  student,
  activities,
  exams,
  payments,
  onEditStudent,
  onDeleteStudent,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
  onAddExam,
  onDeleteExam,
  onUpdateExam,
  onAddPayment,
  onDeletePayment,
  onUpdatePayment,
  onBackToList,
}: StudentDetailProps) {
  // Tab control inside detail view: "lessons", "exams", or "payments"
  const [detailTab, setDetailTab] = useState<'lessons' | 'exams' | 'payments'>('lessons');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // PDF Report Generation States
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter student's own exams/activities/payments count for summary
  const studentExams = exams.filter(e => e.studentSid === student.sid);
  const studentActivitiesCount = activities.filter(a => a.studentSid === student.sid).length;
  const studentPaymentsCount = payments.filter(p => p.studentSid === student.sid).length;

  const handleGeneratePdf = () => {
    generatePdfReport(student, activities, exams, reportMonth, setIsGeneratingPdf);
  };

  return (
    <div className="space-y-5" id={`student-detail-${student.sid}`}>
      {/* Upper header section */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl lg:hidden transition-all shrink-0 font-extrabold text-xs flex items-center gap-1 border border-slate-200/80"
              title="Back to Student Directory"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Roster</span>
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-indigo-800 bg-indigo-100/90 border border-indigo-200/90 px-2.5 py-1 rounded-xl uppercase tracking-wider font-mono shadow-2xs">
                ID : {student.sid}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight truncate">{student.name}</h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-[11px]">{student.college || 'No college specified'}</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold">{formatBatch(student.hscBatch, 'No batch specified')}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => onEditStudent(student)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Edit Student Details"
          >
            <Edit className="w-3.5 h-3.5 text-indigo-600" />
            Edit Profile
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Delete
          </button>
        </div>
      </div>

      {/* Grid: Details Metadata Panel (Left) & Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Profile Card & Parameters (col-span-4) */}
        <StudentDossier
          student={student}
          studentExams={studentExams}
          reportMonth={reportMonth}
          setReportMonth={setReportMonth}
          isGeneratingPdf={isGeneratingPdf}
          onGeneratePdf={handleGeneratePdf}
          onEditProfile={() => onEditStudent(student)}
        />

        {/* Dynamic Detail Workspace (col-span-8) */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          {/* Sub-navigation tab selectors with Element-Wise Vibrant Background Colors */}
          <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 gap-1.5 shadow-inner">
            <button
              onClick={() => setDetailTab('lessons')}
              className={`py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-black ${detailTab === 'lessons'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                : 'bg-indigo-50/70 text-indigo-900 hover:bg-indigo-100/80'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Lessons</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${detailTab === 'lessons' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-200/60 text-indigo-950'}`}>
                {activities.filter(a => a.studentSid === student.sid).length}
              </span>
            </button>
            <button
              onClick={() => setDetailTab('exams')}
              className={`py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-black ${detailTab === 'exams'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-200'
                : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100/80'
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Exams</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${detailTab === 'exams' ? 'bg-amber-800 text-amber-100' : 'bg-amber-200/60 text-amber-950'}`}>
                {exams.filter(e => e.studentSid === student.sid).length}
              </span>
            </button>
            <button
              onClick={() => setDetailTab('payments')}
              className={`py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-black ${detailTab === 'payments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200'
                : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/80'
                }`}
            >
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Payments</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${detailTab === 'payments' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-200/60 text-emerald-950'}`}>
                {payments.filter(p => p.studentSid === student.sid).length}
              </span>
            </button>
          </div>

          {detailTab === 'lessons' && (
            <LessonsTracker
              student={student}
              activities={activities}
              onAddActivity={onAddActivity}
              onDeleteActivity={onDeleteActivity}
              onUpdateActivity={onUpdateActivity}
            />
          )}

          {detailTab === 'exams' && (
            <ExamsLedger
              student={student}
              exams={exams}
              onAddExam={onAddExam}
              onDeleteExam={onDeleteExam}
              onUpdateExam={onUpdateExam}
            />
          )}

          {detailTab === 'payments' && (
            <PaymentsLedger
              student={student}
              payments={payments}
              onAddPayment={onAddPayment}
              onDeletePayment={onDeletePayment}
              onUpdatePayment={onUpdatePayment}
            />
          )}
        </div>
      </div>

      {/* Delete Student Detailed Confirmation Window */}
      <DeleteStudentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(sid) => onDeleteStudent(sid)}
        student={student}
        activitiesCount={studentActivitiesCount}
        examsCount={studentExams.length}
        paymentsCount={studentPaymentsCount}
      />
    </div>
  );
}
