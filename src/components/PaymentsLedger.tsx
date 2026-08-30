import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student, Payment } from '../types';
import { generatePaymentId, formatPid } from '../utils/id';
import { 
  X, Plus, Banknote, Edit, Trash2, Calendar, Coins,
  ShieldCheck, Clock, Sparkles, TrendingUp, Receipt, ArrowUpRight
} from 'lucide-react';

interface PaymentsLedgerProps {
  student: Student;
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (pid: string) => void;
  onUpdatePayment: (payment: Payment) => void;
}

export default function PaymentsLedger({
  student,
  payments,
  onAddPayment,
  onDeletePayment,
  onUpdatePayment,
}: PaymentsLedgerProps) {
  const [mounted, setMounted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [paymentAmount, setPaymentAmount] = useState('2000');
  const [paymentMonthVal, setPaymentMonthVal] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [paymentComment, setPaymentComment] = useState('');
  const [paymentFormError, setPaymentFormError] = useState('');
  const [editingPaymentPid, setEditingPaymentPid] = useState<string | undefined>(undefined);
  const [tempPid, setTempPid] = useState(() => generatePaymentId());

  const resetPaymentForm = () => {
    setPaymentAmount('2000');
    setPaymentComment('');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    setPaymentDate(today.toISOString().split('T')[0]);
    setPaymentMonthVal(`${year}-${month}`);
    setEditingPaymentPid(undefined);
    setPaymentFormError('');
    setShowPaymentForm(false);
  };

  const togglePaymentForm = () => {
    if (showPaymentForm) {
      resetPaymentForm();
    } else {
      setTempPid(generatePaymentId());
      setEditingPaymentPid(undefined);
      setShowPaymentForm(true);
    }
  };

  // Reset states when student.sid changes
  useEffect(() => {
    resetPaymentForm();
  }, [student.sid]);

  // Lock body scroll and close on ESC when modal is active
  useEffect(() => {
    if (showPaymentForm) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') resetPaymentForm();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showPaymentForm]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      setPaymentFormError('Amount must be a positive number in Taka.');
      return;
    }
    if (!paymentMonthVal) {
      setPaymentFormError('Payment month is required.');
      return;
    }

    const finalPayment: Payment = {
      pid: tempPid,
      studentSid: student.sid,
      date: paymentDate,
      amount: Math.round(Number(paymentAmount)),
      paymentMonth: paymentMonthVal,
      comment: paymentComment.trim() || undefined,
    };

    if (editingPaymentPid) {
      onUpdatePayment(finalPayment);
    } else {
      onAddPayment(finalPayment);
    }

    resetPaymentForm();
  };

  const startEditPayment = (pay: Payment) => {
    setEditingPaymentPid(pay.pid);
    setTempPid(pay.pid);
    setPaymentDate(pay.date);
    setPaymentAmount(String(pay.amount));
    setPaymentMonthVal(pay.paymentMonth);
    setPaymentComment(pay.comment || '');
    setShowPaymentForm(true);
    setPaymentFormError('');
  };

  // Filter and sort payments
  const studentPayments = payments
    .filter(p => p.studentSid === student.sid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPaid = studentPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper to format months nicely, e.g., "2026-07" -> "July 2026"
  const formatMonthName = (monthStr: string) => {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-6 animate-fadeIn" id="payments-ledger-panel">
      {/* Payments Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl shadow-md shadow-emerald-500/20 animate-glow-emerald shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              Tuition Payments & Ledger
              <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-emerald-100 text-emerald-950 rounded-full border border-emerald-300">
                BDT ৳
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Log and verify tuition fee payments in BDT</p>
          </div>
        </div>

        <button
          onClick={togglePaymentForm}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer shadow-md shadow-emerald-500/20 border border-emerald-400/50 animate-glow-emerald active:scale-98"
        >
          {showPaymentForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showPaymentForm ? (editingPaymentPid ? 'Cancel Edit' : 'Close Form') : 'Log Payment'}</span>
        </button>
      </div>

      {/* Pop Up Window Modal for Adding / Editing Payment Log */}
      {showPaymentForm && mounted && createPortal(
        <div 
          className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetPaymentForm();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden my-auto flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-emerald-200 shadow-inner animate-glow-emerald">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                    {editingPaymentPid ? 'Edit Payment Record' : 'Record Monthly Tuition Fee'}
                  </h4>
                  <p className="text-[11px] text-emerald-200 font-medium flex items-center gap-2 mt-0.5">
                    <span>Student: <strong className="text-white font-black">{student.name}</strong></span>
                    <span className="opacity-50">•</span>
                    <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-md text-emerald-100 font-extrabold border border-white/20">SID: {student.sid}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetPaymentForm}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/20"
                title="Close window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handlePaymentSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {paymentFormError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-2xl font-bold border border-rose-200 flex items-center gap-2 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                  {paymentFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Payment ID (PID) - NOT EDITABLE */}
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Payment ID (PID)</span>
                    <span className="text-[9px] text-slate-400 font-semibold">(Auto Generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formatPid(tempPid)}
                    disabled
                    className="w-full min-h-[42px] px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-950 cursor-not-allowed focus:outline-hidden"
                  />
                </div>

                {/* Student ID (SID) - NOT EDITABLE */}
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Student ID (SID)</span>
                    <span className="text-[9px] text-slate-400 font-semibold">(Locked)</span>
                  </label>
                  <input
                    type="text"
                    value={student.sid}
                    disabled
                    className="w-full min-h-[42px] px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed focus:outline-hidden"
                  />
                </div>

                {/* Payment Date Picker */}
                <div className="space-y-1 bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200/80">
                  <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:outline-hidden"
                  />
                </div>

                {/* Amount Input (৳) */}
                <div className="space-y-1 bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200/90">
                  <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider">Amount Paid (BDT ৳)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-black text-emerald-700 font-mono">৳</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full min-h-[42px] pl-8 pr-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-emerald-300 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Payment of Month Picker */}
                <div className="space-y-1 bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200/80">
                  <label className="text-[10px] font-black text-purple-950 uppercase tracking-wider">For Tuition Month</label>
                  <input
                    type="month"
                    value={paymentMonthVal}
                    onChange={(e) => setPaymentMonthVal(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-300 focus:outline-hidden"
                  />
                </div>

                {/* Comments / Description */}
                <div className="space-y-1 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                  <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider">Remarks / Payment Method</label>
                  <input
                    type="text"
                    value={paymentComment}
                    onChange={(e) => setPaymentComment(e.target.value)}
                    placeholder="e.g. Bkash / Cash / Hand-to-hand"
                    className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetPaymentForm}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-800 hover:from-emerald-700 hover:to-indigo-900 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5 animate-glow-emerald"
                >
                  <Banknote className="w-4 h-4" />
                  <span>{editingPaymentPid ? 'Update Payment' : 'Record Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Payment History List */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-3.5 rounded-2xl border border-emerald-200/80">
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Recorded Payment Ledger
          </h4>
          <div className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black font-mono shadow-xs border border-emerald-400/50 animate-glow-emerald">
            Total Paid: ৳ {totalPaid.toLocaleString()} BDT
          </div>
        </div>

        {studentPayments.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {studentPayments.map((pay, index) => (
              <div 
                key={pay.pid ? `${pay.pid}-${index}` : `pay-${index}`} 
                className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/90 hover:border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 space-y-3 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-2xl shrink-0 shadow-md shadow-emerald-500/20 animate-glow-emerald border border-emerald-300/40">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-xl border border-emerald-300 shadow-2xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          {formatPid(pay.pid)}
                        </span>
                        <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          Paid: {pay.date}
                        </span>
                      </div>
                      <p className="text-xs font-black text-purple-950 bg-purple-100/80 border border-purple-200 px-2.5 py-0.5 rounded-xl inline-block font-mono shadow-2xs">
                        Billing Period: {formatMonthName(pay.paymentMonth)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-3 sm:p-3.5 rounded-2xl border border-emerald-400/50 text-white text-left sm:text-right shadow-md shadow-emerald-500/20 animate-glow-emerald shrink-0">
                    <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest block font-mono">Amount Paid</span>
                    <p className="font-mono font-black text-white text-lg sm:text-xl">
                      ৳ {pay.amount.toLocaleString()} <span className="text-xs text-emerald-100 font-sans">BDT</span>
                    </p>
                  </div>
                </div>

                {pay.comment && (
                  <p className="text-xs text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/50 p-3 rounded-2xl border border-amber-200/90 flex items-center gap-2 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>"{pay.comment}"</span>
                  </p>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
                  <button
                    type="button"
                    onClick={() => startEditPayment(pay)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black rounded-xl border border-indigo-200 transition-all cursor-pointer text-xs flex items-center gap-1 shadow-2xs"
                    title="Edit payment"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-700" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentToDelete(pay)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 font-black rounded-xl border border-rose-200 transition-all cursor-pointer text-xs flex items-center gap-1 shadow-2xs"
                    title="Delete payment"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-700" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 border border-dashed border-emerald-200 rounded-3xl bg-emerald-50/30 space-y-2">
            <div className="p-3 bg-emerald-100 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 animate-glow-emerald">
              <Banknote className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No payment history logged</p>
            <p className="text-xs max-w-xs mx-auto text-slate-500">No transactions recorded yet. Click "Log Payment" above to record tuition fees.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Payment Deletion */}
      {paymentToDelete && mounted && createPortal(
        <div className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden my-auto max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] flex flex-col animate-scaleIn">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0 border border-rose-200 shadow-xs">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Delete Payment Record?</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    You are about to permanently remove this payment ledger transaction. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs space-y-2 font-medium text-slate-700">
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Payment ID (PID)</span>
                  <span className="font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">{formatPid(paymentToDelete.pid)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Student Name</span>
                  <span className="text-slate-900 font-bold">{student.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-200/50 pb-2">
                  <span className="text-slate-500 font-bold">Payment Date</span>
                  <span className="text-slate-900 font-bold">{paymentToDelete.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Amount Paid</span>
                  <span className="text-emerald-700 font-black font-mono">৳ {paymentToDelete.amount.toLocaleString()} BDT</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer text-center"
                >
                  Cancel, Keep Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeletePayment(paymentToDelete.pid);
                    setPaymentToDelete(null);
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
