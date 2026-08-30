import React from 'react';
import { Student, Activity } from '../../types';
import { Users, CheckSquare, Award, ArrowUpRight, Activity as ActivityIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface PremiumMetricsProps {
  students: Student[];
  activities: Activity[];
  attendanceRate: number;
  presentCount: number;
  totalActivitiesCount: number;
  averageHwMarks: number;
  averageCwMarks: number;
  uniqueBatches: string[];
}

export default function PremiumMetrics({
  students,
  activities,
  attendanceRate,
  presentCount,
  totalActivitiesCount,
  averageHwMarks,
  averageCwMarks,
  uniqueBatches,
}: PremiumMetricsProps) {
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Metric 1: Total Active Roster */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white p-5 sm:p-6 rounded-3xl border border-indigo-100/90 shadow-sm hover:shadow-xl hover:border-indigo-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900/60 font-mono">
            Active Roster
          </span>
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              {students.length}
            </h3>
            <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Students
            </span>
          </div>
          <p className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 -ml-3.5" />
            Enrolled & Verified
          </p>
        </div>
      </motion.div>

      {/* Metric 2: Attendance Rate (Gauge) */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100/90 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/10 via-teal-400/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 font-mono">
            Attendance Rate
          </span>
          {/* Circular Progress Radial Gauge */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="19" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle 
                cx="24" 
                cy="24" 
                r="19" 
                stroke="#10b981" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 19}`}
                strokeDashoffset={`${2 * Math.PI * 19 * (1 - attendanceRate / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-sm"
              />
            </svg>
            <div className="absolute text-[9px] font-black font-mono text-emerald-700">{attendanceRate}%</div>
          </div>
        </div>
        <div className="relative z-10 space-y-1">
          <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            {attendanceRate}%
          </h3>
          <p className="text-xs font-bold text-emerald-700 pt-0.5 flex items-center gap-1">
            <span className="font-extrabold text-emerald-600">✓ {presentCount}</span>
            <span className="text-slate-400 font-normal">/ {totalActivitiesCount} sessions</span>
          </p>
        </div>
      </motion.div>

      {/* Metric 3: Academic Performance (HW vs CW) */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white p-5 sm:p-6 rounded-3xl border border-amber-100/90 shadow-sm hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-amber-500/10 via-orange-400/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between relative z-10 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 font-mono">
            Average Performance
          </span>
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                  {averageHwMarks.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">/10</span>
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 w-fit mt-0.5">
                Homework
              </span>
            </div>

            <div className="flex flex-col border-l border-slate-100 pl-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                  {averageCwMarks.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">/10</span>
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/80 w-fit mt-0.5">
                Classwork
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-amber-100/80">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(100, Math.max(0, averageHwMarks * 10))}%` }} 
            />
          </div>

          <p className="text-[11px] sm:text-xs font-bold text-amber-700/90 truncate">
            HW & Classwork Aggregate Score
          </p>
        </div>
      </motion.div>

      {/* Metric 4: HSC Batches Segment Tag */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white p-5 sm:p-6 rounded-3xl border border-teal-100/90 shadow-sm hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-teal-500/10 via-emerald-400/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 font-mono">
            Active Batches
          </span>
          <div className="p-2.5 bg-gradient-to-tr from-teal-600 to-emerald-600 text-white rounded-2xl shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              {uniqueBatches.length}
            </h3>
            <span className="text-xs font-bold text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              HSC Years
            </span>
          </div>
          <p className="text-xs font-extrabold text-teal-700 pt-0.5 truncate max-w-[160px]">
            {uniqueBatches.join(' • ') || 'None'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
