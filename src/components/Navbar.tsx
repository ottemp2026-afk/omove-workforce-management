import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, User, Wifi, Menu, X, Cpu } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AppRoute } from '../types';

interface NavbarProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  onOpenScanModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, onOpenScanModal }) => {
  const { hardware, selectedEmployee, employees, setSelectedEmployeeId, isFirebaseConnected, firestoreError } = useAttendance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employeeSwitcherOpen, setEmployeeSwitcherOpen] = useState(false);

  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            id="nav-brand-logo"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
              <Fingerprint className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-900">
                  Biometric Attendance
                </span>
                <span className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 sm:inline-block">
                  R307S • ESP32
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Enterprise Workforce System
              </p>
            </div>
          </button>

          {/* Navigation Links for Employee Side */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            <button
              id="nav-link-dashboard"
              onClick={() => navigate('/')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentRoute === '/'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-link-attendance"
              onClick={() => navigate('/attendance')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentRoute === '/attendance'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Attendance
            </button>
            <button
              id="nav-link-contact"
              onClick={() => navigate('/contact')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentRoute === '/contact'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex md:items-center md:gap-2.5">
          {/* Firestore Status */}
          <div
            id="system-status-indicator"
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
            title={isFirebaseConnected ? 'Firebase Firestore connected and synced.' : firestoreError || 'Connecting to Firebase Firestore...'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="font-medium text-[11px]">
              {isFirebaseConnected ? 'Firestore Synced' : 'Firestore Syncing'}
            </span>
          </div>

          {/* Quick Hardware Scan Button */}
          <button
            id="quick-scan-test-btn"
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Fingerprint className="h-3.5 w-3.5 text-slate-500" />
            <span>Record Attendance</span>
          </button>

          {/* Employee Switcher / Profile */}
          <div className="relative">
            <button
              id="employee-menu-button"
              type="button"
              onClick={() => setEmployeeSwitcherOpen(!employeeSwitcherOpen)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-medium text-white">
                {selectedEmployee?.avatarInitials || 'EM'}
              </div>
              <span className="max-w-[100px] truncate">{selectedEmployee?.name}</span>
            </button>

            {employeeSwitcherOpen && (
              <div
                id="employee-switcher-dropdown"
                className="absolute right-0 mt-1.5 w-60 rounded-md border border-slate-200 bg-white p-1.5 shadow-md z-50"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500">
                    Switch Active Employee
                  </p>
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setEmployeeSwitcherOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-slate-100 font-medium text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.id} • {emp.department}</p>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">
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
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Employee Portal</span>
            </button>
          ) : (
            <button
              id="switch-to-admin-panel-btn"
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-scan-btn"
            onClick={onOpenScanModal}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            title="Scan"
          >
            <Fingerprint className="h-5 w-5 text-emerald-600" />
          </button>
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online (ESP32)
            </div>
            <button
              onClick={onOpenScanModal}
              className="text-xs font-bold text-slate-800 underline flex items-center gap-1"
            >
              <Fingerprint className="h-3.5 w-3.5" /> Scan Finger
            </button>
          </div>

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
                navigate('/attendance');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Attendance History
            </button>
            <button
              onClick={() => {
                navigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Contact Developer
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                navigate(isAdminRoute ? '/' : '/admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white"
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
