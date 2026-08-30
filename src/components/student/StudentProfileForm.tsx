'use client';

import React, { useState } from 'react';
import { Student } from '../../types';
import { X, Save, Lock, CheckCircle2, User, Building, Mail, Phone, Home } from 'lucide-react';
import { formatBatch } from '../../utils/formatBatch';

interface StudentProfileFormProps {
  student: Student;
  onSave: (updatedStudent: Student) => void;
  onCancel: () => void;
}

export default function StudentProfileForm({
  student,
  onSave,
  onCancel,
}: StudentProfileFormProps) {
  const [college, setCollege] = useState(student.college || '');
  const [email, setEmail] = useState(student.email || '');
  const [mobile, setMobile] = useState(student.mobile || '');
  const [address, setAddress] = useState(student.address || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const updated: Student = {
      ...student,
      college: college.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
    };

    onSave(updated);
    setSuccessMsg('Profile updated successfully!');
  };

  return (
    <div className="bg-emerald-50/90 p-6 rounded-3xl border border-indigo-100 shadow-xl space-y-5 animate-scaleUp max-w-3xl mx-auto" id="student-profile-form-container">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Edit Student Profile Details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            You can edit your College, Email, Mobile Phone, and Residential Address. Academic credentials are managed by administration.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Read-Only Academic Lock Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Student ID (SID)
            </span>
            <p className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {student.sid}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Full Name
            </span>
            <p className="font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {student.name}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> HSC Batch & Group
            </span>
            <p className="font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {formatBatch(student.hscBatch, 'No Batch')} • {student.group}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Tuitioned Subject
            </span>
            <p className="font-mono font-bold text-indigo-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {student.subject}
            </p>
          </div>
        </div>

        {/* Editable Student Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* College */}
          <div className="space-y-1 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
            <label className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-indigo-600" /> College / Institution</span>
              <span className="text-[10px] text-indigo-600 font-bold">✓ Editable</span>
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Notre Dame College"
              className="w-full px-3.5 py-2.5 bg-emerald-100/50 border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-300 focus:outline-hidden"
            />
          </div>

          {/* Email */}
          <div className="space-y-1 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
            <label className="text-[10px] font-black text-purple-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-purple-600" /> Email Address</span>
              <span className="text-[10px] text-purple-600 font-bold">✓ Editable</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@gmail.com"
              className="w-full px-3.5 py-2.5 bg-emerald-100/50 border border-purple-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-300 focus:outline-hidden"
            />
          </div>

          {/* Student Mobile */}
          <div className="space-y-1 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
            <label className="text-[10px] font-black text-emerald-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> Student Mobile Phone</span>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Editable</span>
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 01700000000"
              className="w-full px-3.5 py-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-300 focus:outline-hidden"
            />
          </div>

          {/* Address */}
          <div className="space-y-1 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100">
            <label className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-amber-600" /> Residential Address</span>
              <span className="text-[10px] text-amber-600 font-bold">✓ Editable</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
              className="w-full px-3.5 py-2.5 bg-emerald-100/50 border border-amber-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-300 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
