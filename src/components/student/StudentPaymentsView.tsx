'use client';

import React from 'react';
import { Student, Payment } from '../../types';
import { formatPid } from '../../utils/id';
import { 
  Banknote, Calendar, CheckCircle2, TrendingUp, Receipt, 
  Sparkles, Clock, Coins, ShieldCheck, ArrowUpRight 
} from 'lucide-react';

interface StudentPaymentsViewProps {
  student: Student;
  payments: Payment[];
}

export default function StudentPaymentsView({
  student,
  payments,
}: StudentPaymentsViewProps) {
  // Student's payments sorted by date desc
  const studentPayments = payments
    .filter(p => p.studentSid === student.sid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPaid = studentPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const latestPayment = studentPayments[0];

  const formatMonthName = (monthStr: string) => {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-emerald-50/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-5 animate-fadeIn" id="student-payments-panel">
      {/* Aesthetic Glowing Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl shadow-md shadow-emerald-500/20 animate-glow-emerald">
              <Banknote className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Tuition Payment Ledger
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-emerald-100 text-emerald-950 rounded-full border border-emerald-300 shadow-2xs">
                  BDT ৳
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Official verified tuition transaction records</p>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl text-xs font-black font-mono shadow-md shadow-emerald-500/25 border border-emerald-400/50 flex items-center gap-2 animate-glow-emerald">
            <Coins className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Total Paid: ৳ {totalPaid.toLocaleString()} BDT</span>
          </div>

          <div className="px-3 py-2 bg-teal-50/90 border border-teal-200 text-teal-950 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
            <Receipt className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{studentPayments.length} Payment{studentPayments.length !== 1 ? 's' : ''}</span>
          </div>

          {latestPayment && (
            <div className="px-3 py-2 bg-purple-50/90 border border-purple-200 text-purple-950 rounded-2xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Latest: {latestPayment.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Transactions List */}
      {studentPayments.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {studentPayments.map((pay, index) => (
            <div 
              key={pay.pid ? `${pay.pid}-${index}` : `pay-${index}`}
              className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/70 border border-emerald-200/90 hover:border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-lg hover:shadow-emerald-500/10 space-y-3 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: Icon & Transaction Metadata */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-2xl shrink-0 shadow-md shadow-emerald-500/25 border border-emerald-300/40 animate-glow-emerald">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-black text-emerald-950 bg-emerald-100/90 px-2.5 py-0.5 rounded-xl border border-emerald-300/80 shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                        {formatPid(pay.pid)}
                      </span>
                      <span className="text-xs font-bold text-slate-700 font-mono flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Paid: {pay.date}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-lg border border-emerald-200/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Verified Ledger
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-black text-purple-950 bg-purple-100/80 border border-purple-200/90 px-2.5 py-0.5 rounded-xl flex items-center gap-1 shadow-2xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        Billing Period: {formatMonthName(pay.paymentMonth)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount Box */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-3.5 sm:p-4 rounded-2xl border border-emerald-400/50 text-white text-left sm:text-right shadow-md shadow-emerald-500/20 animate-glow-emerald shrink-0 flex items-center justify-between sm:justify-end gap-3">
                  <div>
                    <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest block font-mono">Amount Paid</span>
                    <p className="font-mono font-black text-white text-lg sm:text-xl flex items-center gap-1">
                      ৳ {pay.amount.toLocaleString()} <span className="text-xs font-bold text-emerald-100 font-sans">BDT</span>
                    </p>
                  </div>
                  <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 sm:hidden">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Remarks / Comment Note */}
              {pay.comment && (
                <div className="p-3 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/50 rounded-2xl border border-amber-200/90 text-xs text-amber-950 font-semibold italic flex items-start gap-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>"{pay.comment}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Aesthetic Empty State */
        <div className="py-14 px-4 text-center rounded-3xl bg-gradient-to-b from-emerald-50/40 to-slate-50 border border-dashed border-emerald-200 space-y-3">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl w-14 h-14 mx-auto flex items-center justify-center shadow-inner border border-emerald-200 animate-glow-emerald">
            <Banknote className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800">No Payment Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No recorded tuition payments found for student ID <strong className="font-mono text-emerald-700">{student.sid}</strong>. Once tuition is collected, it will appear in this ledger.
            </p>
          </div>
        </div>
      )}

      {/* Ledger Verification Footer */}
      <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-950">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          Official TutorHQ Ledger — Bank standard payment tracking
        </span>
        <span className="font-mono text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-lg border border-emerald-300 text-emerald-950 shrink-0">
          SECURE
        </span>
      </div>
    </div>
  );
}
