import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  ClipboardCheck, 
  Users, 
  FileText,
  UserCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface CaptainNavbarProps {
  assignedBatch?: string;
  assignedSection?: string;
  todayMarked?: boolean;
}

export const CaptainNavbar: React.FC<CaptainNavbarProps> = ({
  assignedBatch,
  assignedSection,
  todayMarked,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentBatch = assignedBatch || user?.assignedBatch || user?.batch || 'HSC 2026';
  const currentSection = assignedSection || user?.assignedSection || user?.section || 'A';

  const navItems = [
    { path: '/captain', label: 'Roll-Call Ledger', shortLabel: 'Roll-Call', icon: ClipboardCheck, exact: true },
    { path: '/captain/roster', label: 'Class Students & Approvals', shortLabel: 'Roster', icon: Users },
    { path: '/captain/leaves', label: 'Section Leaves', shortLabel: 'Leaves', icon: FileText },
    { path: '/captain/profile', label: 'My Profile & Log', shortLabel: 'Profile', icon: UserCheck },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path || location.pathname === '/captain/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Captain Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">ClassHQ</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                  Captain HQ
                </span>
                <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Sec {currentSection} ({currentBatch})
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
                Captain {user?.fullName || 'User'} • Roll: <span className="font-mono text-sky-700 font-bold">{user?.rollNumber || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-sky-50/80 p-1.5 rounded-2xl border border-sky-200/80">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Pill, Logout & 3-Line Hamburger */}
          <div className="flex items-center gap-2">
            {/* Status Pill */}
            <div className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border shadow-2xs ${
              todayMarked 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span>{todayMarked ? '✓ Today Certified' : '⚡ Roll-Call Pending'}</span>
            </div>

            {/* Logout Button */}
            <button
              id="btn-captain-logout"
              type="button"
              onClick={logout}
              className="hidden sm:flex p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* 3-Line Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Slide-out on 3-line button click) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t-2 border-sky-100 bg-white/95 rounded-b-3xl shadow-lg space-y-2 animate-in slide-in-from-top-2 duration-200">
            {/* Status Notice for Mobile */}
            <div className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between ${
              todayMarked 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Today's Attendance Status:</span>
              </span>
              <span className="font-black">{todayMarked ? '✓ Certified' : '⚡ Pending'}</span>
            </div>

            {/* Nav Links List */}
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black tracking-wide transition-all ${
                      active
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-700 bg-sky-50/50 hover:bg-sky-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Logout */}
            <div className="pt-2 border-t border-sky-100 flex items-center justify-stretch">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 rounded-2xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
