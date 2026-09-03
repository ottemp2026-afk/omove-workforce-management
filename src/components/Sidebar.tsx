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
  Radio
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
  const { hardware } = useAttendance();
  const { adminProfile, logout } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', route: '/admin' as AppRoute, icon: LayoutDashboard },
    { label: 'Employees', route: '/admin/employees' as AppRoute, icon: Users },
    { label: 'Attendance', route: '/admin/attendance' as AppRoute, icon: CalendarCheck2 },
    { label: 'Shifts', route: '/admin/shifts' as AppRoute, icon: Clock },
    { label: 'Overtime', route: '/admin/overtime' as AppRoute, icon: DollarSign },
    { label: 'Reports', route: '/admin/reports' as AppRoute, icon: FileBarChart2 },
    { label: 'Settings', route: '/admin/settings' as AppRoute, icon: Settings },
  ];

  const handleNavClick = (route: AppRoute) => {
    navigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-slate-200 bg-white text-slate-700 transition-transform duration-150 lg:static lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0 shadow-lg' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200/80 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
          <Fingerprint className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Workforce Admin
          </h2>
          <p className="text-[10px] text-slate-400">
            Biometric Management
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
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
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Hardware Info / Logout */}
      <div className="border-t border-slate-200/80 p-3 space-y-3">
        {/* Hardware Status Box */}
        <div
          id="sidebar-system-status"
          className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5 text-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-medium text-slate-800 text-[11px]">System Online</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              ESP32
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <div className="flex justify-between">
              <span>Terminal:</span>
              <span className="text-slate-700 font-medium">R307S</span>
            </div>
            <div className="flex justify-between">
              <span>Enrolled:</span>
              <span className="text-slate-900 font-medium">{hardware.enrolledFingersCount} Prints</span>
            </div>
          </div>
        </div>

        {/* Admin Profile & Actions */}
        {adminProfile && (
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 truncate">{adminProfile.name}</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{adminProfile.email}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            id="sidebar-signout-button"
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50/50 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100/70 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Sign Out Admin</span>
          </button>

          {/* Exit to Employee Portal */}
          <button
            id="sidebar-portal-button"
            type="button"
            onClick={() => handleNavClick('/')}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Employee Portal</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
