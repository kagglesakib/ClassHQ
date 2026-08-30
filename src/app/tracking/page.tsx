'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Activity } from '@/types';
import GlobalTrackingList from '@/components/GlobalTrackingList';
import { AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';

export default function TrackingPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudents, resActivities] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' })
      ]);
      if (!resStudents.ok || !resActivities.ok) throw new Error('Failed to load tracking data');
      setStudents(await resStudents.json());
      setActivities(await resActivities.json());
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
        <p className="text-xs text-slate-500 font-medium">Loading tracking data...</p>
      </div>
    );
  }

  const handleUpdateActivity = async (updated: Activity) => {
    const res = await fetch(`/api/activities/${updated.aid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update activity log');
    setActivities(prev => prev.map(a => a.aid === updated.aid ? updated : a));
  };

  const handleDeleteActivity = async (aid: string) => {
    const res = await fetch(`/api/activities/${aid}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete activity log');
    setActivities(prev => prev.filter(a => a.aid !== aid));
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
      <GlobalTrackingList
        activities={activities}
        students={students}
        onSelectStudent={(sid) => router.push(`/students?sid=${sid}`)}
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}
      />
    </div>
  );
}
