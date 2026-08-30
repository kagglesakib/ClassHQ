import React, { useState } from 'react';
import { Student } from '../types';
import { Search, Plus, BookOpen, GraduationCap, UserPlus, Phone, Sparkles, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { formatBatch } from '../utils/formatBatch';
import { useAuth } from '../context/AuthContext';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (sid: string) => void;
  onAddStudentClick: () => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudentClick,
}: StudentListProps) {
  const { user } = useAuth();
  const isStudentUser = user?.userType === 'student';
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.sid.toLowerCase().includes(term) ||
      (student.college && student.college.toLowerCase().includes(term)) ||
      (student.subject && student.subject.toLowerCase().includes(term)) ||
      (student.hscBatch && student.hscBatch.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-full flex flex-col overflow-hidden" id="student-list-container">

      {/* Search & Actions Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5 shrink-0 bg-gradient-to-b from-slate-50/90 via-indigo-50/20 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-display font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
              Student Directory
            </h3>
            <p className="text-[11px] text-slate-500 font-medium font-sans">Select profile to manage records</p>
          </div>
          <span className="text-[11px] bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black px-3 py-1 rounded-full font-mono shadow-xs">
            {filteredStudents.length} / {students.length}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Element-wise Search Bar */}
          <div className="relative flex-grow bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-purple-50/90 p-1 rounded-2xl border border-indigo-200/80 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex items-center">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SID, college, batch..."
              className="w-full py-1.5 pr-8 bg-transparent text-xs font-extrabold text-slate-800 placeholder-indigo-900/40 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Student Quick Button */}
          {!isStudentUser && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={onAddStudentClick}
              className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 shrink-0 font-extrabold text-xs"
              title="Register new student"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Student</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Student Cards List */}
      <div className="flex-grow overflow-y-auto p-3 sm:p-3.5 space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => {
            const isSelected = student.sid === selectedStudentId;
            const uniqueKey = student.sid ? `${student.sid}-${index}` : `student-${index}`;
            return (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                whileHover={{ y: -1 }}
                onClick={() => onSelectStudent(student.sid)}
                className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer text-left transition-all relative border ${isSelected
                    ? 'bg-gradient-to-r from-indigo-50 via-violet-50/70 to-purple-50/40 border-indigo-400/90 shadow-md shadow-indigo-100/80'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/90 hover:border-indigo-200 shadow-2xs'
                  }`}
              >
                {/* Active Indicator bar */}
                {isSelected && (
                  <motion.div
                    layoutId="activeStudentIndicator"
                    className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full shadow-xs"
                  />
                )}

                <div className="space-y-2.5 pl-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-black text-indigo-800 bg-indigo-100/90 border border-indigo-200/90 px-2.5 py-0.5 rounded-lg uppercase tracking-wider font-mono shadow-2xs inline-block">
                        ID : {student.sid}
                      </span>
                      <h4 className="font-sans font-extrabold text-slate-900 text-sm leading-tight truncate">
                        {student.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-lg shrink-0 uppercase tracking-wider font-mono shadow-2xs">
                      {formatBatch(student.hscBatch, 'HSC')}
                    </span>
                  </div>

                  {/* College and Subject - Element-wise Colored Background Pills */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {student.college && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-900 rounded-xl border border-sky-200/80 font-semibold text-[11px] max-w-full">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{student.college}</span>
                      </div>
                    )}
                    {student.subject && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-200/80 font-semibold text-[11px] max-w-full">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{student.subject}</span>
                      </div>
                    )}
                  </div>

                  {/* Group, Email & Mobile Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-600 border-t border-slate-100/90 gap-1.5">
                    <span className="font-semibold bg-purple-50 text-purple-900 px-2.5 py-0.5 rounded-lg border border-purple-200/70 text-[10px]">
                      Group: <span className="font-black text-purple-950">{student.group || 'N/A'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {student.email && (
                        <span className="flex items-center gap-1 text-violet-900 font-bold bg-violet-50 border border-violet-200/70 px-2 py-0.5 rounded-lg text-[10px] shrink-0 truncate max-w-[140px]" title={student.email}>
                          <Mail className="w-3 h-3 text-violet-600 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </span>
                      )}
                      {student.mobile && (
                        <span className="flex items-center gap-1 text-emerald-900 font-extrabold font-mono bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-lg text-[10px] shrink-0">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {student.mobile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-16 px-4 text-center text-slate-400 space-y-3">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto text-indigo-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold text-slate-700">No student matched</p>
              <p className="text-[11px] text-slate-400">Adjust search filter or spelling</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
