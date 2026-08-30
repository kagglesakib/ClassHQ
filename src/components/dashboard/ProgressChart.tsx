import React from 'react';
import { Activity } from '../../types';
import { BarChart3, Zap, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface ProgressChartProps {
  activities: Activity[];
  totalActivitiesCount: number;
}

export default function ProgressChart({
  activities,
  totalActivitiesCount,
}: ProgressChartProps) {
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Generate data coordinates for an elegant custom SVG area chart of Lesson activities over the last 6 months
  const getChronologicalActivityChartData = () => {
    const monthlyCounts: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[key] = 0;
    }

    // Accumulate
    activities.forEach(act => {
      const key = act.date.substring(0, 7);
      if (monthlyCounts[key] !== undefined) {
        monthlyCounts[key]++;
      }
    });

    const entries = Object.entries(monthlyCounts).sort();
    const maxValue = Math.max(...entries.map(([, count]) => count), 6);

    // Build SVG path coordinates
    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = entries.map(([key, count], index) => {
      const x = padding + (index / (entries.length - 1)) * chartWidth;
      const y = padding + chartHeight - (count / maxValue) * chartHeight;
      const [, mNum] = key.split('-');
      const label = months[parseInt(mNum, 10) - 1];
      return { x, y, label, count };
    });

    // Generate path descriptions
    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;
    }

    return { points, linePath, areaPath, maxValue, padding, chartHeight, chartWidth, height, width };
  };

  const chart = getChronologicalActivityChartData();

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100/90 shadow-sm space-y-6 flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h4 className="font-display font-black text-slate-900 text-base sm:text-lg">
              Lesson Activity Chronology
            </h4>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Timeline of monthly conducted tutoring & lesson sessions</p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100/80 px-3 py-1 rounded-xl text-xs font-mono font-black text-indigo-700 self-start sm:self-auto shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          <span>6-Month Velocity</span>
        </div>
      </div>

      {/* SVG Animated Chart Container */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/80 to-indigo-50/20 p-4 sm:p-5 rounded-2xl border border-slate-200/80 mt-2 flex justify-center items-center shadow-inner">
        {activities.length > 0 ? (
          <div className="w-full max-w-[550px]">
            <svg 
              viewBox={`0 0 ${chart.width} ${chart.height}`} 
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = chart.padding + ratio * (chart.chartHeight);
                return (
                  <line 
                    key={index} 
                    x1={chart.padding} 
                    y1={y} 
                    x2={chart.width - chart.padding} 
                    y2={y} 
                    stroke="#cbd5e1" 
                    strokeWidth="1" 
                    strokeDasharray="3 3" 
                  />
                );
              })}

              {/* Shaded Area Path */}
              {chart.areaPath && (
                <path 
                  d={chart.areaPath} 
                  fill="url(#chartGradient)" 
                />
              )}

              {/* Main Line Path */}
              {chart.linePath && (
                <path 
                  d={chart.linePath} 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  filter="url(#glowFilter)"
                />
              )}

              {/* Points circles and tooltip triggers */}
              {chart.points.map((pt, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="6.5" 
                    fill="#ffffff" 
                    stroke="#4f46e5" 
                    strokeWidth="3.5" 
                    className="transition-all duration-300 group-hover:r-9 group-hover:stroke-indigo-800 drop-shadow-md"
                  />
                  {/* Label values always visible / highlighted on hover */}
                  <text 
                    x={pt.x} 
                    y={pt.y - 14} 
                    textAnchor="middle" 
                    className="text-[10px] font-black fill-indigo-900 font-mono"
                  >
                    {pt.count}
                  </text>
                  {/* X Axis labels */}
                  <text 
                    x={pt.x} 
                    y={chart.height - 4} 
                    textAnchor="middle" 
                    className="text-[10px] font-extrabold fill-slate-500 uppercase font-mono"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="py-14 text-center text-slate-400 space-y-1.5">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No timeline statistics available</p>
            <p className="text-[10px]">Add study session activities to generate visual charts.</p>
          </div>
        )}
      </div>

      {/* Legend & Summary */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-bold">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block shadow-2xs" />
          <span>Monthly Session Logs</span>
        </span>
        <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-xl text-slate-800 font-black">
          Total Conducted: {totalActivitiesCount} Sessions
        </span>
      </div>

    </motion.div>
  );
}
