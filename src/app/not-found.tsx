import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-4 border border-indigo-100 shadow-sm">
        <GraduationCap className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Page Not Found</h2>
      <p className="text-slate-500 text-sm max-w-md mb-6">
        The page or resource you are looking for does not exist in TutorHQ.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-indigo-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Link>
    </div>
  );
}
