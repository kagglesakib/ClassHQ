'use client';

import React, { useState, useEffect } from 'react';
import BackupRestore from '@/components/BackupRestore';
import { AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';

export default function BackupPage() {
  const [counts, setCounts] = useState({ students: 0, activities: 0, exams: 0, payments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudents, resActivities, resExams, resPayments] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' })
      ]);

      const students = resStudents.ok ? await resStudents.json() : [];
      const activities = resActivities.ok ? await resActivities.json() : [];
      const exams = resExams.ok ? await resExams.json() : [];
      const payments = resPayments.ok ? await resPayments.json() : [];

      setCounts({
        students: students.length,
        activities: activities.length,
        exams: exams.length,
        payments: payments.length
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load data counts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCounts(); }, []);

  const handleBackupData = async () => {
    const res = await fetch('/api/backup');
    if (!res.ok) throw new Error('Failed to download backup snapshot');
    const data = await res.json();

    const fileName = `tutorhq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreData = async (jsonData: any) => {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to restore database backup');
      await fetchCounts();
      return { success: true, message: resJson.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Restoration failed.' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading backup center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 border border-rose-100 py-3 px-4 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchCounts} className="underline hover:text-rose-900 font-bold ml-1 flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
      <BackupRestore
        onBackup={handleBackupData}
        onRestore={handleRestoreData}
        loadingData={loading}
        studentsCount={counts.students}
        activitiesCount={counts.activities}
        examsCount={counts.exams}
        paymentsCount={counts.payments}
      />
    </div>
  );
}
