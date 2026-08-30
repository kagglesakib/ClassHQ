import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student } from '../types';
import { X, User, GraduationCap, Phone, Sparkles, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentFormProps {
  student?: Student; // If provided, we are editing
  onSave: (student: Student, originalSid?: string) => void;
  onCancel: () => void;
  existingSids?: string[];
}

export default function StudentForm({ student, onSave, onCancel, existingSids }: StudentFormProps) {
  const [mounted, setMounted] = useState(false);
  const [sid, setSid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [hscBatch, setHscBatch] = useState('');
  const [subject, setSubject] = useState('');
  const [group, setGroup] = useState('');
  const [mobile, setMobile] = useState('');
  const [guardiansPhone, setGuardiansPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (student) {
      setSid(student.sid || '');
      setName(student.name || '');
      setEmail(student.email || '');
      setCollege(student.college || '');
      setHscBatch(student.hscBatch || '');
      setSubject(student.subject || '');
      setGroup(student.group || '');
      setMobile(student.mobile || '');
      setGuardiansPhone(student.guardiansPhone || '');
      setAddress(student.address || '');
    } else {
      setSid('');
      setName('');
      setEmail('');
      setCollege('');
      setHscBatch('');
      setSubject('');
      setGroup('');
      setMobile('');
      setGuardiansPhone('');
      setAddress('');
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    const newErrors: Record<string, string> = {};
    if (!sid.trim()) {
      newErrors.sid = 'Student ID (SID) is required';
    } else {
      const normalizedSid = sid.trim().toLowerCase();
      const originalSidNormalized = student?.sid.trim().toLowerCase();
      if (existingSids) {
        const isDuplicate = existingSids.some(existing => {
          const normEx = existing.trim().toLowerCase();
          if (student && normEx === originalSidNormalized) {
            return false; // exclude current student's original SID
          }
          return normEx === normalizedSid;
        });
        if (isDuplicate) {
          newErrors.sid = 'This Student ID (SID) is already assigned to another student.';
        }
      }
    }

    if (!name.trim()) newErrors.name = 'Student Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      sid: sid.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      college: college.trim(),
      hscBatch: hscBatch.trim(),
      subject: subject.trim(),
      group: group.trim(),
      mobile: mobile.trim(),
      guardiansPhone: guardiansPhone.trim(),
      address: address.trim(),
    }, student?.sid);
  };

  const modalContent = (
    <div 
      className="fixed top-20 sm:top-20 inset-x-0 bottom-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 pt-2 sm:pt-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-6.5rem)] animate-scaleUp" 
        id="student-form-component"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {student ? 'Edit Student Details' : 'Add New Student'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {student
                ? `Updating records for SID: ${student.sid}`
                : 'Set up a new student profile. All fields can be entered manually.'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-200/80 text-slate-400 hover:text-slate-650 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Section 1: Basic Identity (Indigo Theme) */}
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/90 space-y-3">
          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            1. Student Identity & Registration
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Student SID */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                Student ID (SID) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={sid}
                onChange={(e) => {
                  setSid(e.target.value);
                  if (errors.sid) setErrors(prev => ({ ...prev, sid: '' }));
                }}
                placeholder="e.g. S101, S102"
                className={`w-full px-3.5 py-2.5 text-xs font-bold bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-200 transition-all ${
                  errors.sid ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                }`}
              />
              {errors.sid && <p className="text-[10px] text-rose-600 font-bold">{errors.sid}</p>}
            </div>

            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                Full Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Sakib Ahmed"
                className={`w-full px-3.5 py-2.5 text-xs font-bold bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-200 transition-all ${
                  errors.name ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="text-[10px] text-rose-600 font-bold">{errors.name}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Academic Background (Sky Theme) */}
        <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100/90 space-y-3">
          <h4 className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            2. College & Academic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* College */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                College / Institution
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Notre Dame College"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-sky-200 transition-all"
              />
            </div>

            {/* HSC Batch */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                HSC Batch
              </label>
              <input
                type="text"
                value={hscBatch}
                onChange={(e) => setHscBatch(e.target.value)}
                placeholder="e.g. HSC 2026"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-sky-200 transition-all"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Tuitioned Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics & Higher Math"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-sky-200 transition-all"
              />
            </div>

            {/* Group */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Academic Group / Stream
              </label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. Science"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-sky-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Address (Emerald & Rose Theme) */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/90 space-y-3">
          <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-600" />
            3. Contact Details & Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700">
                Student Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-emerald-200 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Mobile Phone
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-emerald-200 transition-all"
              />
            </div>

            {/* Guardians Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Guardian's Phone
              </label>
              <input
                type="text"
                value={guardiansPhone}
                onChange={(e) => setGuardiansPhone(e.target.value)}
                placeholder="e.g. 01812345678"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-emerald-200 transition-all"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700">
                Home Residence Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-emerald-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-indigo-200 cursor-pointer text-center"
          >
            {student ? 'Save Profile' : 'Register Student'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
