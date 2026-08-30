'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Exam } from '@/types';
import GlobalExamList from '@/components/GlobalExamList';
import { AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';

export default function ExamsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudents, resExams] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' })
      ]);
      if (!resStudents.ok || !resExams.ok) throw new Error('Failed to load exams data');
      setStudents(await resStudents.json());
      setExams(await resExams.json());
    } catch (err: any) {
      setError(err.message || 'Connection lost to the server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading exams ledger...</p>
      </div>
    );
  }

  const handleUpdateExam = async (updated: Exam) => {
    const res = await fetch(`/api/exams/${updated.eid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update exam record');
    setExams(prev => prev.map(e => e.eid === updated.eid ? updated : e));
  };

  const handleDeleteExam = async (eid: string) => {
    const res = await fetch(`/api/exams/${eid}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete exam record');
    setExams(prev => prev.filter(e => e.eid !== eid));
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 border border-rose-100 py-3 px-4 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="underline hover:text-rose-900 font-bold ml-1 flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
      <GlobalExamList
        exams={exams}
        students={students}
        onSelectStudent={(sid) => router.push(`/students?sid=${sid}`)}
        onUpdateExam={handleUpdateExam}
        onDeleteExam={handleDeleteExam}
      />
    </div>
  );
}
