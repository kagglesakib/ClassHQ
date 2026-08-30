import React from 'react';
import { useRouter } from 'next/navigation';
import { Student, Activity, Exam, Payment } from '../types';
import { motion } from 'motion/react';
import { 
  Users, UserCheck, CalendarCheck, FileSpreadsheet, 
  CreditCard, HardDriveDownload, Sparkles, ArrowRight 
} from 'lucide-react';
import PremiumMetrics from './dashboard/PremiumMetrics';
import FinancialCockpit from './dashboard/FinancialCockpit';
import ProgressChart from './dashboard/ProgressChart';
import BatchSegments from './dashboard/BatchSegments';
import RecentTuitionLogs from './dashboard/RecentTuitionLogs';

interface StatsDashboardProps {
  students: Student[];
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onSelectStudent: (sid: string) => void;
}

export default function StatsDashboard({ 
  students, 
  activities, 
  exams, 
  payments, 
  onSelectStudent 
}: StatsDashboardProps) {
  const router = useRouter();
  
  // Total activities
  const totalActivitiesCount = activities.length;
  
  // Presence calculation
  const presentCount = activities.filter(a => a.status === 'Present').length;
  const attendanceRate = activities.length > 0
    ? Math.round((presentCount / activities.length) * 100)
    : 0;

  // Average marks
  const hwActivities = activities.filter(a => a.hwMarks !== undefined && a.hwMarks !== null);
  const averageHwMarks = hwActivities.length > 0
    ? Math.round((hwActivities.reduce((sum, a) => sum + (a.hwMarks || 0), 0) / hwActivities.length) * 100) / 100
    : 0;

  const cwActivities = activities.filter(a => a.cwMarks !== undefined && a.cwMarks !== null);
  const averageCwMarks = cwActivities.length > 0
    ? Math.round((cwActivities.reduce((sum, a) => sum + (a.cwMarks || 0), 0) / cwActivities.length) * 100) / 100
    : 0;

  // HSC Batches & Subjects
  const uniqueBatches = Array.from(new Set(students.map(s => s.hscBatch).filter(Boolean)));
  const uniqueSubjects = Array.from(new Set(students.map(s => s.subject).filter(Boolean)));

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  // Sorting recent logs
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const quickShortcuts = [
    { label: 'Student Directory', icon: Users, path: '/students', color: 'from-indigo-500 to-purple-600', badge: `${students.length} Enrolled` },
    { label: 'Pending Approvals', icon: UserCheck, path: '/approvals', color: 'from-amber-500 to-orange-600', badge: 'Registration Queue' },
    { label: 'Log Daily Lesson', icon: CalendarCheck, path: '/tracking', color: 'from-teal-500 to-emerald-600', badge: 'Attendance & HW' },
    { label: 'Exams & Grades', icon: FileSpreadsheet, path: '/exams', color: 'from-sky-500 to-blue-600', badge: `${exams.length} Conducted` },
    { label: 'Tuition Payments', icon: CreditCard, path: '/payments', color: 'from-emerald-500 to-teal-600', badge: `৳${totalCollected.toLocaleString()}` },
    { label: 'System Backup', icon: HardDriveDownload, path: '/backup', color: 'from-slate-700 to-slate-900', badge: 'Export Data' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8" 
      id="stats-dashboard-premium"
    >
      {/* 4 Premium Metric Highlight Grid */}
      <PremiumMetrics 
        students={students}
        activities={activities}
        attendanceRate={attendanceRate}
        presentCount={presentCount}
        totalActivitiesCount={totalActivitiesCount}
        averageHwMarks={averageHwMarks}
        averageCwMarks={averageCwMarks}
        uniqueBatches={uniqueBatches}
      />

      {/* Financial Comparison & Balance Cockpit */}
      <FinancialCockpit 
        totalCollected={totalCollected}
        paymentsCount={payments.length}
        examsCount={exams.length}
      />

      {/* Quick Action Navigation Command Hub */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-display font-black text-slate-900 text-sm sm:text-base">
              Quick Admin Actions & Module Shortcuts
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold hidden sm:inline-block">Instant Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickShortcuts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => router.push(item.path)}
                className="group p-3.5 bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md rounded-2xl transition-all duration-200 text-left flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${item.color} text-white shadow-2xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors block leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold block mt-1 truncate">
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Graphical Rows - SVG Area Chronology & Distribution Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Beautiful Graphical Area Chart */}
        <ProgressChart 
          activities={activities}
          totalActivitiesCount={totalActivitiesCount}
        />

        {/* Right: Batch Distribution & Stream Stats Bento */}
        <BatchSegments 
          students={students}
          uniqueBatches={uniqueBatches}
          uniqueSubjects={uniqueSubjects}
        />
      </div>

      {/* Staggered Recent Progress logs listing */}
      <RecentTuitionLogs 
        students={students}
        recentActivities={recentActivities}
        onSelectStudent={onSelectStudent}
      />
    </motion.div>
  );
}
