import React from 'react';
import { Student } from '../../types';
import { GraduationCap, Users, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface BatchSegmentsProps {
  students: Student[];
  uniqueBatches: string[];
  uniqueSubjects: string[];
}

export default function BatchSegments({
  students,
  uniqueBatches,
  uniqueSubjects,
}: BatchSegmentsProps) {

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const subjectPillColors = [
    'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    'bg-teal-50 text-teal-700 border-teal-200/80',
    'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    'bg-purple-50 text-purple-700 border-purple-200/80',
    'bg-amber-50 text-amber-700 border-amber-200/80',
    'bg-sky-50 text-sky-700 border-sky-200/80',
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100/90 shadow-sm flex flex-col justify-between space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <GraduationCap className="w-4 h-4" />
          </span>
          <h4 className="font-display font-black text-slate-900 text-base sm:text-lg">
            Batch Enrollment Segments
          </h4>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Distribution of student roster by HSC examination year</p>
      </div>

      <div className="space-y-4 flex-grow my-2 justify-center flex flex-col">
        {uniqueBatches.length > 0 ? (
          uniqueBatches.map((batch, index) => {
            const count = students.filter(s => s.hscBatch === batch).length;
            const percent = students.length > 0 ? Math.round((count / students.length) * 100) : 0;

            const gradientClasses = [
              'bg-gradient-to-r from-indigo-500 to-purple-600',
              'bg-gradient-to-r from-teal-500 to-emerald-600',
              'bg-gradient-to-r from-emerald-500 to-teal-600',
              'bg-gradient-to-r from-amber-500 to-orange-600',
              'bg-gradient-to-r from-rose-500 to-pink-600',
            ];
            const activeGradient = gradientClasses[index % gradientClasses.length];

            return (
              <div key={batch ? `${batch}-${index}` : `batch-${index}`} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-black text-slate-800 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${activeGradient}`} />
                    HSC {batch} Batch
                  </span>
                  <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                    {count} {count === 1 ? 'student' : 'students'} ({percent}%)
                  </span>
                </div>
                
                {/* Glowing progress slider track */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${activeGradient} shadow-xs`}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 space-y-1">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No batch segments found</p>
          </div>
        )}
      </div>

      {/* Subjects Tag Block */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
            Monitored Subjects & Syllabus
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {uniqueSubjects.length > 0 ? (
            uniqueSubjects.map((sub, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border shadow-2xs ${
                  subjectPillColors[idx % subjectPillColors.length]
                }`}
              >
                {sub}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">No subjects recorded yet</span>
          )}
        </div>
      </div>

    </motion.div>
  );
}
