import React from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Wifi, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Phone,
  Fingerprint
} from 'lucide-react';

export const ContactDeveloper: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Developer & Engineering Contact
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Get in touch with the engineering lead regarding hardware deployment, biometric firmware, and workforce software.
        </p>
      </div>

      {/* Main Developer Card */}
      <div
        id="developer-profile-card"
        className="rounded-md border border-slate-200 bg-white overflow-hidden"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-900 text-white font-bold text-lg">
                AD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Ashik Das</h2>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                    Lead Developer
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Embedded Systems & Full-Stack Engineer
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Institution:{' '}
                  <span className="text-slate-800 font-medium">
                    Coochbehar Polytechnic Biometric Attendance System
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Available for Technical Support</span>
            </div>
          </div>

          {/* Professional Contact Buttons */}
          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2.5">
              Direct Contact Channels
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* WhatsApp Button */}
              <a
                id="contact-whatsapp-btn"
                href="https://wa.me/918345968169"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block font-medium text-slate-900">WhatsApp</span>
                    <span className="text-[11px] text-slate-500">+91 83459 68169</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </a>

              {/* Instagram Button */}
              <a
                id="contact-instagram-btn"
                href="https://www.instagram.com/i_am_mr.ashik/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-50 text-pink-700 border border-pink-200">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block font-medium text-slate-900">Instagram</span>
                    <span className="text-[11px] text-slate-500">@i_am_mr.ashik</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </a>

              {/* X / Twitter Button */}
              <a
                id="contact-x-btn"
                href="https://x.com/Omove_Tech"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    <span className="text-xs font-bold">𝕏</span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-900">X (Twitter)</span>
                    <span className="text-[11px] text-slate-500">@Omove_Tech</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Hardware Architecture Summary */}
        <div className="border-t border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
            Hardware & Module Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <Cpu className="h-3.5 w-3.5 text-slate-600" />
                <span>ESP32 MCU</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dual-core 240MHz controller handling Wi-Fi, DSP & biometric scheduling.
              </p>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
                <span>R307S Sensor</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Optical fingerprint reader with onboard template storage & matching.
              </p>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <Clock className="h-3.5 w-3.5 text-sky-600" />
                <span>DS3231 RTC</span>
              </div>
              <p className="text-[11px] text-slate-500">
                High-precision real-time clock with battery backup for exact timestamping.
              </p>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <Layers className="h-3.5 w-3.5 text-slate-600" />
                <span>0.96" OLED</span>
              </div>
              <p className="text-[11px] text-slate-500">
                I2C display presenting live punch status, time, and employee name.
              </p>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <Wifi className="h-3.5 w-3.5 text-teal-600" />
                <span>Wi-Fi Telemetry</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Encrypted 802.11 b/g/n transmission syncing logs with cloud backend.
              </p>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Firebase Database</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cloud Firestore & Auth architecture designed for persistent logging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
