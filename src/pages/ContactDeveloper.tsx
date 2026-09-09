import React from 'react';
import { 
  Cpu, 
  Layers, 
  Wifi, 
  Clock, 
  CheckCircle2, 
  Fingerprint
} from 'lucide-react';

export const ContactDeveloper: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14">
      {/* Main Developer & Hardware Showcase Card */}
      <div
        id="developer-profile-card"
        className="rounded-3xl border border-slate-800/80 bg-slate-950 shadow-2xl overflow-hidden"
      >
        {/* Top: Luxury Cosmic Stage with Neon Laser, Cyber Grid & Orbital Rings */}
        <div className="relative py-16 sm:py-24 px-6 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a0c18] to-[#0f1124]">
          {/* Top Multi-Color Neon Accent Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />

          {/* Cyber Micro-Dot Grid Overlay */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Deep Ambient Aurora Glow Orbs */}
          <div className="pointer-events-none absolute -top-16 left-1/4 h-60 w-60 rounded-full bg-rose-600/25 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-16 right-1/4 h-60 w-60 rounded-full bg-purple-600/25 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

          {/* Concentric Rotating Orbital Rings */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[310px] sm:h-[310px] rounded-full border border-pink-500/20 animate-orbit-cw">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-pink-400 shadow-[0_0_10px_#f43f5e]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[190px] sm:w-[230px] sm:h-[230px] rounded-full border border-purple-500/25 border-dashed animate-orbit-ccw">
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full border border-white/10" />

          {/* Center Stage: Interactive Animated Instagram Logo (Hidden Link) */}
          <a
            id="contact-instagram-btn"
            href="https://www.instagram.com/i_am_mr.ashik/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Profile"
            aria-label="Instagram Profile"
            className="group relative z-10 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-115 active:scale-95 my-3"
          >
            {/* Luminous Pulsing Glow Halo */}
            <span className="absolute -inset-4 rounded-3xl sm:rounded-[36px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 opacity-60 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition-all duration-500 animate-pulse pointer-events-none" />

            {/* Neon Border Glow */}
            <span className="absolute -inset-0.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 opacity-75 group-hover:opacity-100 blur-xs transition-opacity duration-300" />

            {/* Authentic Instagram Squircle Container */}
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl sm:rounded-3xl instagram-gradient text-white animate-insta shadow-[0_0_40px_rgba(225,48,108,0.5)] ring-2 ring-white/40 transition-all duration-500 group-hover:rotate-6 group-hover:shadow-[0_0_60px_rgba(225,48,108,0.8)]">
              {/* Instagram Vector Icon with Specular Drop Shadow */}
              <svg
                className="h-12 w-12 sm:h-14 sm:w-14 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>

              {/* Notification Live Ping Dot */}
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white shadow-xs" />
              </span>
            </div>
          </a>

          {/* Bottom subtle laser line divider */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </div>

        {/* Hardware & Module Architecture Matrix */}
        <div className="border-t border-slate-800/80 bg-slate-950/95 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Embedded Hardware Architecture Specifications</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Tested & Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* 1. ESP32 MCU */}
            <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-cyan-400/60 hover:shadow-cyan-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">ESP32-WROOM-32</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual-core 240MHz Xtensa LX6 controller running FreeRTOS with hardware cryptographic accelerator.
              </p>
            </div>

            {/* 2. R307S Biometric Sensor */}
            <div className="rounded-2xl border border-emerald-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-emerald-400/60 hover:shadow-emerald-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">R307S Optical Sensor</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                560nm optical reader, UART 57,600 baud rate, 1,000 enrolled fingerprint templates capacity with FAR &lt; 0.001%.
              </p>
            </div>

            {/* 3. DS3231 Precision RTC */}
            <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-indigo-400/60 hover:shadow-indigo-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">DS3231 High-Precision RTC</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Temperature-compensated crystal oscillator (±2ppm TCXO) on I2C bus 0x68 with CR2032 battery backup.
              </p>
            </div>

            {/* 4. OLED Display */}
            <div className="rounded-2xl border border-amber-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-amber-400/60 hover:shadow-amber-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">SSD1306 0.96" OLED</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                128x64 high-contrast display presenting live punch status, shift feedback, employee name, and WiFi RSSI.
              </p>
            </div>

            {/* 5. Wi-Fi Telemetry */}
            <div className="rounded-2xl border border-teal-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-teal-400/60 hover:shadow-teal-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  <Wifi className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">802.11 b/g/n RF Link</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-duplex WebSocket stream syncing live punch events with cloud servers in under 40 milliseconds.
              </p>
            </div>

            {/* 6. Cloud Firestore Database */}
            <div className="rounded-2xl border border-purple-500/25 bg-slate-900/85 p-4 shadow-lg hover:border-purple-400/60 hover:shadow-purple-500/10 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="font-bold text-white text-sm">Google Cloud Firestore</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                NoSQL document ledger storing employee profiles, shift schedules, overtime compensation, and audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
