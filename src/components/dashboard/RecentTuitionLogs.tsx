import React, { useState } from 'react';
import { Student, Activity } from '../../types';
import { Clock, ChevronRight, ArrowUpRight, Sparkles, User, Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface RecentTuitionLogsProps {
  students: Student[];
  recentActivities: Activity[];
  onSelectStudent: (sid: string) => void;
}

export default function RecentTuitionLogs({
  students,
  recentActivities,
  onSelectStudent,
}: RecentTuitionLogsProps) {
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  const formatMark = (value?: number | null) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return value.toFixed(1);
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const filteredActivities = recentActivities.filter(act => {
    if (filter === 'present') return act.status === 'Present';
    if (filter === 'absent') return act.status === 'Absent';
    return true;
  });

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100/90 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Clock className="w-4 h-4" />
            </span>
            <h4 className="font-display font-black text-slate-900 text-base sm:text-lg">
              Recent Tuition Session Logs
            </h4>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time log feed of student attendance, homework checks, and session notes</p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl font-black transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({recentActivities.length})
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-3 py-1 rounded-xl font-black transition-all cursor-pointer ${
              filter === 'present' 
                ? 'bg-emerald-500 text-white shadow-2xs' 
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-3 py-1 rounded-xl font-black transition-all cursor-pointer ${
              filter === 'absent' 
                ? 'bg-rose-500 text-white shadow-2xs' 
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Absent
          </button>
        </div>
      </div>

      {/* Grid List Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act, index) => {
            const student = students.find(s => s.sid === act.studentSid);
            const isAbsent = act.status === 'Absent';
            
            return (
              <motion.button
                key={act.aid ? `${act.aid}-${index}` : `act-${index}`}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => student && onSelectStudent(student.sid)}
                className="text-left p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-white hover:bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 rounded-2xl flex items-start gap-4 group cursor-pointer relative overflow-hidden"
              >
                {/* Student Avatar Icon Chip */}
                <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-black text-sm shadow-2xs border transition-transform duration-300 group-hover:scale-105 ${
                  isAbsent 
                    ? 'bg-rose-50 text-rose-600 border-rose-200/80' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
                }`}>
                  {student?.name ? (
                    <span className="text-sm font-black font-mono uppercase">{student.name.charAt(0)}</span>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                <div className="overflow-hidden flex-grow space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                      {student?.name || 'Unknown Student'}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                      {act.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-900 font-bold font-mono">
                      {act.subjectTuitioned || 'General Session'}
                    </span>
                    {student?.hscBatch && (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        HSC '{student.hscBatch}
                      </span>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-lg border shadow-2xs ${
                      isAbsent 
                        ? 'bg-rose-100/90 text-rose-800 border-rose-200' 
                        : 'bg-emerald-100/90 text-emerald-800 border-emerald-200'
                    }`}>
                      {act.status}
                    </span>
                    
                    {!isAbsent && act.hwMarks !== null && act.hwMarks !== undefined && (
                      <span className="text-[10px] font-bold text-slate-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg font-mono">
                        HW: <span className="font-black text-amber-900">{formatMark(act.hwMarks)}%</span>
                      </span>
                    )}
                    
                    {!isAbsent && act.cwMarks !== null && act.cwMarks !== undefined && (
                      <span className="text-[10px] font-bold text-slate-600 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-lg font-mono">
                        CW: <span className="font-black text-teal-900">{formatMark(act.cwMarks)}</span>
                      </span>
                    )}
                  </div>

                  {act.comment && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic font-sans bg-slate-100/60 p-2 rounded-xl border border-slate-200/50">
                      "{act.comment}"
                    </p>
                  )}
                </div>
                
                <div className="self-center p-1.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white rounded-xl transition-all shadow-2xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })
        ) : (
          <div className="col-span-2 py-12 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Sparkles className="w-7 h-7 text-indigo-400 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-slate-600">No session logs match the selected filter</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
