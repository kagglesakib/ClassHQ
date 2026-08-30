'use client';

import React from 'react';
import { 
  Mail, 
  MessageSquare, 
  Linkedin, 
  Facebook, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-auto pt-10 pb-24 sm:pb-20 pb-[calc(5rem+env(safe-area-inset-bottom))] font-sans relative z-10 overflow-hidden">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Brand & Purpose Box (Columns 1-5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900/90 to-indigo-950/80 p-6 rounded-3xl border border-indigo-900/50 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display text-white tracking-tight">
                  Academic Portal
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Official Ledger
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Academic student tracking ledger, daily learning logs, exam result analytics, and verified payment management portal.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protected Academic Information System</span>
            </div>
          </div>

          {/* Direct Contact & Support (Columns 6-8) */}
          <div className="md:col-span-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct Contact & Support</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* WhatsApp Card */}
              <a
                href="https://wa.me/8801516518418"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/70 text-emerald-200 transition-all group shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">WhatsApp Contact</span>
                  <span className="font-bold text-emerald-100 text-sm">01516518418</span>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:sakibhasan.office@gmail.com"
                className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-900/70 text-indigo-200 transition-all group shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider">Official Email</span>
                  <span className="font-bold text-indigo-100 text-xs truncate">sakibhasan.office@gmail.com</span>
                </div>
              </a>
            </div>
          </div>

          {/* Social Profiles (Columns 9-12) */}
          <div className="md:col-span-3 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Social Connect
            </h4>

            <div className="space-y-3 text-xs">
              {/* Facebook Card */}
              <a
                href="https://www.facebook.com/Sakib.2004043/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-sky-950/60 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-900/70 text-sky-200 transition-all font-semibold shadow-sm"
              >
                <div className="p-2 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20 shrink-0">
                  <Facebook className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Facebook</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-sky-400" />
              </a>

              {/* LinkedIn Card */}
              <a
                href="https://www.linkedin.com/in/sakibul-hasan-ab9526318"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/70 text-blue-200 transition-all font-semibold shadow-sm"
              >
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 shrink-0">
                  <Linkedin className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-blue-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <p>© {currentYear} Academic Management Portal. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-300 font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built for Academic Excellence</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
