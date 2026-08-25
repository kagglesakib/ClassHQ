import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight
} from 'lucide-react';
import { AdminOverviewStats } from '../../../types';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminChartsSection } from './AdminChartsSection';

interface AdminOverviewViewProps {
  stats: AdminOverviewStats | null;
  loading: boolean;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ 
  stats, 
  loading
}) => {
  return (
    <div className="space-y-8">
      {/* Top Banner Alert for Pending Actions */}
      {stats && stats.pendingStudentApprovals > 0 && (
        <div className="p-5 rounded-3xl bg-rose-100 border border-rose-300 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                Action Required: Pending Student Registrations
              </h4>
              <p className="text-xs font-medium text-rose-800 mt-0.5">
                You have <strong className="text-rose-950">{stats.pendingStudentApprovals}</strong> new student registration requests awaiting administrative approval.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/pending-students"
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              Review Pending Applications
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row - Light Red Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-sm space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">College Attendance</span>
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? `${stats.todayInstitutionAttendanceRate}%` : '0%'}
          </div>
          <p className="text-[11px] font-bold text-slate-500">Live section aggregation</p>
        </div>

        {/* Total Enrolled Students */}
        <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-sm space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Students</span>
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? stats.totalStudents : 0}
          </div>
          <p className="text-[11px] font-bold text-slate-500">
            {stats && stats.pendingStudentApprovals > 0 ? `${stats.pendingStudentApprovals} awaiting approval` : 'All verified'}
          </p>
        </div>

        {/* Section Captains */}
        <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-sm space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section Captains</span>
            <div className="p-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            {stats ? (stats.captainsCount ?? stats.totalCaptains) : 0}
          </div>
          <p className="text-[11px] font-bold text-slate-500">Class representatives</p>
        </div>

        {/* Active Sections */}
        <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-sm space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Sections</span>
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats ? stats.sectionsCount : 0}
          </div>
          <p className="text-[11px] font-bold text-slate-500">Across HSC Cohorts</p>
        </div>
      </div>

      {/* Dynamic Visual Graph Analytics Section */}
      <AdminChartsSection stats={stats} loading={loading} />

      {/* Section-Wise Attendance Breakdown */}
      <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Section-Wise Attendance Breakdown</h3>
            <p className="text-xs font-medium text-slate-500">
              Audited metrics and roster distribution per HSC batch and section.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-rose-600 animate-pulse">
            Querying section analytics...
          </div>
        ) : (stats?.sectionAttendanceBreakdown?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats?.sectionAttendanceBreakdown || []).map((sec) => (
              <div
                key={`${sec.batch}-${sec.section}`}
                className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3 hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900">
                        Section {sec.section}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">{sec.batch}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${
                        sec.attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {sec.attendanceRate}%
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                        Attendance
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        sec.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(sec.attendanceRate, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold pt-1">
                    <span>{sec.totalStudents} Enrolled</span>
                    <span className={sec.attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                      {sec.attendanceRate >= 75 ? '✓ Compliant' : '⚠ Below 75%'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Building2}
            title="No Attendance Logs Found"
            description="Attendance records will populate in real-time as class captains conduct roll calls."
          />
        )}
      </div>
    </div>
  );
};
