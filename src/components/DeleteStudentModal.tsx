'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student } from '../types';
import {
  AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2,
  BookOpen, FileText, Banknote, UserCheck, RefreshCw, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (sid: string) => Promise<void> | void;
  student: Student;
  activitiesCount?: number;
  examsCount?: number;
  paymentsCount?: number;
}

export default function DeleteStudentModal({
  isOpen,
  onClose,
  onConfirmDelete,
  student,
  activitiesCount = 0,
  examsCount = 0,
  paymentsCount = 0,
}: DeleteStudentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const requiredCode = student.sid ? student.sid.toUpperCase() : 'DELETE';
  const isInputMatching = confirmInput.trim().toUpperCase() === requiredCode || confirmInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isInputMatching) {
      setErrorMsg(`Please type '${requiredCode}' or 'DELETE' to confirm.`);
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(student.sid);
      setIsDeleting(false);
      setConfirmInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete student profile.');
      setIsDeleting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col my-auto max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h3 className="font-display font-black text-lg tracking-tight">Confirm Student Deletion</h3>
                <p className="text-xs text-rose-100 font-medium">Permanent database removal notice</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Student Info Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md uppercase">
                    SID: {student.sid}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">{student.name}</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  {student.hscBatch ? `HSC ${student.hscBatch}` : 'Student'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-200/80">
                <div>🎓 <span className="font-semibold text-slate-800">{student.college || 'N/A'}</span></div>
                <div>📱 <span className="font-semibold text-slate-800">{student.mobile || 'N/A'}</span></div>
                {student.email && (
                  <div className="col-span-2 truncate">✉️ <span className="font-mono text-slate-700 font-semibold">{student.email}</span></div>
                )}
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                The following records will be permanently erased:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                <div className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Student Profile & Ledger</span>
                </div>
                <div className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Login Credentials (userlogdatas)</span>
                </div>
                <div className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{activitiesCount} Lesson & Activity Logs</span>
                </div>
                <div className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{examsCount} Exam Marks & Grades</span>
                </div>
                <div className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-900 flex items-center gap-2 col-span-1 sm:col-span-2">
                  <Banknote className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{paymentsCount} Payment Transactions & Receipts</span>
                </div>
              </div>
            </div>

            {/* Confirmation Input Prompt */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Type <code className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-black">{requiredCode}</code> or <code className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-black">DELETE</code> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Type ${requiredCode}`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase"
                disabled={isDeleting}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-100 text-rose-900 text-xs font-bold rounded-xl border border-rose-200">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl text-xs font-black transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isInputMatching || isDeleting}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-200"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Student Permanently</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
