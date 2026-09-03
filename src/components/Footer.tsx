import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-200/80 bg-white py-2.5 sm:py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 px-3 sm:flex-row sm:px-4 lg:px-6">
        <p className="text-[11px] text-slate-500 font-medium">
          © 2026 Biometric Attendance System
        </p>
        <p className="text-[11px] text-slate-500">
          Website Maintained by <span className="font-semibold text-slate-700">Omove Tech Team</span>
        </p>
      </div>
    </footer>
  );
};
