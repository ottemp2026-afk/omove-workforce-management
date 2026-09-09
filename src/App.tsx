import React, { useState, useEffect } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { LivePunchPopup } from './components/LivePunchPopup';
import { BiometricScanModal } from './components/BiometricScanModal';
import { AdminLogin } from './components/AdminLogin';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AppRoute } from './types';

// Pages
import { EmployeePortal } from './pages/EmployeePortal';
import { LiveLedgerPage } from './pages/LiveLedgerPage';
import { EmployeeAttendance } from './pages/EmployeeAttendance';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ContactDeveloper } from './pages/ContactDeveloper';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import { ShiftManagement } from './pages/admin/ShiftManagement';
import { OvertimeManagement } from './pages/admin/OvertimeManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { Menu, X, Fingerprint, User, Loader2, Lock } from 'lucide-react';

interface AdminRouteGuardProps {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  mobileAdminSidebarOpen: boolean;
  setMobileAdminSidebarOpen: (open: boolean) => void;
  onOpenScanModal: () => void;
  renderCurrentPage: () => React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  currentRoute,
  navigate,
  mobileAdminSidebarOpen,
  setMobileAdminSidebarOpen,
  onOpenScanModal,
  renderCurrentPage,
}) => {
  const { isAdmin, isLoading, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
          <p className="text-xs font-semibold text-slate-600">Verifying Admin Access (admin/{'{uid}'})...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar
          currentRoute={currentRoute}
          navigate={navigate}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <AdminLogin navigate={navigate} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        navigate={navigate}
        isOpenMobile={mobileAdminSidebarOpen}
        onCloseMobile={() => setMobileAdminSidebarOpen(false)}
      />

      {/* Mobile backdrop for sidebar */}
      {mobileAdminSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileAdminSidebarOpen(false)}
        />
      )}

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Navbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 sm:px-5 lg:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileAdminSidebarOpen(!mobileAdminSidebarOpen)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {mobileAdminSidebarOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>

            {/* Breadcrumb / Current View title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Command Center</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900 capitalize tracking-tight text-sm">
                {currentRoute.replace('/admin/', '').replace('/admin', 'Workforce Overview')}
              </span>
            </div>

            {/* Hardware Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-mono text-emerald-800 ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">ESP32 + R307S Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100/80 transition-all shadow-2xs active:scale-95"
            >
              <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Biometric Terminal</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Employee View</span>
            </button>

            <button
              id="admin-header-lock-btn"
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/90 bg-rose-50/80 hover:bg-rose-100/90 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Lock Admin Panel & Sign Out"
            >
              <Lock className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  // Normalize initial route from current browser URL
  const getInitialRoute = (): AppRoute => {
    const path = window.location.pathname as AppRoute;
    const validRoutes: AppRoute[] = [
      '/',
      '/live-ledger',
      '/attendance',
      '/subscription',
      '/contact',
      '/admin',
      '/admin/employees',
      '/admin/attendance',
      '/admin/shifts',
      '/admin/overtime',
      '/admin/reports',
      '/admin/settings',
    ];
    return validRoutes.includes(path) ? path : '/';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [mobileAdminSidebarOpen, setMobileAdminSidebarOpen] = useState<boolean>(false);

  // Sync route with browser history
  const navigate = (route: AppRoute) => {
    if (route !== currentRoute) {
      setCurrentRoute(route);
      window.history.pushState({}, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      setCurrentRoute(path || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = currentRoute.startsWith('/admin');

  // Render the matched page
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return <EmployeePortal navigate={navigate} />;
      case '/live-ledger':
        return <LiveLedgerPage navigate={navigate} onOpenScanModal={() => setIsScanModalOpen(true)} />;
      case '/attendance':
        return <EmployeeAttendance navigate={navigate} />;
      case '/subscription':
        return <SubscriptionPage navigate={navigate} />;
      case '/contact':
        return <ContactDeveloper />;
      case '/admin':
        return <AdminDashboard navigate={navigate} onOpenScanModal={() => setIsScanModalOpen(true)} />;
      case '/admin/employees':
        return <EmployeeManagement />;
      case '/admin/attendance':
        return <AttendanceManagement />;
      case '/admin/shifts':
        return <ShiftManagement />;
      case '/admin/overtime':
        return <OvertimeManagement />;
      case '/admin/reports':
        return <ReportsPage />;
      case '/admin/settings':
        return <SettingsPage />;
      default:
        return <EmployeePortal navigate={navigate} />;
    }
  };

  return (
    <AdminAuthProvider>
      <AttendanceProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
          {isAdmin ? (
            /* ================= ADMIN VIEW WITH RBAC GUARD ================= */
            <AdminRouteGuard
              currentRoute={currentRoute}
              navigate={navigate}
              mobileAdminSidebarOpen={mobileAdminSidebarOpen}
              setMobileAdminSidebarOpen={setMobileAdminSidebarOpen}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              renderCurrentPage={renderCurrentPage}
            />
          ) : (
            /* ================= PUBLIC / EMPLOYEE VIEW LAYOUT ================= */
            <div className="flex min-h-screen flex-col pb-16 md:pb-0">
              <Navbar
                currentRoute={currentRoute}
                navigate={navigate}
              />

              <main className="flex-1 px-3 sm:px-5 lg:px-6 py-3.5 sm:py-6 max-w-7xl w-full mx-auto">
                {renderCurrentPage()}
              </main>

              <Footer />
              <MobileBottomNav currentRoute={currentRoute} navigate={navigate} />
            </div>
          )}

          {/* Global Components */}
          <ToastContainer />
          <LivePunchPopup />
          <BiometricScanModal
            isOpen={isScanModalOpen}
            onClose={() => setIsScanModalOpen(false)}
          />
        </div>
      </AttendanceProvider>
    </AdminAuthProvider>
  );
}
