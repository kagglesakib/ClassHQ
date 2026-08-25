import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  DollarSign,
  AlertCircle,
  Coins
} from 'lucide-react';
import { AttendanceRecord, StudentDashboardStats } from '../../../types';

interface StudentAttendanceChartsProps {
  records: AttendanceRecord[];
  stats: StudentDashboardStats | null;
  selectedMonth?: string;
}

export const StudentAttendanceCharts: React.FC<StudentAttendanceChartsProps> = ({
  records = [],
  stats,
  selectedMonth
}) => {
  const [chartType, setChartType] = useState<'monthly' | 'trend' | 'distribution'>('monthly');

  // 1. Process Monthly Data with Absence Fine calculation (৳100 per absent day)
  const monthlyData = useMemo(() => {
    if (!records || records.length === 0) return [];

    const monthMap: {
      [key: string]: {
        monthKey: string;
        monthName: string;
        timestamp: number;
        present: number;
        absent: number;
        leave: number;
        total: number;
      };
    } = {};

    records.forEach((rec) => {
      const d = new Date(rec.date);
      if (isNaN(d.getTime())) return;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          monthKey,
          monthName,
          timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
          present: 0,
          absent: 0,
          leave: 0,
          total: 0
        };
      }

      monthMap[monthKey].total += 1;
      const s = String(rec.status || '').toLowerCase();
      if (s === 'present') {
        monthMap[monthKey].present += 1;
      } else if (s === 'absent') {
        monthMap[monthKey].absent += 1;
      } else {
        monthMap[monthKey].leave += 1;
      }
    });

    return Object.values(monthMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => {
        const rate = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
        const fine = item.absent * 100; // 100 Tk per absent day
        return {
          ...item,
          attendanceRate: rate,
          fine
        };
      });
  }, [records]);

  // 2. Process Timeline / Trend Data (Progressive Attendance Rate over time)
  const trendData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Sort ascending by date & timestamp
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
    });

    let cumulativePresent = 0;
    let cumulativeTotal = 0;

    return sorted.map((rec, index) => {
      cumulativeTotal += 1;
      const statusLower = String(rec.status || '').toLowerCase();
      const isPresent = statusLower === 'present';
      const isLeave = statusLower === 'leave' || statusLower === 'excused';
      
      if (isPresent) {
        cumulativePresent += 1;
      }

      const rate = Math.round((cumulativePresent / cumulativeTotal) * 100);

      // Nicely formatted date label
      const d = new Date(rec.date);
      const dateLabel = isNaN(d.getTime())
        ? rec.date
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        sessionNumber: index + 1,
        date: rec.date,
        dateLabel,
        status: rec.status,
        rate,
        remarks: rec.remarks || '',
        markedBy: rec.markedBy?.name || 'Class Captain',
        statusValue: isPresent ? 100 : isLeave ? 50 : 0
      };
    });
  }, [records]);

  // 3. Process Distribution / Ratio Data
  const distributionData = useMemo(() => {
    const presentCount = stats?.daysPresent ?? records.filter((r) => String(r.status).toLowerCase() === 'present').length;
    const absentCount = stats?.daysAbsent ?? records.filter((r) => String(r.status).toLowerCase() === 'absent').length;
    const leaveCount = (stats?.daysLeave ?? 0) + (stats?.approvedLeaves ?? 0);
    const lateOrOther = records.filter((r) => ['late', 'excused'].includes(String(r.status).toLowerCase())).length;

    const data = [
      { name: 'Present', value: presentCount, color: '#059669', bgClass: 'bg-emerald-500' },
      { name: 'Absent', value: absentCount, color: '#e11d48', bgClass: 'bg-rose-500' },
      { name: 'Leave', value: leaveCount + lateOrOther, color: '#d97706', bgClass: 'bg-amber-500' }
    ].filter((item) => item.value > 0);

    // Fallback if no records
    if (data.length === 0) {
      return [{ name: 'No Data', value: 1, color: '#cbd5e1', bgClass: 'bg-slate-300' }];
    }

    return data;
  }, [stats, records]);

  // Summary Metrics Across All Logged Months
  const overallMetrics = useMemo(() => {
    const totalAbsent = stats?.daysAbsent ?? records.filter((r) => String(r.status).toLowerCase() === 'absent').length;
    const totalFine = totalAbsent * 100;
    const totalSessions = stats?.totalDays ?? records.length;
    const totalPresent = stats?.daysPresent ?? records.filter((r) => String(r.status).toLowerCase() === 'present').length;
    const overallRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalFine,
      overallRate,
      monthsCount: monthlyData.length
    };
  }, [stats, records, monthlyData]);

  // Custom Tooltip for Trend Chart
  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-1.5">
            <span className="font-mono font-bold text-slate-900">{data.date}</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Session #{data.sessionNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500 font-medium">Session Status:</span>
            <span className={`font-black uppercase text-[11px] ${
              String(data.status).toLowerCase() === 'present'
                ? 'text-emerald-600'
                : String(data.status).toLowerCase() === 'absent'
                ? 'text-rose-600'
                : 'text-amber-600'
            }`}>
              {data.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500 font-medium">Cumulative Rate:</span>
            <span className="font-bold font-mono text-emerald-950">{data.rate}%</span>
          </div>

          {String(data.status).toLowerCase() === 'absent' && (
            <div className="flex items-center justify-between text-[11px] text-rose-700 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-100">
              <span>Absence Fine:</span>
              <span className="font-mono">৳100 Tk</span>
            </div>
          )}

          {data.remarks && (
            <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              "{data.remarks}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Monthly Chart
  const CustomMonthlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 shadow-xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
            <span className="font-black text-slate-900 text-sm">{data.monthName}</span>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {data.attendanceRate}% Present
            </span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> Present:
              </span>
              <strong className="font-mono">{data.present} Days</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600" /> Absent:
              </span>
              <strong className="font-mono">{data.absent} Days</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-600" /> Leave:
              </span>
              <strong className="font-mono">{data.leave} Days</strong>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Total Sessions:</span>
            <span className="font-mono text-slate-900">{data.total}</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-900">Monthly Fine (100tk/day):</span>
            <span className="font-black font-mono text-rose-700">৳{data.fine}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100/90 shadow-xs space-y-6">
      {/* Chart Header with Interactive Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
              Monthly Attendance Graph & Fine Ledger
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Monthly Analytics
            </span>
          </div>
          <p className="text-xs font-medium text-emerald-700/80 mt-0.5">
            Month-by-month attendance breakdown, presence percentage, and absence fine calculations (৳100/absent day).
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1 p-1 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            id="btn-chart-tab-monthly"
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              chartType === 'monthly'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Bars</span>
          </button>

          <button
            type="button"
            id="btn-chart-tab-trend"
            onClick={() => setChartType('trend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              chartType === 'trend'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trend Line</span>
          </button>

          <button
            type="button"
            id="btn-chart-tab-distribution"
            onClick={() => setChartType('distribution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              chartType === 'distribution'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/50'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Ratio</span>
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="min-h-[290px] w-full">
        {records.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200">
            <BarChart3 className="w-10 h-10 text-emerald-400 mb-2 stroke-1" />
            <h4 className="text-sm font-bold text-emerald-900">No Attendance Data Recorded Yet</h4>
            <p className="text-xs text-emerald-700/70 max-w-sm mt-1">
              Once your section captain marks daily roll-call attendance, your monthly trajectory and charts will automatically render here.
            </p>
          </div>
        ) : chartType === 'monthly' ? (
          /* 1. MONTHLY BAR CHART WITH ABSENT & FINE INSIGHTS */
          <div className="space-y-3">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 10, fontSize: 11, fontWeight: 700 }}
                  />
                  <Bar dataKey="present" name="Present (Days)" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" name="Absent (Days)" fill="#e11d48" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leave" name="Leave" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-2 pt-1 border-t border-emerald-100/60">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  Fine Rule: ৳100 per absent day
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                {monthlyData.length} {monthlyData.length === 1 ? 'Month' : 'Months'} Recorded
              </span>
            </div>
          </div>
        ) : chartType === 'trend' ? (
          /* 2. AREA / TREND CHART */
          <div className="space-y-3">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    name="Attendance Rate"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attendanceGradient)"
                    dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#047857', stroke: '#ecfdf5', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart legend footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600 px-2 pt-1 border-t border-emerald-100/60">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
                Cumulative Presence Progression
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {trendData.length} Total Sessions
              </span>
            </div>
          </div>
        ) : (
          /* 3. DISTRIBUTION DONUT CHART */
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-2">
            <div className="h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Sessions`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #a7f3d0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-emerald-950 leading-none">
                  {stats ? `${stats.attendancePercentage}%` : `${overallMetrics.overallRate}%`}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700/80 mt-1">
                  Presence Rate
                </span>
              </div>
            </div>

            {/* Distribution Legend & Breakdown List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900">
                Session Distribution Breakdown
              </h4>
              <div className="space-y-2.5">
                {distributionData.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-md ${item.bgClass}`} />
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">{item.value} Days</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        ({Math.round((item.value / Math.max(records.length, 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Month-Wise Absence Fine Breakdown Ledger */}
      {monthlyData.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-emerald-100/70">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              Monthly Fine Summary Ledger (100tk / Absent Day)
            </h4>
            <span className="text-xs font-black text-rose-700 font-mono">
              Total Fines: ৳{overallMetrics.totalFine} Tk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyData.map((m) => (
              <div
                key={m.monthKey}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.fine > 0
                    ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/70'
                    : 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-slate-900 text-xs">{m.monthName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    m.fine > 0
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {m.fine > 0 ? `৳${m.fine} Fine` : 'No Fine'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] mb-2">
                  <div className="p-1.5 rounded-xl bg-white/80 border border-emerald-100">
                    <span className="text-[9px] text-emerald-700 font-bold block uppercase">Present</span>
                    <span className="font-mono font-black text-emerald-900">{m.present}</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-white/80 border border-rose-100">
                    <span className="text-[9px] text-rose-700 font-bold block uppercase">Absent</span>
                    <span className="font-mono font-black text-rose-700">{m.absent}</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-white/80 border border-slate-100">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase">Rate</span>
                    <span className="font-mono font-black text-slate-800">{m.attendanceRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-black/5 font-medium">
                  <span>Calculation:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {m.absent} × ৳100 = ৳{m.fine}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
