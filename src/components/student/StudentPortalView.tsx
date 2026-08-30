'use client';

import React, { useState, useEffect } from 'react';
import { Student, Activity, Exam, Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StudentDossier from './StudentDossier';
import StudentProfileForm from './StudentProfileForm';
import StudentLessonsView from './StudentLessonsView';
import StudentExamsView from './StudentExamsView';
import StudentPaymentsView from './StudentPaymentsView';
import StudentPasswordForm from './StudentPasswordForm';
import { User, BookOpen, ClipboardList, Banknote, Lock, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StudentPortalView() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dossier' | 'lessons' | 'exams' | 'payments' | 'password'>('dossier');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Load student data by user.sid
  const loadData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' }),
      ]);

      const [resStudents, resActivities, resExams, resPayments] = results;

      if (resStudents.status === 'fulfilled' && resStudents.value.ok) {
        const data = await resStudents.value.json();
        if (Array.isArray(data)) {
          const currentStudent = data.find((s: Student) => s.sid === user?.sid);
          if (currentStudent) setStudent(currentStudent);
        }
      }

      if (resActivities.status === 'fulfilled' && resActivities.value.ok) {
        const data = await resActivities.value.json();
        if (Array.isArray(data)) {
          setActivities(data.filter((a: Activity) => a.studentSid === user?.sid));
        }
      }

      if (resExams.status === 'fulfilled' && resExams.value.ok) {
        const data = await resExams.value.json();
        if (Array.isArray(data)) {
          setExams(data.filter((e: Exam) => e.studentSid === user?.sid));
        }
      }

      if (resPayments.status === 'fulfilled' && resPayments.value.ok) {
        const data = await resPayments.value.json();
        if (Array.isArray(data)) {
          setPayments(data.filter((p: Payment) => p.studentSid === user?.sid));
        }
      }
    } catch (err) {
      console.error('Error loading student portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.sid) {
      loadData();
    }
  }, [user?.sid]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('student-data-counts', {
          detail: {
            lessons: activities.length,
            exams: exams.length,
            payments: payments.length,
          },
        })
      );
    }
  }, [activities.length, exams.length, payments.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab && ['dossier', 'lessons', 'exams', 'payments', 'password'].includes(urlTab)) {
        setActiveTab(urlTab as any);
      }

      const handleCustomTabChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && ['dossier', 'lessons', 'exams', 'payments', 'password'].includes(customEvent.detail)) {
          setActiveTab(customEvent.detail);
          setIsEditingProfile(false);
        }
      };

      window.addEventListener('student-tab-change', handleCustomTabChange);
      return () => {
        window.removeEventListener('student-tab-change', handleCustomTabChange);
      };
    }
  }, []);

  const handleTabSelect = (tab: 'dossier' | 'lessons' | 'exams' | 'payments' | 'password') => {
    setActiveTab(tab);
    setIsEditingProfile(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new CustomEvent('student-tab-change', { detail: tab }));
    }
  };

  // Handler when student saves updated profile
  const handleSaveProfile = async (updatedStudent: Student) => {
    try {
      await fetch(`/api/students/${updatedStudent.sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      setStudent(updatedStudent);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update student profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-500 font-mono">Loading your student portal...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-display font-black text-rose-900 text-lg">Student Record Not Found</h3>
        <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
          We could not locate an active student record associated with Student ID <strong>{user?.sid || 'N/A'}</strong>.
          Please contact the administration to verify your SID enrollment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-12 min-h-screen">
      {/* Tab View Contents */}
      {activeTab === 'dossier' && (
        isEditingProfile ? (
          <StudentProfileForm
            student={student}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditingProfile(false)}
          />
        ) : (
          <StudentDossier
            student={student}
            exams={exams}
            onEditProfileClick={() => setIsEditingProfile(true)}
            onChangePasswordClick={() => handleTabSelect('password')}
          />
        )
      )}

      {activeTab === 'lessons' && (
        <StudentLessonsView
          student={student}
          activities={activities}
        />
      )}

      {activeTab === 'exams' && (
        <StudentExamsView
          student={student}
          exams={exams}
        />
      )}

      {activeTab === 'payments' && (
        <StudentPaymentsView
          student={student}
          payments={payments}
        />
      )}

      {activeTab === 'password' && (
        <StudentPasswordForm />
      )}

      {/* Mobile Bottom Navigation Dock (Optimized for Phone Users) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-2xl border-t border-emerald-800 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] px-2 py-2 sm:hidden flex justify-around items-center">
        <button
          onClick={() => handleTabSelect('dossier')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[56px] min-h-[48px] ${
            activeTab === 'dossier'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/40 border border-emerald-400/50 scale-105 animate-glow-emerald'
              : 'text-emerald-300/80 hover:text-white active:scale-95'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-black tracking-tight leading-none">Dossier</span>
        </button>

        <button
          onClick={() => handleTabSelect('lessons')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[56px] min-h-[48px] relative ${
            activeTab === 'lessons'
              ? 'bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 text-white shadow-lg shadow-teal-500/40 border border-teal-400/50 scale-105 animate-glow-emerald'
              : 'text-emerald-300/80 hover:text-white active:scale-95'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-black tracking-tight leading-none">Lessons</span>
          {activities.length > 0 && (
            <span className={`absolute top-0.5 right-1 text-[9px] font-mono font-black px-1 rounded-full ${
              activeTab === 'lessons' ? 'bg-white text-emerald-800' : 'bg-teal-500/40 text-teal-200'
            }`}>
              {activities.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSelect('exams')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[56px] min-h-[48px] relative ${
            activeTab === 'exams'
              ? 'bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 border border-emerald-400/50 scale-105 animate-glow-emerald'
              : 'text-emerald-300/80 hover:text-white active:scale-95'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-black tracking-tight leading-none">Exams</span>
          {exams.length > 0 && (
            <span className={`absolute top-0.5 right-1 text-[9px] font-mono font-black px-1 rounded-full ${
              activeTab === 'exams' ? 'bg-white text-emerald-800' : 'bg-emerald-500/40 text-emerald-200'
            }`}>
              {exams.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSelect('payments')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[56px] min-h-[48px] relative ${
            activeTab === 'payments'
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 border border-emerald-300/50 scale-105 animate-glow-emerald'
              : 'text-emerald-300/80 hover:text-white active:scale-95'
          }`}
        >
          <Banknote className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-black tracking-tight leading-none">Payments</span>
          {payments.length > 0 && (
            <span className={`absolute top-0.5 right-1 text-[9px] font-mono font-black px-1 rounded-full ${
              activeTab === 'payments' ? 'bg-white text-emerald-800' : 'bg-emerald-500/40 text-emerald-200'
            }`}>
              {payments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSelect('password')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[56px] min-h-[48px] ${
            activeTab === 'password'
              ? 'bg-gradient-to-tr from-rose-600 via-red-600 to-rose-700 text-white shadow-lg shadow-rose-600/40 border border-rose-400/50 scale-105'
              : 'text-rose-300/80 hover:text-white active:scale-95'
          }`}
        >
          <Lock className="w-5 h-5 mb-0.5 text-rose-300" />
          <span className="text-[10px] font-black tracking-tight leading-none">Security</span>
        </button>
      </div>
    </div>
  );
}
