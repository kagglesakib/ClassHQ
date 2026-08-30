import React from 'react';
import { Banknote, TrendingUp, ClipboardList, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface FinancialCockpitProps {
  totalCollected: number;
  paymentsCount: number;
  examsCount: number;
}

export default function FinancialCockpit({
  totalCollected,
  paymentsCount,
  examsCount,
}: FinancialCockpitProps) {
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const avgReceipt = paymentsCount > 0 ? Math.round(totalCollected / paymentsCount) : 0;

  return (
    <motion.div 
      variants={itemVariants}
      className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5"
    >
      {/* Primary Revenue Command Cockpit (Spans 7 cols on LG) */}
      <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-emerald-800/80 shadow-xl relative overflow-hidden group flex flex-col justify-between space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Banknote className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                Financial Ledger Cockpit
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-2">
              Tuition Fee Revenue Overview
            </h3>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/90 border border-emerald-600/60 rounded-full text-xs font-black text-emerald-200 font-mono self-start sm:self-auto shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{paymentsCount} Receipts Verified</span>
          </div>
        </div>

        {/* Big Numbers Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 pt-1">
          <div className="bg-emerald-900/40 border border-emerald-700/60 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase block">Total Logged Revenue</span>
            <div className="text-3xl sm:text-4xl font-display font-black text-emerald-400 tracking-tight">
              ৳{totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium pt-1">
              Verified tuition payments in BDT
            </p>
          </div>

          <div className="bg-teal-900/40 border border-teal-700/60 p-4 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-mono font-bold text-teal-300 uppercase block">Average Per Receipt</span>
            <div className="text-3xl sm:text-4xl font-display font-black text-teal-300 tracking-tight">
              ৳{avgReceipt.toLocaleString()}
            </div>
            <p className="text-[11px] text-teal-200/80 font-medium pt-1">
              Mean collection per transaction
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Column (Spans 5 cols on LG) */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
        {/* Verified Receipts Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest font-mono block">Tuition Transactions</span>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600">{paymentsCount} Receipts</span>
                <span className="text-xs text-slate-500 block font-mono font-bold">Successfully Recorded</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-700/80 pt-3 border-t border-emerald-50 flex items-center gap-1.5 mt-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            All payment receipts verified in database
          </p>
        </div>

        {/* Exams Conducted Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block">Examinations Monitored</span>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-display font-black text-slate-900">{examsCount}</span>
                <span className="text-xs text-slate-500 block font-medium">Recorded Exam Sessions</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500 pt-3 border-t border-slate-50 flex items-center justify-between mt-3">
            <span>Classroom Assessments Logged</span>
            <span className="text-indigo-600 font-mono font-black">{examsCount} Active</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
