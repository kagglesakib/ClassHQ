'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, RefreshCw, Clock, User, LogOut, Menu, X, ShieldCheck,
  BookOpen, ClipboardList, Banknote, Lock, ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function StudentHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'lessons' | 'exams' | 'payments' | 'password'>('dossier');
  const [counts, setCounts] = useState<{ lessons?: number; exams?: number; payments?: number }>({});
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab && ['dossier', 'lessons', 'exams', 'payments', 'password'].includes(urlTab)) {
        setActiveTab(urlTab as any);
      }

      const handleTabChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && ['dossier', 'lessons', 'exams', 'payments', 'password'].includes(customEvent.detail)) {
          setActiveTab(customEvent.detail);
        }
      };

      const handleCountsChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
          setCounts(customEvent.detail);
        }
      };

      window.addEventListener('student-tab-change', handleTabChange);
      window.addEventListener('student-data-counts', handleCountsChange);

      return () => {
        window.removeEventListener('student-tab-change', handleTabChange);
        window.removeEventListener('student-data-counts', handleCountsChange);
      };
    }
  }, []);

  useEffect(() => {
    if (user?.sid) {
      Promise.all([
        fetch('/api/activities').then((r) => r.json()).catch(() => []),
        fetch('/api/exams').then((r) => r.json()).catch(() => []),
        fetch('/api/payments').then((r) => r.json()).catch(() => []),
      ]).then(([acts, exms, pymts]) => {
        const actCount = Array.isArray(acts) ? acts.filter((a: any) => a.studentSid === user.sid).length : 0;
        const exmCount = Array.isArray(exms) ? exms.filter((e: any) => e.studentSid === user.sid).length : 0;
        const pymtCount = Array.isArray(pymts) ? pymts.filter((p: any) => p.studentSid === user.sid).length : 0;
        setCounts({ lessons: actCount, exams: exmCount, payments: pymtCount });
      }).catch(() => {});
    }
  }, [user?.sid]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleNavigate = (tab: 'dossier' | 'lessons' | 'exams' | 'payments' | 'password') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-tab-change', { detail: tab }));
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return 'Expired';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const navItems = [
    { 
      id: 'dossier', 
      label: 'My Dossier', 
      desc: 'Personal Profile & Guardian info', 
      icon: User,
      bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white border-emerald-400/50 shadow-md shadow-emerald-500/30 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'lessons', 
      label: 'Daily Lessons', 
      desc: 'Study logs & daily attendance', 
      icon: BookOpen,
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 text-white border-teal-400/50 shadow-md shadow-teal-500/30 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      id: 'exams', 
      label: 'Exams & Marks', 
      desc: 'Transcripts, scores & grades', 
      icon: ClipboardList,
      bgClass: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white border-emerald-400/50 shadow-md shadow-emerald-500/30 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'payments', 
      label: 'Payments & Fees', 
      desc: 'Tuition fees & receipt history', 
      icon: Banknote,
      bgClass: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-white border-emerald-300/50 shadow-md shadow-emerald-500/30 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'password', 
      label: 'Change Password', 
      desc: 'Account security & credentials', 
      icon: Lock,
      bgClass: 'bg-gradient-to-br from-teal-700 via-emerald-800 to-teal-900 text-white border-teal-400/50 shadow-md shadow-teal-500/30 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
  ];

  return (
    <header className="bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-800/90 sticky top-0 z-[100] shrink-0 shadow-xl relative" id="student-portal-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group shrink-0" 
          title="TutorHQ Student Portal"
        >
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/30 border border-emerald-400/40 group-hover:scale-105 transition-all duration-300 animate-glow-emerald">
            <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-display font-black text-white tracking-tight flex items-center gap-1">
                Tutor<span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">HQ</span>
              </h1>
              <span className="hidden min-[380px]:inline-flex text-[10px] bg-emerald-900/90 border border-emerald-700/80 text-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full items-center gap-1 shadow-2xs font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Student Portal
              </span>
            </div>
            <p className="text-[10px] text-teal-300/80 font-bold tracking-wide uppercase font-mono hidden min-[480px]:block">Academic Ledger</p>
          </div>
        </Link>

        {/* Center Student ID Badge */}
        {user?.sid && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-900/90 border border-emerald-700/80 rounded-2xl text-xs font-black text-emerald-100 shadow-xs animate-glow-emerald">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SID: <strong className="font-mono text-teal-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/80">{user.sid}</strong></span>
          </div>
        )}

        {/* Right Side Header Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Refresh Page Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800/90 rounded-2xl border border-emerald-700/80 transition-all disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
            title="Refresh portal data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`} />
          </motion.button>

          {/* Student Name */}
          {mounted && user && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/90 text-emerald-100 rounded-2xl border border-emerald-700/80 text-xs font-bold shrink-0">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[120px]">{user.name || 'Student'}</span>
            </div>
          )}

          {/* Sign Out Button */}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="hidden sm:flex px-3.5 py-2 bg-gradient-to-r from-rose-900/80 via-rose-800/90 to-pink-900/80 hover:from-rose-800 hover:to-pink-800 text-rose-200 border border-rose-700/80 rounded-2xl text-xs font-extrabold transition-all items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Sign Out of Student Account"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </motion.button>
          )}

          {/* 3-Line Menu Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-emerald-200 bg-emerald-900/90 hover:bg-emerald-800/90 rounded-2xl border border-emerald-700/80 transition-all cursor-pointer shadow-2xs"
            aria-label="Toggle Navigation Menu"
            title="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-300" /> : <Menu className="w-5 h-5 text-emerald-200" />}
          </motion.button>
        </div>
      </div>

      {/* Connected 2nd Green Sub-Navbar for Desktop & Tablet */}
      <div className="hidden sm:block border-t border-emerald-800/80 bg-emerald-950/95 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="grid grid-cols-5 gap-2 w-full items-center justify-between">
            <button
              onClick={() => handleNavigate('dossier')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 truncate ${
                activeTab === 'dossier'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/50 animate-glow-emerald'
                  : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white border border-emerald-700/60'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">My Dossier</span>
            </button>

            <button
              onClick={() => handleNavigate('lessons')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 truncate ${
                activeTab === 'lessons'
                  ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 text-white shadow-md shadow-teal-500/30 border border-teal-400/50 animate-glow-emerald'
                  : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white border border-emerald-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Lessons {counts.lessons !== undefined ? `(${counts.lessons})` : ''}</span>
            </button>

            <button
              onClick={() => handleNavigate('exams')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 truncate ${
                activeTab === 'exams'
                  ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/50 animate-glow-emerald'
                  : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white border border-emerald-700/60'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="truncate">Exams {counts.exams !== undefined ? `(${counts.exams})` : ''}</span>
            </button>

            <button
              onClick={() => handleNavigate('payments')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 truncate ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-300/50 animate-glow-emerald'
                  : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white border border-emerald-700/60'
              }`}
            >
              <Banknote className="w-4 h-4 shrink-0" />
              <span className="truncate">Payments {counts.payments !== undefined ? `(${counts.payments})` : ''}</span>
            </button>

            <button
              onClick={() => handleNavigate('password')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 truncate ${
                activeTab === 'password'
                  ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-600/40 border border-rose-400/50'
                  : 'bg-slate-900/80 text-rose-200 hover:bg-rose-950/70 hover:text-white border border-rose-500/30'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 text-rose-300" />
              <span className="truncate">Security Passcode</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-[80vh] overflow-y-auto bg-emerald-950/98 backdrop-blur-2xl border-b border-emerald-800/90 shadow-2xl relative z-50"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
              {/* User Identity Header Card */}
              {user && (
                <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 border border-emerald-700/80 rounded-3xl text-white shadow-md shadow-emerald-500/20 animate-glow-emerald flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 text-emerald-950 flex items-center justify-center font-black text-lg shadow-md shadow-teal-400/30 border border-white/40">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white flex items-center gap-2">
                        {user.name}
                        <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          Active Student
                        </span>
                      </p>
                      <p className="text-xs text-emerald-200 font-mono font-bold mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        SID: <strong className="text-teal-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">{user.sid}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Portal Navigation Options */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-black text-emerald-300 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Student Portal Navigation
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id as any)}
                        className={`w-full min-h-[54px] p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border group ${
                          isActive
                            ? item.bgClass
                            : item.inactiveClass
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                            isActive ? item.iconBgActive : item.iconBgInactive
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black leading-tight flex items-center gap-1">
                              {item.label}
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              )}
                            </p>
                            <p className={`text-[10px] font-medium leading-tight mt-0.5 ${
                              isActive ? 'text-white/80' : 'text-emerald-300/80'
                            }`}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                          isActive ? 'text-white' : 'text-emerald-400'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleRefresh();
                  }}
                  className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20 animate-glow-emerald"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Portal Ledger Data</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-rose-700 via-rose-800 to-pink-700 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

