import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck2, 
  Clock, 
  DollarSign, 
  FileBarChart2, 
  Settings, 
  LogOut,
  Fingerprint,
  Radio,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AppRoute } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { useAdminAuth } from '../context/AdminAuthContext';

interface SidebarProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  navigate,
  isOpenMobile,
  onCloseMobile 
}) => {
  const { hardware, isFirebaseConnected } = useAttendance();
  const { adminProfile, logout } = useAdminAuth();

  const navItems = [
    { label: 'Overview', route: '/admin' as AppRoute, icon: LayoutDashboard },
    { label: 'Workforce', route: '/admin/employees' as AppRoute, icon: Users },
    { label: 'Live Ledger', route: '/admin/attendance' as AppRoute, icon: CalendarCheck2 },
    { label: 'Shift Windows', route: '/admin/shifts' as AppRoute, icon: Clock },
    { label: 'Overtime Hub', route: '/admin/overtime' as AppRoute, icon: DollarSign },
    { label: 'Audit Reports', route: '/admin/reports' as AppRoute, icon: FileBarChart2 },
    { label: 'System Config', route: '/admin/settings' as AppRoute, icon: Settings },
  ];

  const handleNavClick = (route: AppRoute) => {
    navigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-4 bg-slate-950/80">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm ring-1 ring-emerald-400/40">
          <Fingerprint className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-extrabold text-white tracking-tight">
              Workforce Admin
            </h2>
            <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
              v2.4
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            ESP32 IoT Terminal Control
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Main Management
          </span>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`sidebar-link-${item.label.toLowerCase()}`}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 text-white border-l-2 border-emerald-400 shadow-inner'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real-Time Hardware Telemetry Box */}
        <div
          id="sidebar-system-status"
          className="rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-900/80 to-slate-950 p-3 text-xs shadow-inner"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-white text-[11px] tracking-tight">ESP32 Core Online</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
              240MHz
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Sensor:</span>
              <span className="text-slate-200 font-bold">R307S (UART)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Baud Rate:</span>
              <span className="text-slate-200">57,600 bps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Enrolled:</span>
              <span className="text-emerald-400 font-bold">{hardware.enrolledFingersCount} Templates</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">RTC Clock:</span>
              <span className="text-slate-200 font-bold">DS3231 Synced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Cloud DB:</span>
              <span className={isFirebaseConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 animate-pulse'}>
                {isFirebaseConnected ? 'WebSocket Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Admin Profile & Actions */}
      <div className="border-t border-slate-800/80 p-3 space-y-2.5 bg-slate-950/90">
        {adminProfile && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white truncate">{adminProfile.name}</span>
              <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-800/80">
                ROOT ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{adminProfile.email}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            id="sidebar-portal-button"
            type="button"
            onClick={() => handleNavClick('/')}
            className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          >
            <span>Exit to Employee Portal</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            id="sidebar-signout-button"
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/50 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
