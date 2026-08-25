import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  UserCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SectionCaptainInfo, StudentDashboardStats } from '../../../types';

interface StudentProfileViewProps {
  stats?: StudentDashboardStats | null;
  captains?: SectionCaptainInfo[];
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  stats,
  captains = [],
}) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Student Identity Header Card */}
      <div className="p-5 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100/80 shadow-xs space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-emerald-100">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400/30 shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight truncate">{user.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200/80 shrink-0">
                  {user.group} Group
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-800/80 mt-1 flex items-center gap-2 flex-wrap">
                <span>Roll: <strong className="font-mono text-emerald-600 text-sm font-black">{user.rollNumber}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-emerald-950 font-bold">{user.batch}</strong></span>
                <span>•</span>
                <span>Section: <strong className="text-emerald-950 font-bold">{user.section}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex-1 sm:flex-none p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center min-w-[90px] sm:min-w-[110px]">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Attendance</span>
              <span className="text-lg sm:text-xl font-black text-emerald-950">{stats ? `${stats.attendancePercentage}%` : '100%'}</span>
            </div>
            <div className="flex-1 sm:flex-none p-3 sm:p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center min-w-[90px] sm:min-w-[110px]">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-700/80 block">Absence Fine</span>
              <span className="text-lg sm:text-xl font-black text-rose-700 font-mono">৳{stats ? stats.daysAbsent * 100 : 0}</span>
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900">
              Academic Enrollment Profile
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">HSC Batch</span>
              <span className="text-base font-black text-emerald-950">{user.batch}</span>
              <span className="text-[10px] text-emerald-700/60 font-medium block truncate">Higher Secondary</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Assigned Section</span>
              <span className="text-base font-black text-emerald-950">Section {user.section}</span>
              <span className="text-[10px] text-emerald-700/60 font-medium block truncate">Regular Class</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Academic Group</span>
              <span className="text-base font-black text-emerald-950">{user.group}</span>
              <span className="text-[10px] text-emerald-700/60 font-medium block truncate">Curriculum</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Official Roll No</span>
              <span className="text-base font-black text-emerald-600 font-mono">{user.rollNumber}</span>
              <span className="text-[10px] text-emerald-700/60 font-medium block truncate">Institutional Key</span>
            </div>
          </div>
        </div>

        {/* Section Captain Information Block */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Your Section Captain & Leadership
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Designated Class Captain for {user.batch} • Section {user.section}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Verified Leadership
            </span>
          </div>

          {captains && captains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {captains.map((cap) => (
                <div
                  key={cap.id}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-base font-black shadow-xs shrink-0">
                      {cap.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{cap.fullName}</h4>
                      <p className="text-xs text-emerald-200 font-semibold truncate">
                        Roll: <span className="font-mono font-bold text-white">{cap.rollNumber}</span> • Section {cap.assignedSection} • {cap.assignedBatch}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300">
                        Section Captain
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-emerald-100">
                    {cap.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <a href={`mailto:${cap.email}`} className="hover:underline font-medium truncate">
                          {cap.email}
                        </a>
                      </div>
                    )}
                    {cap.phoneNumber && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <a href={`tel:${cap.phoneNumber}`} className="hover:underline font-medium">
                          {cap.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Central Academic Administration</h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Section {user.section} for {user.batch} is currently supervised by Academic Admin. Roll-calls and leave approvals are managed centrally.
                </p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-emerald-300/80 pt-2 border-t border-white/10">
            * Your Class Captain conducts daily class attendance verification and reviews advance leave applications before final administrative recording.
          </p>
        </div>

        {/* Contact & Residential Details */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900">
              Personal & Contact Information
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Institutional Email</span>
                <span className="text-xs font-bold text-emerald-950 truncate block">{user.email}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Contact Phone Number</span>
                <span className="text-xs font-bold text-emerald-950 truncate block">{user.phoneNumber || '+880 1700-000000'}</span>
              </div>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Permanent Residence / Address</span>
                <span className="text-xs font-bold text-emerald-950">{user.address || 'Dhaka, Bangladesh'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Record Summary */}
        {stats && (
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900">
                Attendance Ledger Snapshot
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Total Sessions</span>
                <span className="text-base font-black text-emerald-950">{stats.totalDays} Classes</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Days Present</span>
                <span className="text-base font-black text-emerald-600">{stats.daysPresent}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Days Absent</span>
                <span className="text-base font-black text-rose-600">{stats.daysAbsent}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/80 block">Official Leaves</span>
                <span className="text-base font-black text-teal-600">{stats.approvedLeaves} Approved</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

