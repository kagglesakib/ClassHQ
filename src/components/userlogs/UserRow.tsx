'use client';

import React, { useState } from 'react';
import { Mail, Key, Eye, EyeOff, Hash, CheckCircle2, XCircle, Check, RefreshCw, Trash2, GraduationCap, Phone, UserCheck, Sparkles, BookOpen, Users, Shield, MapPin } from 'lucide-react';
import { UserLogItem } from '../../types';

interface UserRowProps {
  user: UserLogItem;
  suggestedNextSid: string;
  sidInput: string;
  isProcessing: boolean;
  onSidChange: (email: string, val: string) => void;
  onAutoFillNextSid: (email: string) => void;
  onApprove: (user: UserLogItem) => void;
  onDisapprove: (user: UserLogItem) => void;
  onUpdateRole: (email: string, userType: 'admin' | 'student', sid: string) => void;
  onDelete: (user: UserLogItem) => void;
}

export const UserRow = React.memo(function UserRow({
  user: u,
  suggestedNextSid,
  sidInput,
  isProcessing,
  onSidChange,
  onAutoFillNextSid,
  onApprove,
  onDisapprove,
  onUpdateRole,
  onDelete,
}: UserRowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isApproved = u.isApproved === 'yes';
  const isDisapproved = u.isApproved === 'no' || u.isApproved === 'disapproved';
  const currentSidInput = sidInput !== undefined ? sidInput : u.sid || '';

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 space-y-3 sm:space-y-4 shadow-xl hover:shadow-2xl ${
        !isApproved
          ? isDisapproved
            ? 'bg-gradient-to-br from-rose-950 via-slate-950 to-red-950 border-rose-500/60 text-white'
            : 'bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950 border-amber-500/60 text-white'
          : u.userType === 'admin'
          ? 'bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 border-purple-500/60 text-white'
          : 'bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-900 border-amber-500/30 text-white'
      }`}
    >
      {/* Top Header Card: Name, Role Pill, Status Pill, Delete Button */}
      <div className="bg-slate-900/90 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-amber-500/30 shadow-md flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Name and Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
          {/* Avatar / Icon Chip */}
          <div
            className={`p-2 rounded-xl text-white shrink-0 shadow-xs font-black text-xs font-mono flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 ${
              u.userType === 'admin'
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                : isApproved
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                : isDisapproved
                ? 'bg-gradient-to-tr from-rose-600 to-red-600'
                : 'bg-gradient-to-tr from-amber-500 to-orange-500'
            }`}
          >
            {u.name ? u.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-xs truncate max-w-[150px] min-[400px]:max-w-[220px] sm:max-w-[320px]" title={u.name}>
                {u.name || 'Unnamed Student'}
              </span>

              {/* Static Role Badge */}
              <span
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-black uppercase font-mono border shadow-2xs flex items-center gap-1 ${
                  u.userType === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400'
                    : 'bg-slate-800 text-amber-200 border-amber-500/40'
                }`}
              >
                <Shield className="w-3 h-3 text-amber-300" />
                <span>{u.userType}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Approval Status Badge & Delete */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {isApproved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 rounded-full text-[10px] sm:text-xs font-black uppercase font-mono shadow-xs">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-200 shrink-0" />
              Approved
            </span>
          ) : isDisapproved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 bg-gradient-to-r from-rose-600 to-red-600 text-white border border-rose-400 rounded-full text-[10px] sm:text-xs font-black uppercase font-mono shadow-xs">
              <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-200 shrink-0" />
              Disapproved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-300 rounded-full text-[10px] sm:text-xs font-black uppercase font-mono shadow-xs animate-pulse">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 shrink-0" />
              Pending
            </span>
          )}

          {/* Delete User Button */}
          <button
            onClick={() => onDelete(u)}
            disabled={isProcessing}
            className="p-1.5 sm:p-2 bg-rose-950/80 text-rose-300 hover:bg-rose-900 hover:text-white active:scale-95 rounded-xl border border-rose-500/50 transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
            title="Delete Student & Associated Records"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Elementwise Colored Attributes Grid */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Email Element */}
        <div className="bg-indigo-950/90 border border-indigo-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
          <span className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs">
            <Mail className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Email Address</div>
            <div className="font-mono font-bold text-xs text-indigo-100 break-all truncate" title={u.email}>{u.email}</div>
          </div>
        </div>

        {/* Password Element */}
        <div className="bg-amber-950/90 border border-amber-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 shadow-md min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 shadow-2xs">
              <Key className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Password</div>
              <div className="font-mono font-black text-xs text-amber-200 tracking-wider">
                {showPassword ? u.password : '••••••••'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-lg transition-colors cursor-pointer shrink-0 border border-amber-500/30"
            title="Toggle password view"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Mobile Phone Element */}
        <div className="bg-emerald-950/90 border border-emerald-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
          <span className="p-1.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-2xs">
            <Phone className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Mobile Number</div>
            <div className="font-mono font-black text-xs text-emerald-100 truncate">{u.mobile || 'N/A'}</div>
          </div>
        </div>

        {/* Saved SID Element */}
        <div className="bg-teal-950/90 border border-teal-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
          <span className="p-1.5 bg-teal-600 text-white rounded-xl shrink-0 shadow-2xs">
            <Hash className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase text-teal-300 tracking-wider">Saved SID</div>
            <div className="font-mono font-black text-xs text-teal-100 truncate">{u.sid || 'Not Assigned Yet'}</div>
          </div>
        </div>

        {/* College Element */}
        {u.college && (
          <div className="bg-violet-950/90 border border-violet-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
            <span className="p-1.5 bg-violet-600 text-white rounded-xl shrink-0 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase text-violet-300 tracking-wider">College</div>
              <div className="font-bold text-xs text-violet-100 truncate" title={u.college}>{u.college}</div>
            </div>
          </div>
        )}

        {/* HSC Batch Element */}
        {u.hscBatch && (
          <div className="bg-sky-950/90 border border-sky-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
            <span className="p-1.5 bg-sky-600 text-white rounded-xl shrink-0 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase text-sky-300 tracking-wider">HSC Batch</div>
              <div className="font-black text-xs text-sky-100 truncate">{u.hscBatch}</div>
            </div>
          </div>
        )}

        {/* Subject / Group Element */}
        {(u.subject || u.group) && (
          <div className="bg-fuchsia-950/90 border border-fuchsia-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
            <span className="p-1.5 bg-fuchsia-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Users className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase text-fuchsia-300 tracking-wider">Subject / Group</div>
              <div className="font-bold text-xs text-fuchsia-100 truncate">{u.subject || u.group || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Guardian Phone Element */}
        {u.guardiansPhone && (
          <div className="bg-orange-950/90 border border-orange-500/40 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-md min-w-0">
            <span className="p-1.5 bg-orange-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Phone className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase text-orange-300 tracking-wider">Guardian Phone</div>
              <div className="font-mono font-bold text-xs text-orange-100 truncate">{u.guardiansPhone}</div>
            </div>
          </div>
        )}
      </div>

      {/* Assign SID & Interactive Actions Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 border border-amber-500/50 p-2.5 sm:p-3.5 rounded-2xl text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shadow-md">
        {/* SID Input Box (Only for unapproved/pending students) */}
        {!isApproved && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-900/80 text-amber-300 rounded-xl shrink-0 border border-amber-600/50">
              <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                value={currentSidInput}
                onChange={(e) => onSidChange(u.email, e.target.value)}
                placeholder="Assign SID (e.g. S101)"
                disabled={isProcessing}
                className="w-full bg-slate-900/90 border border-amber-500/60 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono font-black text-amber-300 placeholder:text-amber-500/40 focus:outline-hidden focus:ring-2 focus:ring-amber-400 uppercase min-w-0"
              />
            </div>
          </div>
        )}

        {/* Action Approval Buttons */}
        <div className={`flex items-center gap-2 shrink-0 w-full sm:w-auto ${isApproved ? 'ml-auto' : ''}`}>
          {isApproved ? (
            <button
              onClick={() => onDisapprove(u)}
              disabled={isProcessing}
              title="Disapprove / Revoke student access"
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-xl border border-rose-400/40 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-rose-200" />
              <span>Disapprove Access</span>
            </button>
          ) : isDisapproved ? (
            <button
              onClick={() => onApprove(u)}
              disabled={isProcessing}
              title="Approve student and assign SID"
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl border border-emerald-400/40 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Approve Student</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onApprove(u)}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-md border border-emerald-400/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-200" />
                )}
                <span>Approve Student</span>
              </button>
              <button
                onClick={() => onDisapprove(u)}
                disabled={isProcessing}
                className="px-3.5 sm:px-4 py-2 bg-rose-600/90 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl border border-rose-400/40 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <XCircle className="w-4 h-4 text-rose-200" />
                <span>Disapprove</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

