import React from 'react';
import { Home, Radio, CalendarCheck, Cpu, ShieldCheck } from 'lucide-react';
import { AppRoute } from '../types';

interface MobileBottomNavProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute, navigate }) => {
  const isAdmin = currentRoute.startsWith('/admin');

  const handleNavToLiveLedger = () => {
    navigate('/live-ledger');
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {/* Tab 1: Home Dashboard */}
        <button
          id="mobile-nav-home"
          type="button"
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentRoute === '/' && !isAdmin
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentRoute === '/' && !isAdmin ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
          }`}>
            <Home className="h-4 w-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Home</span>
        </button>

        {/* Tab 2: Live Ledger (Direct Stream) */}
        <button
          id="mobile-nav-live-ledger"
          type="button"
          onClick={handleNavToLiveLedger}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentRoute === '/live-ledger'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-600 hover:text-emerald-700 active:scale-95'
          }`}
        >
          <div className={`relative flex h-7 w-7 items-center justify-center rounded-lg shadow-xs transition-colors ${
            currentRoute === '/live-ledger'
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-slate-900 text-emerald-400 shadow-slate-900/20'
          }`}>
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1 ring-white"></span>
            </span>
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight font-bold ${
            currentRoute === '/live-ledger' ? 'text-emerald-700' : 'text-slate-900'
          }`}>
            Live Feed
          </span>
        </button>

        {/* Tab 3: Attendance History */}
        <button
          id="mobile-nav-attendance"
          type="button"
          onClick={() => navigate('/attendance')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentRoute === '/attendance'
              ? 'text-cyan-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentRoute === '/attendance' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600'
          }`}>
            <CalendarCheck className="h-4 w-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">History</span>
        </button>

        {/* Tab 4: Hardware Specs */}
        <button
          id="mobile-nav-hardware"
          type="button"
          onClick={() => navigate('/contact')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentRoute === '/contact'
              ? 'text-indigo-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentRoute === '/contact' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600'
          }`}>
            <Cpu className="h-4 w-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Hardware</span>
        </button>

        {/* Tab 5: Admin Switch */}
        <button
          id="mobile-nav-admin"
          type="button"
          onClick={() => navigate(isAdmin ? '/' : '/admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isAdmin
              ? 'text-amber-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            isAdmin ? 'bg-amber-100 text-amber-800' : 'text-slate-600'
          }`}>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
            {isAdmin ? 'Staff View' : 'Admin'}
          </span>
        </button>
      </div>
    </nav>
  );
};
