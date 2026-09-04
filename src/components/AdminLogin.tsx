import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { AppRoute } from '../types';

interface AdminLoginProps {
  navigate: (route: AppRoute) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { login, error, clearError, currentUser, adminProfile, logout } = useAdminAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div 
        id="admin-auth-card"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Admin Authentication
              </h2>
              <p className="text-xs text-slate-500">
                Omove Workforce Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal</span>
          </button>
        </div>

        {/* If logged in but unauthorized (no admin doc or role != 'admin' or active != true) */}
        {currentUser && (!adminProfile || adminProfile.role !== 'admin' || !adminProfile.active) ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Unauthorized Admin Access</span>
              </div>
              <p>
                Authenticated as <span className="font-mono font-medium">{currentUser.email}</span> (UID: <span className="font-mono text-[11px]">{currentUser.uid}</span>).
              </p>
              <p className="text-slate-600">
                This account is not registered with active administrative privileges in Firestore (<code className="font-mono text-[11px]">admin/{currentUser.uid}</code> with <code className="font-mono">role: "admin"</code> and <code className="font-mono">active: true</code>).
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Access Notice</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Admin Email
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>

            {/* Quick Demo Credentials Helper */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Admin Account: </span>
                <span className="font-mono text-slate-700">admin@omove.in</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@omove.in');
                  setPassword('Admin@123456');
                  if (error) clearError();
                }}
                className="rounded bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Auto-Fill
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              Admin access requires verification in <code className="font-mono text-slate-700">admin/{'{uid}'}</code>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
