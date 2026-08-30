'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, 
  Banknote, Database, RefreshCw, LogOut, Menu, X, ShieldCheck,
  Sparkles, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import SignupNotificationPanel from '../SignupNotificationPanel';

export default function AdminHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const navItems = [
    { 
      label: 'Overview', 
      href: '/', 
      icon: LayoutDashboard,
      desc: 'Metrics & System Summary',
      bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white border-emerald-400/40 shadow-md shadow-emerald-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      label: 'Students', 
      href: '/students', 
      icon: Users,
      desc: 'Profiles & Batch Records',
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 text-white border-teal-400/40 shadow-md shadow-teal-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      label: 'Daily Log', 
      href: '/tracking', 
      icon: BookOpen,
      desc: 'Lessons & Attendance',
      bgClass: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white border-emerald-400/40 shadow-md shadow-emerald-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      label: 'Exams', 
      href: '/exams', 
      icon: ClipboardList,
      desc: 'Test Scores & Marks',
      bgClass: 'bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white border-teal-400/40 shadow-md shadow-teal-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      label: 'Payments', 
      href: '/payments', 
      icon: Banknote,
      desc: 'Tuition Fees & Receipts',
      bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white border-emerald-400/40 shadow-md shadow-emerald-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      label: 'Approvals', 
      href: '/approvals', 
      icon: ShieldCheck,
      desc: 'Pending Signups & Requests',
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-800 text-white border-teal-400/40 shadow-md shadow-teal-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      label: 'Backup', 
      href: '/backup', 
      icon: Database,
      desc: 'Export & System Restore',
      bgClass: 'bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 text-white border-emerald-400/40 shadow-md shadow-emerald-500/20 animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/80 hover:bg-emerald-800/90 text-emerald-100 border-emerald-700/80 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
  ];

  return (
    <header className="bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-800/90 sticky top-0 z-[100] shrink-0 shadow-xl relative" id="admin-dashboard-header">
      {/* Top Gradient Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-300 via-emerald-500 to-teal-400" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group shrink-0" 
          title="TutorHQ Admin Control Desk"
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
                Admin Suite
              </span>
            </div>
            <p className="text-[10px] text-teal-300/80 font-bold tracking-wide uppercase font-mono hidden min-[480px]:block">Management Control Desk</p>
          </div>
        </Link>

        {/* Desktop Admin Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-emerald-900/80 p-1.5 rounded-2xl border border-emerald-800/80 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/40 font-extrabold'
                    : 'text-emerald-200/90 hover:text-white hover:bg-emerald-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Refresh Page Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800/90 rounded-2xl border border-emerald-700/80 transition-all disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`} />
          </motion.button>

          {/* Pending Signup Approvals Bell Panel */}
          {mounted && <SignupNotificationPanel />}

          {/* Sign Out Button */}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="hidden sm:flex px-3.5 py-2 bg-gradient-to-r from-rose-900/80 via-rose-800/90 to-pink-900/80 hover:from-rose-800 hover:to-pink-800 text-rose-200 border border-rose-700/80 rounded-2xl text-xs font-extrabold transition-all items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Sign Out Admin Account"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </motion.button>
          )}

          {/* Mobile Navigation Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-emerald-200 bg-emerald-900/90 hover:bg-emerald-800/90 rounded-2xl border border-emerald-700/80 transition-all cursor-pointer shadow-2xs"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-300" /> : <Menu className="w-5 h-5 text-emerald-200" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden max-h-[80vh] overflow-y-auto bg-emerald-950/98 backdrop-blur-2xl border-b border-emerald-800/90 shadow-2xl relative z-50 text-white"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
              {/* Admin Identity Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 border border-emerald-600/40 rounded-3xl text-white shadow-md shadow-emerald-500/20 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xs">
                    <ShieldCheck className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Administrator Control Suite
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-emerald-200 font-medium">Full System Administrative Permissions</p>
                  </div>
                </div>
              </div>

              {/* Element-wise Colorful Nav Grid */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-black text-emerald-300/80 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Admin Navigation Modules
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 border group cursor-pointer ${
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
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Action Controls */}
              <div className="pt-2 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleRefresh();
                  }}
                  className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Management Data</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-rose-700 to-pink-800 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Admin Account</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

