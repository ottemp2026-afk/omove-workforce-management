import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAttendance();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-600';
        let borderColor = 'border-emerald-200';
        let bgStyle = 'bg-white';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
          borderColor = 'border-rose-200';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
          borderColor = 'border-amber-200';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-sky-600';
          borderColor = 'border-sky-200';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-2.5 p-2.5 rounded-lg border shadow-md ${bgStyle} ${borderColor} transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 -mr-0.5 -mt-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
