import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Hash,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  School,
  UserCheck,
  RefreshCw,
  X,
  Mail,
  Users,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  BookOpen,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  BadgeCheck,
  Flame,
  HeartHandshake,
  Compass
} from 'lucide-react';
import { HSCBatch, Section, AcademicGroup, Gender } from '../../types';

export const AuthPage: React.FC<{ initialTab?: 'login' | 'register' }> = ({ initialTab = 'login' }) => {
  const { login, registerStudent, pendingNotice, clearPendingNotice, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  // Register form state
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    gender: 'Male' as Gender,
    batch: 'HSC 2026' as HSCBatch,
    group: 'Science' as AcademicGroup,
    section: 'A' as Section,
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const batches: HSCBatch[] = [
    'HSC 2024',
    'HSC 2025',
    'HSC 2026',
    'HSC 2027',
    'HSC 2028',
    'HSC 2029',
    'HSC 2030',
  ];
  const sections: Section[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const groups: AcademicGroup[] = ['Science', 'Arts', 'Commerce'];

  // Redirect if logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'captain') navigate('/captain');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);

    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter both your Roll Number/Email and password.');
      setLoginSubmitting(false);
      return;
    }

    const res = await login(loginIdentifier, loginPassword);
    setLoginSubmitting(false);
    if (!res.success) {
      if (res.isPending) {
        setLoginError(null);
      } else {
        setLoginError(res.error || 'Login failed. Please check credentials.');
      }
    }
  };

  const handleRecheckStatus = async () => {
    if (!loginIdentifier || !loginPassword) {
      setActiveTab('login');
      return;
    }
    setIsRechecking(true);
    await handleLogin();
    setIsRechecking(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    if (
      !formData.fullName ||
      !formData.rollNumber ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.password
    ) {
      setRegisterError('All fields are mandatory. Please fill in every detail.');
      return;
    }

    if (formData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterSubmitting(true);
    const res = await registerStudent({
      fullName: formData.fullName,
      rollNumber: formData.rollNumber,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
      batch: formData.batch,
      group: formData.group,
      section: formData.section,
      address: formData.address,
      password: formData.password,
    });

    setRegisterSubmitting(false);

    if (res.success) {
      setLoginIdentifier(formData.rollNumber || formData.email);
      setLoginPassword(formData.password);
      setActiveTab('login');
      setRegisterSuccess(
        'Registration submitted successfully! Your account is awaiting Class Captain or Dean verification.'
      );
      setFormData({
        fullName: '',
        rollNumber: '',
        email: '',
        phoneNumber: '',
        gender: 'Male',
        batch: 'HSC 2026',
        group: 'Science',
        section: 'A',
        address: '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setRegisterError(res.error || 'Failed to submit registration.');
    }
  };

  const handleQuickDemoFill = (role: 'admin' | 'captain' | 'student') => {
    setActiveTab('login');
    if (role === 'admin') {
      setLoginIdentifier('admin@classhq.edu');
      setLoginPassword('admin123');
    } else if (role === 'captain') {
      setLoginIdentifier('260101');
      setLoginPassword('captain123');
    } else {
      setLoginIdentifier('260102');
      setLoginPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-rose-50/90 text-slate-900 flex flex-col justify-center py-6 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative Floating Pastel Blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-72 sm:w-96 h-72 sm:h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-72 sm:w-96 h-72 sm:h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-64 sm:w-80 h-64 sm:h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl mx-auto relative z-10 space-y-4 sm:space-y-6">
        {/* Aesthetic Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 sm:p-3.5 rounded-3xl bg-white/90 shadow-md border border-indigo-100/90 text-indigo-600 gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <School className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl">✨ 🏫 ✨</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900">
              ClassHQ Portal 🎓
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-md mx-auto flex items-center justify-center gap-1.5 flex-wrap px-2">
              <span>Academic Attendance & Governance System</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-black border border-rose-200 shadow-2xs">
                ⚡ 2026 Edition
              </span>
            </p>
          </div>

          {/* Role Avatars Preview & Demo Login Bar */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-900/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tap to Quick-Fill Demo Credentials:</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('student')}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-100/90 hover:bg-indigo-200 border border-indigo-200 text-indigo-900 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Fill Student Credentials"
              >
                <span className="text-xs">👨‍🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('captain')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 border border-amber-200 text-amber-900 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Fill Captain Credentials"
              >
                <span className="text-xs">🎖️</span>
                <span>Captain</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-100/90 hover:bg-rose-200 border border-rose-200 text-rose-900 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Fill Admin Credentials"
              >
                <span className="text-xs">👑</span>
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pending Notice Callout if Any */}
        {pendingNotice && (
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-amber-50/95 border-2 border-amber-300 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                  ⏳ Approval In Progress
                </span>
              </div>
              <button
                type="button"
                onClick={clearPendingNotice}
                className="p-1 rounded-full text-amber-700 hover:text-amber-950 hover:bg-amber-200/70 transition-colors cursor-pointer"
                title="Dismiss Notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>📣 Student Account Awaiting Verification</span>
              </h3>
              <p className="text-xs font-semibold text-amber-800/90 mt-1 leading-relaxed">
                {pendingNotice.message ||
                  'Your student profile registration has been submitted and is currently awaiting verification by your assigned Class Captain or Academic Administrator.'}
              </p>
            </div>

            {pendingNotice.user && (
              <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-amber-200 text-xs text-amber-950 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                      {pendingNotice.user.fullName ? pendingNotice.user.fullName.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 flex items-center gap-1">
                        <span>{pendingNotice.user.fullName || 'Student'}</span>
                        <span>🎓</span>
                      </div>
                      {pendingNotice.user.email && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-600" />
                          <span>{pendingNotice.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-mono font-black text-xs border border-amber-200">
                      🏷️ Roll: {pendingNotice.user.rollNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 pt-0.5">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    Cohort Assignment:
                  </span>
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {pendingNotice.user.batch || 'Batch'} • Sec {pendingNotice.user.section || 'A'}
                  </span>
                </div>
              </div>
            )}

            {/* Helpful Guidance */}
            <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-950 space-y-1">
              <div className="flex items-start gap-2 font-medium">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Who approves this?</strong> Your section's <strong>🎖️ Class Captain</strong> or an <strong>👑 Administrator</strong> can verify your profile instantly.
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleRecheckStatus}
                disabled={isRechecking || loginSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRechecking || loginSubmitting ? 'animate-spin' : ''}`} />
                <span>{isRechecking || loginSubmitting ? 'Checking Status...' : '🔄 Re-check Approval Status'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Aesthetic Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden">
          {/* Aesthetic Segmented Tab Switcher with Background Colors */}
          <div className="grid grid-cols-2 p-1.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 border-b-2 border-indigo-100 gap-1.5">
            <button
              id="tab-btn-signin"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md scale-[1.01]'
                  : 'text-indigo-900 hover:bg-white/70 hover:text-indigo-950 font-bold'
              }`}
            >
              <span className="text-base">🔑</span>
              <span>Sign In to Portal</span>
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegisterError(null);
              }}
              className={`py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md scale-[1.01]'
                  : 'text-emerald-900 hover:bg-white/70 hover:text-emerald-950 font-bold'
              }`}
            >
              <span className="text-base">📝</span>
              <span>Student Onboarding</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'login' ? (
              <div className="space-y-6">
                {/* Login Header Tag */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <span>Welcome Back!</span>
                      <span>👋</span>
                    </h3>
                    <p className="text-[11px] font-semibold text-indigo-700">
                      Sign in with your Roll Number or Registered Email
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-shake">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Roll Number or Email Input with Pastel Styling */}
                  <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 transition-all focus-within:bg-indigo-50 focus-within:border-indigo-300">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 flex items-center gap-1.5">
                      <span className="text-xs">🔢</span>
                      <span>Roll Number or Institutional Email</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <input
                        id="input-login-identifier"
                        type="text"
                        placeholder="e.g. 260101 or student@college.edu"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        className="w-full pl-11 pr-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Password Input with Toggle */}
                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5 transition-all focus-within:bg-purple-50 focus-within:border-purple-300">
                    <label className="text-[10px] font-black uppercase tracking-widest text-purple-900 flex items-center gap-1.5">
                      <span className="text-xs">🔒</span>
                      <span>Account Password</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <input
                        id="input-login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Enter account password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full pl-11 pr-10 py-2.5 text-xs font-bold text-slate-900 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Vibrant Action Button */}
                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>{loginSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Student Registration Prompt Card */}
                <div className="pt-4 border-t border-indigo-100">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border border-amber-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <span>New Student?</span>
                          <span>🎓</span>
                        </h4>
                        <p className="text-[10px] font-bold text-slate-600">
                          Register your academic profile to request attendance access
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-switch-to-register"
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-white px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all shrink-0 shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>Register</span>
                      <span>✨</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Student Registration Form with Aesthetic Colors */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Header Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span>Student Profile Registration</span>
                      <span>🚀</span>
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      Fill in your exact institutional details for Captain approval
                    </p>
                  </div>
                </div>

                {registerError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-shake">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                {registerSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{registerSuccess}</span>
                  </div>
                )}

                {/* Name & Roll Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 flex items-center gap-1">
                      <span>👤</span>
                      <span>Full Legal Name:</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Shakib Al Hasan"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-purple-900 flex items-center gap-1">
                      <span>🔢</span>
                      <span>Roll Number (6 Digits):</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. 260120"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-sky-900 flex items-center gap-1">
                      <span>📧</span>
                      <span>Institutional Email:</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="student@college.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900 flex items-center gap-1">
                      <span>📱</span>
                      <span>Contact Phone:</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="+880 1700-000000"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Selectors Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1">
                      <span>⚧️</span>
                      <span>Gender</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-amber-200 rounded-xl focus:outline-none"
                    >
                      <option value="Male">👦 Male</option>
                      <option value="Female">👧 Female</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-900 flex items-center gap-1">
                      <span>🎓</span>
                      <span>HSC Batch</span>
                    </label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value as HSCBatch })}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-rose-200 rounded-xl focus:outline-none"
                    >
                      {batches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-violet-900 flex items-center gap-1">
                      <span>📚</span>
                      <span>Academic Group</span>
                    </label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value as AcademicGroup })}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-violet-200 rounded-xl focus:outline-none"
                    >
                      {groups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-900 flex items-center gap-1">
                      <span>🏫</span>
                      <span>Section</span>
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value as Section })}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-teal-200 rounded-xl focus:outline-none"
                    >
                      {sections.map((s) => (
                        <option key={s} value={s}>
                          Sec {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-900 flex items-center gap-1">
                    <span>📍</span>
                    <span>Permanent Residential Address:</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-orange-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Flat 3A, House 12, Road 4, Dhanmondi, Dhaka"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-900 flex items-center gap-1">
                      <span>🔑</span>
                      <span>Create Password:</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs font-bold bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-pink-400 hover:text-pink-700 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-fuchsia-50/50 border border-fuchsia-100 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-fuchsia-900 flex items-center gap-1">
                      <span>🛡️</span>
                      <span>Confirm Password:</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-fuchsia-400 absolute left-3 top-2.5" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs font-bold bg-white border border-fuchsia-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-fuchsia-400 hover:text-fuchsia-700 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-submit-registration"
                  type="submit"
                  disabled={registerSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{registerSubmitting ? 'Submitting Registration...' : 'Submit for Academic Approval 🚀'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

