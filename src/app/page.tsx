'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Activity, Exam, Payment } from '@/types';
import StatsDashboard from '@/components/StatsDashboard';
import { 
  UserPlus, AlertTriangle, RefreshCcw, 
  BarChart2, RefreshCw, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    try {
      const [stuData, actData, exmData, payData] = await Promise.all([
        safeFetch('/api/students'),
        safeFetch('/api/activities'),
        safeFetch('/api/exams'),
        safeFetch('/api/payments'),
      ]);

      setStudents(stuData);
      setActivities(actData);
      setExams(exmData);
      setPayments(payData);
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to database server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
        <p className="text-xs text-slate-500 font-medium font-sans">Loading ledger analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-100 py-3 px-4 rounded-xl text-xs font-medium text-rose-700 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="underline hover:text-rose-900 font-bold ml-1 flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Retry Load
          </button>
        </div>
      )}

      {/* Executive Command Center Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-emerald-800/80 shadow-xl group"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 border border-emerald-600/60 rounded-full text-[11px] font-black uppercase font-mono text-emerald-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
                Admin System Online
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline-block">•</span>
              <span className="text-xs font-mono font-bold text-emerald-200/90">
                TutorHQ Command Center
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
              Management Dashboard Overview
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse hidden sm:inline-block" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Real-time monitoring hub for student rosters, academic performance, tuition ledgers, exam metrics, and registration approvals.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => router.push('/students?add=true')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 border border-emerald-400/40 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-100" />
              <span>Add New Student</span>
            </button>

            <button
              onClick={fetchData}
              title="Refresh All Analytics Data"
              className="p-2.5 bg-slate-800/90 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all border border-slate-700/80 cursor-pointer shadow-2xs flex items-center justify-center min-w-[42px] min-h-[42px]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* General Stats Dashboard */}
      <StatsDashboard
        students={students}
        activities={activities}
        exams={exams}
        payments={payments}
        onSelectStudent={(sid) => {
          router.push(`/students?sid=${sid}`);
        }}
      />
    </div>
  );
}
