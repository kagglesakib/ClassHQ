import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student, Activity, Exam, Payment } from '../../types';
import { formatAid, formatEid, formatPid } from '../../utils/id';
import {
  X, Trash2, AlertTriangle, Loader2, CheckCircle2,
  XCircle, Calendar, User, BookOpen, Award, Banknote, Edit3
} from 'lucide-react';

/* ==========================================
   DELETE CONFIRMATION MODAL
   ========================================== */
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  itemIdLabel: string;
  details: { label: string; value: string }[];
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemIdLabel,
  details,
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 my-auto space-y-4 relative max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col overflow-y-auto animate-scaleUp">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2.5 font-medium text-slate-700">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reference ID</span>
            <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {itemIdLabel}
            </span>
          </div>
          {details.map((d, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-400">{d.label}</span>
              <span className="font-bold text-slate-800 text-right">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ==========================================
   EDIT ACTIVITY MODAL
   ========================================== */
interface EditActivityModalProps {
  isOpen: boolean;
  activity: Activity | null;
  students: Student[];
  onClose: () => void;
  onSave: (updatedActivity: Activity) => Promise<void> | void;
}

export function EditActivityModal({
  isOpen,
  activity,
  students,
  onClose,
  onSave,
}: EditActivityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Partial<Activity>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activity) {
      setFormData({ ...activity });
      setError(null);
    }
  }, [activity]);

  if (!isOpen || !activity || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentSid) {
      setError('Please select a student.');
      return;
    }

    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated: Activity = {
        aid: activity.aid,
        studentSid: formData.studentSid,
        date: formData.date,
        status: formData.status || 'Present',
        subjectTuitioned: formData.status === 'Absent' ? '' : (formData.subjectTuitioned || ''),
        hwMarks: formData.status === 'Absent' ? 0 : Number(formData.hwMarks || 0),
        cwMarks: formData.status === 'Absent' ? 0 : Number(formData.cwMarks || 0),
        comment: formData.comment || '',
        createdAt: activity.createdAt,
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAbsent = formData.status === 'Absent';

  return createPortal(
    <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-slate-100 my-auto space-y-3.5 relative max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col overflow-y-auto animate-scaleUp">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Edit Daily Activity Log</h3>
            <p className="text-xs text-slate-500 font-medium">
              Reference: <span className="font-mono font-bold text-indigo-700">{formatAid(activity.aid)}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Student</label>
              <select
                value={formData.studentSid || ''}
                onChange={(e) => setFormData({ ...formData, studentSid: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              >
                {students.map((s, idx) => (
                  <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>
                    {s.name} ({s.sid})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Attendance Status Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Attendance Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Present' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  !isAbsent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Present
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Absent' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isAbsent
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" /> Absent
              </button>
            </div>
          </div>

          {!isAbsent && (
            <>
              {/* Subject / Lesson Topic */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Topic / Lesson Covered</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Math - Integration Chapter 10"
                  value={formData.subjectTuitioned || ''}
                  onChange={(e) => setFormData({ ...formData, subjectTuitioned: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                />
              </div>

              {/* Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">HW Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={formData.hwMarks ?? ''}
                    onChange={(e) => setFormData({ ...formData, hwMarks: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">CW Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={formData.cwMarks ?? ''}
                    onChange={(e) => setFormData({ ...formData, cwMarks: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Teacher Comments / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Excellent progress in formulas..."
              value={formData.comment || ''}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ==========================================
   EDIT EXAM MODAL
   ========================================== */
interface EditExamModalProps {
  isOpen: boolean;
  exam: Exam | null;
  students: Student[];
  onClose: () => void;
  onSave: (updatedExam: Exam) => Promise<void> | void;
}

export function EditExamModal({
  isOpen,
  exam,
  students,
  onClose,
  onSave,
}: EditExamModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Partial<Exam>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (exam) {
      setFormData({ ...exam });
      setError(null);
    }
  }, [exam]);

  if (!isOpen || !exam || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentSid) {
      setError('Please select a student.');
      return;
    }

    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    if (!formData.subjectAndTopic) {
      setError('Please specify the topic / subject.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated: Exam = {
        eid: exam.eid,
        studentSid: formData.studentSid,
        date: formData.date,
        subjectAndTopic: formData.subjectAndTopic,
        status: formData.status || 'Present',
        totalMarks: Number(formData.totalMarks || 100),
        obtainedMarks: formData.status === 'Absent' ? 0 : Number(formData.obtainedMarks || 0),
        remarks: formData.remarks || '',
        comment: formData.comment || '',
        createdAt: exam.createdAt,
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update exam record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAbsent = formData.status === 'Absent';

  return createPortal(
    <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-slate-100 my-auto space-y-3.5 relative max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col overflow-y-auto animate-scaleUp">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Edit Exam Record</h3>
            <p className="text-xs text-slate-500 font-medium">
              Reference: <span className="font-mono font-bold text-indigo-700">{formatEid(exam.eid)}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Student</label>
              <select
                value={formData.studentSid || ''}
                onChange={(e) => setFormData({ ...formData, studentSid: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              >
                {students.map((s, idx) => (
                  <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>
                    {s.name} ({s.sid})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Exam Topic / Subject */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Subject / Topic</label>
            <input
              type="text"
              placeholder="e.g. Physics - Dynamics & Kinematics Test"
              value={formData.subjectAndTopic || ''}
              onChange={(e) => setFormData({ ...formData, subjectAndTopic: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          {/* Attendance Status Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Exam Attendance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Present' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  !isAbsent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attended / Present
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Absent' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isAbsent
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" /> Absent
              </button>
            </div>
          </div>

          {!isAbsent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Total Marks</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalMarks ?? 100}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Obtained Marks</label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalMarks || 100}
                  value={formData.obtainedMarks ?? ''}
                  onChange={(e) => setFormData({ ...formData, obtainedMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Remarks & Comments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Grade / Rating</label>
              <input
                type="text"
                placeholder="e.g. Excellent, Grade A+"
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Teacher Remarks</label>
              <input
                type="text"
                placeholder="e.g. Strong conceptual grasp"
                value={formData.comment || ''}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ==========================================
   EDIT PAYMENT MODAL
   ========================================== */
interface EditPaymentModalProps {
  isOpen: boolean;
  payment: Payment | null;
  students: Student[];
  onClose: () => void;
  onSave: (updatedPayment: Payment) => Promise<void> | void;
}

export function EditPaymentModal({
  isOpen,
  payment,
  students,
  onClose,
  onSave,
}: EditPaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData({ ...payment });
      setError(null);
    }
  }, [payment]);

  if (!isOpen || !payment || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentSid) {
      setError('Please select a student.');
      return;
    }

    if (!formData.date) {
      setError('Please select a payment date.');
      return;
    }

    if (!formData.paymentMonth) {
      setError('Please select the payment month.');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated: Payment = {
        pid: payment.pid,
        studentSid: formData.studentSid,
        date: formData.date,
        paymentMonth: formData.paymentMonth,
        amount: Number(formData.amount),
        comment: formData.comment || '',
        createdAt: payment.createdAt,
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update payment transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-slate-100 my-auto space-y-3.5 relative max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col overflow-y-auto animate-scaleUp">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Edit Payment Transaction</h3>
            <p className="text-xs text-slate-500 font-medium">
              Reference: <span className="font-mono font-bold text-emerald-700">{formatPid(payment.pid)}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Student</label>
              <select
                value={formData.studentSid || ''}
                onChange={(e) => setFormData({ ...formData, studentSid: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              >
                {students.map((s, idx) => (
                  <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>
                    {s.name} ({s.sid})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Payment Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Month */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tuition Month (YYYY-MM)</label>
              <input
                type="month"
                value={formData.paymentMonth || ''}
                onChange={(e) => setFormData({ ...formData, paymentMonth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            {/* Amount Paid */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Amount Paid (BDT ৳)</label>
              <input
                type="number"
                min="1"
                placeholder="2000"
                value={formData.amount ?? ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Payment Notes / Method</label>
            <input
              type="text"
              placeholder="e.g. Paid via bKash / Cash payment"
              value={formData.comment || ''}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
