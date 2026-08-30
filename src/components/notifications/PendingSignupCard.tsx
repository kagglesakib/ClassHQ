'use client';

import React from 'react';
import { Mail, Phone, GraduationCap, Hash, Check, RefreshCw, XCircle } from 'lucide-react';
import { UserLogItem } from '../../types';

interface PendingSignupCardProps {
  user: UserLogItem;
  suggestedNextSid: string;
  sidInput: string;
  isProcessing: boolean;
  onSidChange: (email: string, val: string) => void;
  onAutoFillSid: (email: string) => void;
  onApprove: (user: UserLogItem) => void;
  onDisapprove: (user: UserLogItem) => void;
}

export const PendingSignupCard = React.memo(function PendingSignupCard({
  user: u,
  suggestedNextSid,
  sidInput,
  isProcessing,
  onSidChange,
  onAutoFillSid,
  onApprove,
  onDisapprove,
}: PendingSignupCardProps) {
  const currentSidInput = sidInput !== undefined ? sidInput : (u.sid || '');
  const isApproved = u.isApproved === 'yes' || u.isApproved === 'approved';
  const isDisapproved = u.isApproved === 'no' || u.isApproved === 'disapproved';

  return (
    <div className="pt-3.5 first:pt-0 space-y-3 border-b border-amber-900/40 last:border-b-0 pb-3.5">
      {/* User Header Info */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-500/30 space-y-2 text-white">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-slate-950 text-xs bg-amber-500 px-2.5 py-1 rounded-xl shadow-xs">{u.name}</span>
          {isDisapproved ? (
            <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase font-mono shadow-xs">
              Disapproved
            </span>
          ) : (
            <span className="text-[10px] bg-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase font-mono shadow-xs animate-pulse">
              Pending
            </span>
          )}
        </div>

        {/* Elementwise details */}
        <div className="text-[11px] font-medium space-y-1.5 pt-1">
          <div className="bg-indigo-950/90 border border-indigo-500/40 text-indigo-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono">
            <Mail className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span className="truncate max-w-[200px]" title={u.email}>{u.email}</span>
          </div>
          {u.mobile && (
            <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono font-bold">
              <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{u.mobile}</span>
            </div>
          )}
          {u.college && (
            <div className="bg-violet-950/90 border border-violet-500/40 text-violet-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-violet-300 shrink-0" />
              <span className="truncate">{u.college} {u.hscBatch ? `(HSC ${u.hscBatch})` : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* SID Assignment & Action Controls */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 border border-amber-500/50 rounded-2xl p-3 space-y-2.5 text-white shadow-md">
        {!isApproved && (
          <>
            <div className="flex items-center justify-between gap-1.5">
              <label className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                Assign Student ID (SID):
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={currentSidInput}
                onChange={(e) => onSidChange(u.email, e.target.value)}
                placeholder="e.g. S101"
                disabled={isProcessing}
                className="w-full pl-7 pr-3 py-1.5 bg-slate-900/90 border border-amber-500/60 rounded-xl text-xs font-mono font-black text-amber-300 focus:ring-2 focus:ring-amber-400 uppercase placeholder:text-amber-500/40"
              />
              <Hash className="w-3.5 h-3.5 text-amber-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onApprove(u)}
            disabled={isProcessing}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50 border border-emerald-400/30"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white" />
            )}
            <span>Approve</span>
          </button>

          <button
            type="button"
            onClick={() => onDisapprove(u)}
            disabled={isProcessing}
            className="w-full py-2 bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-500/50 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-300" />
            )}
            <span>Disapprove</span>
          </button>
        </div>
      </div>
    </div>
  );
});
