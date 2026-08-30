import React, { useState, useMemo } from 'react';
import { Student, Payment } from '../types';
import { formatPid } from '../utils/id';
import { 
  Banknote, Calendar, Users, TrendingUp, DollarSign, Search, 
  ArrowUpDown, Filter, Landmark, Receipt, FileText, CheckCircle2, Sparkles,
  Edit3, Trash2
} from 'lucide-react';
import { formatBatch } from '../utils/formatBatch';
import { EditPaymentModal, DeleteConfirmModal } from './modals/EditDeleteModals';
import { useAuth } from '../context/AuthContext';

interface GlobalPaymentListProps {
  payments: Payment[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onUpdatePayment?: (updated: Payment) => Promise<void> | void;
  onDeletePayment?: (pid: string) => Promise<void> | void;
}

export default function GlobalPaymentList({
  payments,
  students,
  onSelectStudent,
  onUpdatePayment,
  onDeletePayment,
}: GlobalPaymentListProps) {
  const { user } = useAuth();
  const isStudentUser = user?.userType === 'student';

  // Modal State
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentSid, setSelectedStudentSid] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Helper mapping: SID -> Student Object
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.sid, s));
    return map;
  }, [students]);

  // Unique list of billing months (Y-M format)
  const billingMonths = useMemo(() => {
    const months = payments.map(p => p.paymentMonth);
    return Array.from(new Set(months)).sort().reverse();
  }, [payments]);

  // Toggle sorting helper
  const handleSort = (field: 'date' | 'name' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filtered and sorted payments list
  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        const student = studentMap.get(p.studentSid);
        const name = student ? student.name.toLowerCase() : '';
        const sid = p.studentSid.toLowerCase();
        const comment = (p.comment || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = 
          name.includes(search) || 
          sid.includes(search) || 
          comment.includes(search) || 
          p.date.includes(search) ||
          p.paymentMonth.includes(search);

        const matchesStudent = selectedStudentSid === 'ALL' || p.studentSid === selectedStudentSid;
        const matchesMonth = selectedMonth === 'ALL' || p.paymentMonth === selectedMonth;

        return matchesSearch && matchesStudent && matchesMonth;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'name') {
          const nameA = studentMap.get(a.studentSid)?.name || '';
          const nameB = studentMap.get(b.studentSid)?.name || '';
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === 'amount') {
          comparison = a.amount - b.amount;
        }

        if (comparison === 0) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [payments, studentMap, searchTerm, selectedStudentSid, selectedMonth, sortBy, sortOrder]);

  // Compute aggregate billing stats
  const stats = useMemo(() => {
    const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const count = filteredPayments.length;
    const averagePayment = count > 0 ? Math.round(totalCollected / count) : 0;

    return {
      totalCollected,
      count,
      averagePayment
    };
  }, [filteredPayments]);

  // Formatter for month name string (e.g., "2026-07" -> "July 2026")
  const formatMonthName = (monthStr: string) => {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleSaveEdit = async (updatedPayment: Payment) => {
    if (onUpdatePayment) {
      await onUpdatePayment(updatedPayment);
    } else {
      const res = await fetch(`/api/payments/${updatedPayment.pid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayment),
      });
      if (!res.ok) throw new Error('Failed to update payment transaction');
    }
    setEditingPayment(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    if (onDeletePayment) {
      await onDeletePayment(deletingPayment.pid);
    } else {
      const res = await fetch(`/api/payments/${deletingPayment.pid}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete payment transaction');
    }
    setDeletingPayment(null);
  };

  return (
    <div className="space-y-6" id="global-payments-dashboard">
      {/* Stats Widget Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-3xl border border-emerald-500/40 shadow-md shadow-emerald-500/20 flex items-start justify-between animate-glow-emerald">
          <div>
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-extrabold block font-mono">Total Tuition Collected</span>
            <h3 className="text-2xl font-display font-black text-emerald-400 mt-1">৳ {stats.totalCollected.toLocaleString()} BDT</h3>
            <p className="text-[10px] text-emerald-200/80 mt-1 font-mono">Sum of filtered collections</p>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-indigo-50 text-slate-900 p-5 rounded-3xl border border-indigo-200/90 shadow-xs flex items-start justify-between animate-glow-indigo">
          <div>
            <span className="text-[10px] text-indigo-900 uppercase tracking-wider font-extrabold block font-mono">Transaction Count</span>
            <h3 className="text-2xl font-display font-black text-indigo-950 mt-1">{stats.count} Receipts</h3>
            <p className="text-[10px] text-indigo-800 mt-1 font-mono">Logged tuition payments</p>
          </div>
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 shadow-2xs">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50/90 via-teal-50/60 to-emerald-50 text-slate-900 p-5 rounded-3xl border border-cyan-200/90 shadow-xs flex items-start justify-between animate-glow-emerald">
          <div>
            <span className="text-[10px] text-teal-900 uppercase tracking-wider font-extrabold block font-mono">Average Paid Fees</span>
            <h3 className="text-2xl font-display font-black text-teal-950 mt-1">৳ {stats.averagePayment.toLocaleString()} BDT</h3>
            <p className="text-[10px] text-teal-800 mt-1 font-mono">Mean amount per transaction</p>
          </div>
          <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl border border-teal-200 shadow-2xs">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Element-Wise Filter Toolbar */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Element-wise Text Search input */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50 border border-indigo-200/90 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-2xs ml-0.5 mr-2">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments, dates, or months..."
              className="w-full py-1 pr-8 bg-transparent text-xs font-extrabold text-slate-800 placeholder:text-indigo-900/40 focus:outline-hidden"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Element-wise Student Filter dropdown (Sky Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-sky-50 via-blue-50/60 to-sky-50 border border-sky-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-sky-400/30 transition-all">
            <div className="p-1.5 bg-sky-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Users className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedStudentSid}
              onChange={(e) => setSelectedStudentSid(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-sky-950 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Students</option>
              {students.map((s, idx) => (
                <option key={s.sid ? `${s.sid}-${idx}` : `s-${idx}`} value={s.sid}>{s.name} ({s.sid})</option>
              ))}
            </select>
          </div>

          {/* Element-wise Payment Month Filter dropdown (Emerald Theme) */}
          <div className="relative flex items-center bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-2xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
            <div className="p-1.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-2xs mr-2">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-emerald-950 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Billing Months</option>
              {billingMonths.map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <span className="text-xs font-bold text-slate-500 font-mono">
          Showing {filteredPayments.length} payment receipts
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1 font-mono">Sort by:</span>
          {(['date', 'name', 'amount'] as const).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                sortBy === field
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>
                {field === 'date' ? 'Receipt Date' : field === 'name' ? 'Student' : 'Amount BDT'}
              </span>
              {sortBy === field && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Payments Responsive Cards List */}
      <div className="space-y-4">
        {filteredPayments.length > 0 ? (
          <div className="space-y-4 flex flex-col">
            {filteredPayments.map((p, idx) => {
              const student = studentMap.get(p.studentSid);

              return (
                <div
                  key={p.pid ? `${p.pid}-${idx}` : `pay-${idx}`}
                  className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-300 transition-all relative group animate-fadeIn space-y-4"
                >
                  {/* Top Bar Header: PID, Student Link, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs">
                        {formatPid(p.pid)}
                      </span>

                      <button
                        onClick={() => onSelectStudent(p.studentSid)}
                        className="flex items-center gap-2 bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1 rounded-xl border border-indigo-200/80 text-left transition-all group/btn cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-950 group-hover/btn:text-indigo-600 transition-colors">
                          {student?.name || 'Unknown Student'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                          ID : {p.studentSid}
                        </span>
                      </button>

                      <span className="text-xs font-black text-slate-700 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200/80 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {p.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-2xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Paid Receipt
                      </span>

                      {/* Edit and Delete Buttons */}
                      {!isStudentUser && (
                        <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-2.5 ml-1">
                          <button
                            onClick={() => setEditingPayment(p)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200/80 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Edit Payment Transaction"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingPayment(p)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title="Delete Payment Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Payment Details & Amount Box (2 Columns Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Left Column: Billing Cycle & Student Info (col-span-7) */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                          <Receipt className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tuition Billing Month</span>
                      </div>

                      <h4 className="font-display font-black text-slate-900 text-base leading-snug break-words pl-0.5">
                        {formatMonthName(p.paymentMonth)}
                      </h4>

                      {/* Elementwise Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="bg-emerald-100/90 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-[11px] font-bold">
                          Cycle: {p.paymentMonth}
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px] font-bold">
                          {formatBatch(student?.hscBatch)}
                        </span>
                        {student?.subject && (
                          <span className="bg-violet-100 text-violet-900 px-2.5 py-1 rounded-lg border border-violet-200 font-bold text-[11px]">
                            {student.subject}
                          </span>
                        )}
                        {student?.college && (
                          <span className="bg-sky-100 text-sky-900 px-2.5 py-1 rounded-lg border border-sky-200 font-bold text-[11px]">
                            {student.college}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Dark Emerald Gradient Amount Box (col-span-5) */}
                    <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4.5 rounded-2xl border border-emerald-800/60 shadow-md text-white space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Tuition Fee Collected</span>
                        <Banknote className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div className="text-2xl font-black text-emerald-400 font-display tracking-tight">
                        ৳ {p.amount.toLocaleString()} <span className="text-xs text-slate-300 font-mono font-normal">BDT</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                          Verified Payment
                        </span>
                        <span className="text-slate-400 font-mono">
                          Ref: {formatPid(p.pid)}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Comment & Remarks Footer */}
                  {p.comment && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono shrink-0 border border-emerald-200">
                          Payment Remark
                        </span>
                        <p className="text-xs text-slate-800 font-semibold italic leading-relaxed">
                          "{p.comment}"
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <div className="p-4 bg-slate-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-700 font-extrabold">No payment receipts found matching criteria</p>
              <p className="text-xs text-slate-400">Try modifying your search or dropdown filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Payment Modal */}
      <EditPaymentModal
        isOpen={!!editingPayment}
        payment={editingPayment}
        students={students}
        onClose={() => setEditingPayment(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Payment Transaction"
        itemIdLabel={deletingPayment ? formatPid(deletingPayment.pid) : ''}
        details={
          deletingPayment
            ? [
                { label: 'Student', value: studentMap.get(deletingPayment.studentSid)?.name || deletingPayment.studentSid },
                { label: 'Date', value: deletingPayment.date },
                { label: 'Amount', value: `৳ ${deletingPayment.amount}` },
                { label: 'Month', value: deletingPayment.paymentMonth },
              ]
            : []
        }
      />
    </div>
  );
}
