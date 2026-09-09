import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, User, Menu, X, Sparkles } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AppRoute } from '../types';

interface NavbarProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  onOpenScanModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { selectedEmployee, employees, setSelectedEmployeeId, isFirebaseConnected, firestoreError } = useAttendance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employeeSwitcherOpen, setEmployeeSwitcherOpen] = useState(false);

  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 min-w-0 shrink-0">
          <button
            id="nav-brand-logo"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-hidden group cursor-pointer shrink-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-sm ring-1 ring-slate-800/80 group-hover:scale-105 transition-transform">
              <Fingerprint className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                  Biometric Attendance
                </span>
                <span className="hidden rounded-full border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[9px] font-bold text-slate-600 sm:inline-block tracking-wider uppercase whitespace-nowrap shrink-0">
                  ESP32 • R307S
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                Omove Enterprise Workforce
              </p>
            </div>
          </button>

          {/* Navigation Links for Employee Side */}
          <nav className="hidden lg:flex lg:items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              id="nav-link-dashboard"
              onClick={() => navigate('/')}
              className={`rounded-lg px-2.5 xl:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentRoute === '/'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-link-live-ledger"
              onClick={() => navigate('/live-ledger')}
              className={`rounded-lg px-2.5 xl:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentRoute === '/live-ledger'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${currentRoute === '/live-ledger' ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
              <span className="whitespace-nowrap">Live Ledger</span>
            </button>
            <button
              id="nav-link-attendance"
              onClick={() => navigate('/attendance')}
              className={`rounded-lg px-2.5 xl:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentRoute === '/attendance'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="whitespace-nowrap hidden xl:inline">Attendance History</span>
              <span className="whitespace-nowrap xl:hidden">Attendance</span>
            </button>
            <button
              id="nav-link-subscription"
              onClick={() => navigate('/subscription')}
              className={`rounded-lg px-2.5 xl:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentRoute === '/subscription'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs font-bold'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Subscription</span>
            </button>
            <button
              id="nav-link-contact"
              onClick={() => navigate('/contact')}
              className={`rounded-lg px-2.5 xl:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentRoute === '/contact'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="whitespace-nowrap hidden xl:inline">Hardware Info</span>
              <span className="whitespace-nowrap xl:hidden">Hardware</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="hidden lg:flex lg:items-center gap-2 xl:gap-2.5 shrink-0">
          {/* Firestore Status */}
          <div
            id="system-status-indicator"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-2.5 xl:px-3 py-1.5 text-xs text-slate-700 shadow-2xs whitespace-nowrap shrink-0"
            title={isFirebaseConnected ? 'Firebase Firestore connected and synced.' : firestoreError || 'Connecting to Firebase Firestore...'}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${isFirebaseConnected ? 'bg-emerald-500 shadow-xs shadow-emerald-400' : 'bg-amber-500 animate-pulse'}`} />
            <span className="font-semibold text-[11px] tracking-tight whitespace-nowrap">
              <span className="hidden xl:inline">Firestore </span>Realtime
            </span>
          </div>

          {/* Employee Switcher / Profile */}
          <div className="relative shrink-0">
            <button
              id="employee-menu-button"
              type="button"
              onClick={() => setEmployeeSwitcherOpen(!employeeSwitcherOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {selectedEmployee?.avatarInitials || 'EM'}
              </div>
              <span className="max-w-[95px] xl:max-w-[125px] truncate whitespace-nowrap">{selectedEmployee?.name}</span>
            </button>

            {employeeSwitcherOpen && (
              <div
                id="employee-switcher-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200/90 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Personnel Profile
                  </p>
                </div>
                <div className="max-h-56 overflow-y-auto py-1.5 space-y-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setEmployeeSwitcherOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-slate-100 font-bold text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.id} • {emp.department}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                        #{emp.fingerprintId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Login / Panel Toggle */}
          {isAdminRoute ? (
            <button
              id="switch-to-employee-portal-btn"
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            >
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="whitespace-nowrap">Employee Portal</span>
            </button>
          ) : (
            <button
              id="switch-to-admin-panel-btn"
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 px-3 xl:px-3.5 py-1.5 text-xs font-semibold text-white hover:from-slate-800 hover:to-slate-900 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Admin Panel</span>
            </button>
          )}
        </div>

        {/* Mobile / Tablet menu button and active employee badge */}
        <div className="flex lg:hidden items-center gap-2">
          {selectedEmployee && !isAdminRoute && (
            <button
              id="mobile-employee-quick-pill"
              type="button"
              onClick={() => {
                const el = document.getElementById('employee-selector-card');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2.5 text-xs text-slate-800 shadow-2xs cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {selectedEmployee.avatarInitials || selectedEmployee.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold text-[11px] max-w-[85px] truncate">
                {selectedEmployee.name.split(' ')[0]}
              </span>
            </button>
          )}

          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 lg:hidden animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              ESP32 Biometric Terminal Active
            </div>
          </div>

          {/* Mobile Profile Switcher in Drawer */}
          {selectedEmployee && !isAdminRoute && (
            <div className="mb-3 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 p-3 text-white border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 font-extrabold text-slate-950 text-xs">
                    {selectedEmployee.avatarInitials || selectedEmployee.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-white">{selectedEmployee.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{selectedEmployee.department} • FP-#{selectedEmployee.fingerprintId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    title="Previous Employee"
                    onClick={() => {
                      const idx = employees.findIndex(e => e.id === selectedEmployee.id);
                      const prevIdx = (idx - 1 + employees.length) % employees.length;
                      setSelectedEmployeeId(employees[prevIdx].id);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    title="Next Employee"
                    onClick={() => {
                      const idx = employees.findIndex(e => e.id === selectedEmployee.id);
                      const nextIdx = (idx + 1) % employees.length;
                      setSelectedEmployeeId(employees[nextIdx].id);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dashboard (Employee)
            </button>
            <button
              onClick={() => {
                navigate('/live-ledger');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                currentRoute === '/live-ledger'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${currentRoute === '/live-ledger' ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
              <span>Live Biometric Ledger</span>
            </button>
            <button
              onClick={() => {
                navigate('/attendance');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Attendance History
            </button>
            <button
              onClick={() => {
                navigate('/subscription');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                currentRoute === '/subscription' ? 'bg-purple-700 text-white' : 'text-purple-800 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Subscription Plans</span>
            </button>
            <button
              onClick={() => {
                navigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Hardware Info
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                navigate(isAdminRoute ? '/' : '/admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {isAdminRoute ? 'Switch to Employee Portal' : 'Admin Panel'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
