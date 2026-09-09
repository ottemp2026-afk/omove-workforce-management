import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Loader2, LogOut, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { AppRoute } from '../types';

interface AdminLoginProps {
  navigate: (route: AppRoute) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { login, error, clearError, currentUser, adminProfile, logout } = useAdminAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-8">
      <div 
        id="admin-auth-card"
        className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        {/* Top subtle decorative accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-md ring-1 ring-slate-700/50">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Admin Authentication</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Omove Enterprise Workforce
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal</span>
          </button>
        </div>

        {/* Security Notice Pill */}
        <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 flex items-center gap-2.5">
          <KeyRound className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="leading-snug">
            Protected Command Center. Please sign in with your administrative credentials to continue.
          </span>
        </div>

        {/* If logged in but unauthorized (no admin doc or role != 'admin' or active != true) */}
        {currentUser && (!adminProfile || adminProfile.role !== 'admin' || !adminProfile.active) ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Unauthorized Admin Access</span>
              </div>
              <p>
                Authenticated as <span className="font-mono font-bold text-slate-900">{currentUser.email}</span> (UID: <span className="font-mono text-[11px]">{currentUser.uid}</span>).
              </p>
              <p className="text-slate-600">
                This account is not assigned active administrative rights in Firestore (<code className="font-mono text-[11px]">admin/{currentUser.uid}</code>).
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
                <span>Sign In with Different Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Admin Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Authentication Notice</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  placeholder="admin@omove.in"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 py-3 text-xs font-extrabold text-white hover:from-slate-900 hover:to-slate-800 transition-all shadow-md shadow-slate-900/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>

            <p className="text-[10.5px] text-slate-400 text-center pt-0.5">
              Strictly restricted to authorized administrative personnel.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
