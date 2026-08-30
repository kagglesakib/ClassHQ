'use client';

import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, AlertCircle, UserCheck, Lock,
  EyeOff, Eye, Loader2, ArrowRight, UserPlus, ShieldCheck, User,
  LogOut, Eraser, Clock, RefreshCw, BookOpen, Award, Sparkles, Phone, Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup States
  const [signupData, setSignupData] = useState({
    name: '',
    college: '',
    hscBatch: '',
    subject: '',
    group: '',
    mobile: '',
    guardiansPhone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const scrollToFormSection = () => {
    const el = document.getElementById('auth-form-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
    setTimeout(() => {
      scrollToFormSection();
    }, 50);
  };

  const handleClearFields = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupData({
      name: '',
      college: '',
      hscBatch: '',
      subject: '',
      group: '',
      mobile: '',
      guardiansPhone: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your Student ID (SID) or Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const cleanErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return 'An unexpected error occurred.';
    const lower = msg.toLowerCase();
    if (
      lower.includes('unexpected token') ||
      lower.includes('is not valid json') ||
      lower.includes('<html>') ||
      lower.includes('<!doctype') ||
      lower.includes('syntaxerror') ||
      lower.includes('failed to parse')
    ) {
      return 'Unable to process request due to a temporary server issue. Please try again later.';
    }
    return msg;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signupData.name || !signupData.mobile || !signupData.email || !signupData.password) {
      setError('Full Name, Mobile Number, Email Address, and Password are required.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        setIsSubmitting(false);
        setError('Server temporarily unavailable or returning invalid response. Please try again later.');
        return;
      }

      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(cleanErrorMessage(data.error || 'Registration failed. Please check your information and try again.'));
        return;
      }

      setSuccessMsg(`Account created for ${signupData.name}! Your student registration is pending admin approval.`);
      setLoginIdentifier(signupData.email);
      setLoginPassword(signupData.password);
      setAuthMode('login');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(cleanErrorMessage(err?.message || 'Signup request failed. Please try again later.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/50 flex flex-col justify-between -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 font-sans">
      
      {/* ========================================================= */}
      {/* TOP FIXED NAVBAR WITH GREEN AESTHETIC THEME */}
      {/* ========================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/80 shadow-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Logo & Portal Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-display text-white tracking-tight">
                Tutor<span className="text-emerald-400">HQ</span>
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Academic Ledger
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-medium hidden md:block">
              Student Progress & Academic Management Portal
            </p>
          </div>
        </div>

        {/* Navigation Options: Login / Sign Up */}
        <div className="flex items-center gap-2">
          <div className="bg-emerald-900/80 p-1 rounded-2xl border border-emerald-700/80 flex items-center gap-1">
            <button
              type="button"
              data-auth-mode="login"
              onClick={() => handleSelectAuthMode('login')}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm font-bold'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              data-auth-mode="signup"
              onClick={() => handleSelectAuthMode('signup')}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-sm font-bold'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-grow pt-24 sm:pt-28 pb-12 px-4 sm:px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT DECORATIVE SIDEBAR (EMERALD GREEN AESTHETIC) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-emerald-800/60 relative overflow-hidden min-h-[380px]"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/60 backdrop-blur-md rounded-full border border-emerald-600/40 text-xs text-emerald-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Green Aesthetic Student Portal</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-white leading-tight">
                  TutorHQ Student & Admin Portal
                </h2>
                <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">
                  Comprehensive portal for exam results, homework logs, attendance, and account verification.
                </p>
              </div>

              {/* Feature Highlights with Element-Wise Background Boxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-600/30 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-emerald-500/25 text-emerald-300 shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-100">Academic Analytics</h4>
                    <p className="text-[11px] text-emerald-300/80">Track exam marks, rank, and subject performance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-900/40 border border-teal-600/30 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-teal-500/25 text-teal-300 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-teal-100">Daily Learning Logs</h4>
                    <p className="text-[11px] text-teal-300/80">Detailed records of everyday topic coverage and homework.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-800/60 relative z-10 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted Authorization</span>
              </span>
            </div>
          </motion.div>

          {/* RIGHT FORM CONTAINER (RICH GREEN AESTHETIC WITH ELEMENT-WISE BACKGROUNDS) */}
          <motion.div
            id="auth-form-card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-3xl p-6 sm:p-8 border border-emerald-300/80 shadow-2xl flex flex-col justify-between backdrop-blur-sm scroll-mt-28"
          >
            <div className="space-y-5">
              
              {/* Form Header Box */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-display text-emerald-950 flex items-center gap-2">
                    {authMode === 'login' ? 'Portal Sign In' : 'Student Registration'}
                  </h3>
                  <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                    {authMode === 'login'
                      ? 'Please enter your account details to access your dashboard.'
                      : 'Fill in your academic information to register a new student profile.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearFields}
                  className="px-3 py-1.5 bg-emerald-200/70 hover:bg-emerald-300/80 text-emerald-950 border border-emerald-400/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  title="Clear all form fields"
                >
                  <Eraser className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="hidden sm:inline">Clear Inputs</span>
                </button>
              </div>

              {/* Error / Pending Alert Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 shadow-2xs border ${
                    error.toLowerCase().includes('pending')
                      ? 'bg-amber-100/95 border-amber-300/90 text-amber-950'
                      : 'bg-rose-100/90 border-rose-300 text-rose-950'
                  }`}
                >
                  {error.toLowerCase().includes('pending') ? (
                    <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">
                    {cleanErrorMessage(error)}
                  </div>
                </motion.div>
              )}

              {/* Success Alert Box */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-200/80 border border-emerald-400 text-emerald-950 p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="flex-1">{successMsg}</div>
                </motion.div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                  
                  {/* Element Box 1: Identifier */}
                  <div className="space-y-1.5 bg-emerald-100/70 p-3.5 rounded-2xl border border-emerald-300/80">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Student ID (SID) or Email</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. S101 or ADMIN or email@example.com"
                      className="w-full px-4 py-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 placeholder:text-emerald-700/50 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none shadow-2xs"
                    />
                  </div>

                  {/* Element Box 2: Password */}
                  <div className="space-y-1.5 bg-emerald-100/70 p-3.5 rounded-2xl border border-emerald-300/80">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Password</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-11 py-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 placeholder:text-emerald-700/50 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-emerald-700 hover:text-emerald-900 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:from-emerald-800 active:to-teal-900 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In To Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs text-emerald-950 font-medium pt-1">
                      <span>Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAuthMode('signup')}
                        className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                      >
                        Sign Up Here &rarr;
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM WITH MAXIMUM ELEMENT-WISE BACKGROUND COLORING */
                <form onSubmit={handleSignupSubmit} className="space-y-4 pt-1 max-h-[55vh] overflow-y-auto pr-1">
                  
                  {/* Section 1: Personal Info Card */}
                  <div className="space-y-3 bg-emerald-100/70 p-3.5 rounded-2xl border border-emerald-300/80">
                    <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider block bg-emerald-200 px-2.5 py-1 rounded-lg w-fit border border-emerald-300">
                      1. Personal Information
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-emerald-950">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Section 2: Academic Details Card */}
                  <div className="space-y-3 bg-teal-100/70 p-3.5 rounded-2xl border border-teal-300/80">
                    <span className="text-[11px] font-extrabold text-teal-950 uppercase tracking-wider block bg-teal-200 px-2.5 py-1 rounded-lg w-fit border border-teal-300">
                      2. Academic Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">College / Institute</label>
                        <input
                          type="text"
                          value={signupData.college}
                          onChange={(e) => setSignupData({ ...signupData, college: e.target.value })}
                          placeholder="e.g. Notre Dame College"
                          className="w-full px-3.5 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">HSC Batch Year</label>
                        <input
                          type="text"
                          value={signupData.hscBatch}
                          onChange={(e) => setSignupData({ ...signupData, hscBatch: e.target.value })}
                          placeholder="e.g. 2026"
                          className="w-full px-3.5 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">Subject Focus</label>
                        <input
                          type="text"
                          value={signupData.subject}
                          onChange={(e) => setSignupData({ ...signupData, subject: e.target.value })}
                          placeholder="e.g. Physics & Higher Math"
                          className="w-full px-3.5 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">Group / Track</label>
                        <input
                          type="text"
                          value={signupData.group}
                          onChange={(e) => setSignupData({ ...signupData, group: e.target.value })}
                          placeholder="e.g. Science"
                          className="w-full px-3.5 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Contact Info Card */}
                  <div className="space-y-3 bg-emerald-100/70 p-3.5 rounded-2xl border border-emerald-300/80">
                    <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider block bg-emerald-200 px-2.5 py-1 rounded-lg w-fit border border-emerald-300">
                      3. Contact Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-950">Student Mobile *</label>
                        <input
                          type="text"
                          required
                          value={signupData.mobile}
                          onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
                          placeholder="01712345678"
                          className="w-full px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-950">Guardian Mobile</label>
                        <input
                          type="text"
                          value={signupData.guardiansPhone}
                          onChange={(e) => setSignupData({ ...signupData, guardiansPhone: e.target.value })}
                          placeholder="01812345678"
                          className="w-full px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-emerald-950">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        placeholder="student@example.com"
                        className="w-full px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 focus:bg-emerald-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Section 4: Password Security Card */}
                  <div className="space-y-3 bg-teal-100/70 p-3.5 rounded-2xl border border-teal-300/80">
                    <span className="text-[11px] font-extrabold text-teal-950 uppercase tracking-wider block bg-teal-200 px-2.5 py-1 rounded-lg w-fit border border-teal-300">
                      4. Security & Access
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">Password *</label>
                        <div className="relative flex items-center">
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            required
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-9 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-2 text-teal-800 hover:text-teal-950 p-1"
                          >
                            {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-teal-950">Confirm Password *</label>
                        <div className="relative flex items-center">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-9 py-2.5 bg-teal-50/90 border border-teal-300 rounded-xl text-xs font-semibold text-teal-950 focus:bg-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 text-teal-800 hover:text-teal-950 p-1"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Registration...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Submit Registration</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs text-emerald-950 font-medium">
                      <span>Already registered?</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAuthMode('login')}
                        className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                      >
                        Login Here &rarr;
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-6 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-900/90 font-medium">
              <span>Academic Management Portal</span>
              <span className="flex items-center gap-1 text-emerald-950 font-semibold px-2.5 py-1 rounded-full bg-emerald-200/80 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Protected Portal</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function PendingApprovalCard({ user }: { user: any }) {
  const { checkSession, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-3xl p-8 shadow-2xl border border-emerald-300/80 text-center space-y-6 relative overflow-hidden backdrop-blur-sm"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-xs">
          <Clock className="w-8 h-8 animate-pulse text-emerald-700" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-200/90 text-emerald-950 text-[11px] font-bold uppercase tracking-wider rounded-full border border-emerald-300">
            Status: Pending Approval
          </span>
          <h2 className="text-2xl font-bold font-display text-emerald-950">Registration Under Review</h2>
          <p className="text-xs text-emerald-900/80 font-medium leading-relaxed">
            Welcome, <span className="font-bold text-emerald-950">{user?.name}</span>! Your student registration has been submitted successfully and is currently awaiting admin verification and Student ID (SID) assignment.
          </p>
        </div>

        <div className="bg-emerald-100/80 p-4 rounded-2xl border border-emerald-300/80 text-left space-y-2 text-xs">
          <div className="text-emerald-950 font-bold uppercase tracking-wider text-[10px]">
            Account Details:
          </div>
          <div className="text-emerald-950 font-semibold">Email: <span className="text-emerald-800 font-bold">{user?.email}</span></div>
          <div className="text-emerald-950 font-semibold">SID Status: <span className="text-amber-800 font-bold">Pending Admin Review</span></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await checkSession();
              setIsRefreshing(false);
            }}
            className="w-full sm:w-auto flex-1 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full sm:w-auto px-4 py-3 bg-emerald-200/80 hover:bg-emerald-300/90 text-emerald-950 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
