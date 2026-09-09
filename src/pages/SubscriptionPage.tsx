import React, { useState } from 'react';
import { AppRoute } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Cpu, 
  Fingerprint, 
  Clock, 
  Radio, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Layers,
  Infinity as InfinityIcon
} from 'lucide-react';

interface SubscriptionPageProps {
  navigate: (route: AppRoute) => void;
}

type BillingCycle = 'ANNUAL' | 'MONTHLY';

interface PlanTier {
  id: 'basic' | 'premium' | 'max';
  name: string;
  badge?: string;
  isPopular?: boolean;
  annualPrice: number;
  monthlyEquivalent: number;
  subtitle: string;
  terminalLimit: string;
  workerLimit: string;
  features: string[];
  ctaLabel: string;
  themeColor: 'cyan' | 'purple' | 'amber';
}

const PLANS: PlanTier[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    badge: 'Essential',
    annualPrice: 2000,
    monthlyEquivalent: 167,
    subtitle: 'Ideal for standalone single-workshop setups and small businesses.',
    terminalLimit: '1x ESP32 Terminal',
    workerLimit: 'Up to 50 Workers',
    features: [
      '1x ESP32-WROOM-32 Hardware License',
      'Up to 50 Enrolled Workforce Profiles',
      'Live Cloud Firestore Database Sync',
      'Standard Daily Attendance Ledger',
      'DS3231 RTC Time Sync (±2ppm Accuracy)',
      'CSV Attendance Report Exports',
      'Email & Community Help Desk'
    ],
    ctaLabel: 'Get Basic Plan',
    themeColor: 'cyan'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    badge: '✨ Most Popular',
    isPopular: true,
    annualPrice: 3000,
    monthlyEquivalent: 250,
    subtitle: 'Automated overtime and multi-terminal sync for manufacturing units.',
    terminalLimit: 'Up to 3x Terminals',
    workerLimit: 'Up to 250 Workers',
    features: [
      'Up to 3x ESP32 Biometric Terminals',
      'Up to 250 Enrolled Workforce Profiles',
      'Complete 1-Hour Block Overtime Engine',
      'Live 5-Second Instant Punch Pop-ups',
      'Multi-Shift Scheduling (Morning/Evening/Night)',
      'Biometric Match Confidence Score (99.4%)',
      'Overtime Payout Automatic Calculator',
      'Priority OTA Firmware Cloud Updates',
      '24/7 Dedicated WhatsApp & Phone Support'
    ],
    ctaLabel: 'Upgrade to Premium',
    themeColor: 'purple'
  },
  {
    id: 'max',
    name: 'Max Enterprise',
    badge: '🚀 Maximum Power',
    annualPrice: 5000,
    monthlyEquivalent: 417,
    subtitle: 'Full industrial scale with unlimited terminals and custom shift rules.',
    terminalLimit: 'Unlimited Terminals',
    workerLimit: '1,000+ Fingerprint Templates',
    features: [
      'Unlimited ESP32 Biometric Terminals',
      '1,000 Flash Fingerprint Templates (Full Capacity)',
      'Cross-Branch Multi-Location Sync',
      'Automated Payroll & Overtime Ledger Export',
      'Dedicated Hardware Telemetry Command Center',
      'Custom Grace Periods & Break Policies',
      '99.9% Uptime Cloud SLA Guarantee',
      'VIP Dedicated Technical Account Lead'
    ],
    ctaLabel: 'Deploy Max Enterprise',
    themeColor: 'amber'
  }
];

const FAQS = [
  {
    q: 'How does the 1-Year subscription work?',
    a: 'All plans are billed annually upfront (Basic: ₹2,000/yr, Premium: ₹3,000/yr, Max: ₹5,000/yr). Your cloud sync, terminal WebSocket stream, and firmware update channels remain fully active for 365 days.'
  },
  {
    q: 'Can I connect my existing ESP32 and R307S sensor?',
    a: 'Yes! The Omove workforce platform connects seamlessly with any ESP32-WROOM-32 module and R307S optical biometric sensor running our open-standard firmware.'
  },
  {
    q: 'How does the automated 1-hour overtime block work in Premium and Max?',
    a: 'The overtime engine strictly calculates complete 60-minute blocks worked beyond your standard shift duration (e.g., 480 mins). Partial minutes under 1 hour are not credited, complying with factory payroll regulations.'
  },
  {
    q: 'Does the live 5-second punch pop-up work on all devices?',
    a: 'Yes! In Premium and Max tiers, the real-time punch notification triggers across all open browsers (desktop and mobile) with synthesized audio feedback.'
  }
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ navigate }) => {
  const { addToast } = useAttendance();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('ANNUAL');
  const [selectedPlanModal, setSelectedPlanModal] = useState<PlanTier | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);

  const handleSelectPlan = (plan: PlanTier) => {
    setSelectedPlanModal(plan);
    setActivationSuccess(false);
  };

  const handleConfirmActivation = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setActivationSuccess(true);
      addToast({
        type: 'success',
        title: 'Subscription Activated',
        message: `Successfully activated ${selectedPlanModal?.name} (1 Year Annual License).`,
      });
      setTimeout(() => {
        setSelectedPlanModal(null);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* ================= HERO SECTION ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-[#0c0e24] to-slate-950 p-8 sm:p-14 text-white shadow-2xl border border-slate-800">
        {/* Top Accent Gradient Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 via-purple-500 to-amber-400 shadow-[0_0_15px_rgba(217,70,239,0.8)]" />

        {/* Ambient Neon Background Glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-cyan-600/20 blur-3xl" />

        {/* Micro-dot tech grid */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 text-xs font-bold text-purple-300 mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" />
            <span>Omove Cloud &amp; IoT Hardware Subscription</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Transparent <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">Annual Plans</span> for Every Workforce
          </h1>
          
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Choose the annual tier for your biometric attendance hardware, instant 1-hour overtime calculations, and secure cloud synchronization.
          </p>

          {/* Interactive Billing Frequency Switcher */}
          <div className="mt-8 inline-flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`relative px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'ANNUAL'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>1 Year (Annual)</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                SAVE 20%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Monthly Breakdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 3 PRICING CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {PLANS.map((plan) => {
          const isAnnual = billingCycle === 'ANNUAL';
          const displayedPrice = isAnnual ? plan.annualPrice : plan.monthlyEquivalent;

          // Theme-specific styles
          let cardBg = 'bg-white border-slate-200';
          let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
          let btnStyle = 'bg-slate-900 hover:bg-slate-800 text-white';
          let checkColor = 'text-cyan-600';

          if (plan.themeColor === 'cyan') {
            cardBg = 'bg-white border-cyan-200/90 hover:border-cyan-400 shadow-lg shadow-cyan-950/5';
            badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-300/80';
            btnStyle = 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20';
            checkColor = 'text-cyan-600';
          } else if (plan.themeColor === 'purple') {
            cardBg = 'bg-gradient-to-b from-[#180f2e] via-[#20113b] to-[#140b26] border-purple-500/40 shadow-2xl text-white animate-card-glow';
            badgeStyle = 'bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border-fuchsia-400/50 shadow-xs';
            btnStyle = 'bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 hover:from-fuchsia-400 hover:to-indigo-500 text-white shadow-xl shadow-purple-500/40';
            checkColor = 'text-fuchsia-400';
          } else if (plan.themeColor === 'amber') {
            cardBg = 'bg-white border-amber-300/90 hover:border-amber-400 shadow-lg shadow-amber-950/5';
            badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300/80';
            btnStyle = 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-500/25';
            checkColor = 'text-amber-600';
          }

          return (
            <div
              key={plan.id}
              id={`pricing-card-${plan.id}`}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 sm:p-9 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${cardBg} ${
                plan.isPopular ? 'lg:-translate-y-3' : ''
              }`}
            >
              {/* Popular Shimmer Ribbon for Premium */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/40 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 fill-current text-amber-300 animate-pulse" />
                  <span>RECOMMENDED • 1 YEAR</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${
                      plan.themeColor === 'purple' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      plan.themeColor === 'purple' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeStyle}`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-slate-200/40">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-slate-400">₹</span>
                    <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                      plan.themeColor === 'purple' ? 'text-white' : 'text-slate-950'
                    }`}>
                      {displayedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-xs font-semibold ${
                      plan.themeColor === 'purple' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {isAnnual ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <p className={`text-[11px] font-mono mt-1.5 ${
                    plan.themeColor === 'purple' ? 'text-emerald-400' : 'text-emerald-700'
                  }`}>
                    {isAnnual 
                      ? `✓ Full 365 Days Access (₹${plan.monthlyEquivalent}/mo equivalent)`
                      : `Billed annually at ₹${plan.annualPrice}/yr`
                    }
                  </p>
                </div>

                {/* Quick Capacity Badges */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    plan.themeColor === 'purple' 
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <Cpu className="h-4 w-4 text-cyan-500 shrink-0" />
                    <span className="font-bold truncate">{plan.terminalLimit}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    plan.themeColor === 'purple' 
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <Fingerprint className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-bold truncate">{plan.workerLimit}</span>
                  </div>
                </div>

                {/* Feature Bullet List */}
                <div className="space-y-3 mb-8 text-xs sm:text-sm">
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                    plan.themeColor === 'purple' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Included Hardware &amp; Cloud Features:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${checkColor}`} />
                      <span className={`leading-snug ${
                        plan.themeColor === 'purple' ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${btnStyle}`}
              >
                <span>{plan.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= DETAILED FEATURE COMPARISON TABLE ================= */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Compare Plan Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side technical breakdown of each annual subscription tier.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            100% Cloud Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-3 px-4 font-bold text-slate-700">Capability</th>
                <th className="py-3 px-4 font-bold text-cyan-700">Basic (₹2,000/yr)</th>
                <th className="py-3 px-4 font-bold text-purple-700 bg-purple-50/60">Premium (₹3,000/yr)</th>
                <th className="py-3 px-4 font-bold text-amber-700">Max (₹5,000/yr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">ESP32 Terminal Hardware</td>
                <td className="py-3 px-4 text-slate-600 font-mono">1 Device</td>
                <td className="py-3 px-4 font-bold text-purple-900 font-mono bg-purple-50/30">Up to 3 Devices</td>
                <td className="py-3 px-4 font-bold text-amber-900 font-mono">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Fingerprint Template Slots</td>
                <td className="py-3 px-4 text-slate-600 font-mono">50 Slots</td>
                <td className="py-3 px-4 font-bold text-purple-900 font-mono bg-purple-50/30">250 Slots</td>
                <td className="py-3 px-4 font-bold text-amber-900 font-mono">1,000 Slots (Full)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">1-Hour Overtime Engine</td>
                <td className="py-3 px-4 text-slate-400">Manual calculation</td>
                <td className="py-3 px-4 text-emerald-600 font-bold bg-purple-50/30">✓ Automated 1-Hr Blocks</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Automated + Custom Rates</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Live 5-Sec Punch Pop-ups</td>
                <td className="py-3 px-4 text-slate-400">Standard table only</td>
                <td className="py-3 px-4 text-emerald-600 font-bold bg-purple-50/30">✓ Live Across Portal</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Live Across Portal + Sound</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Shift Configurations</td>
                <td className="py-3 px-4 text-slate-600 font-mono">Single Shift (A)</td>
                <td className="py-3 px-4 font-bold text-purple-900 font-mono bg-purple-50/30">3 Shifts (A, B, C)</td>
                <td className="py-3 px-4 font-bold text-amber-900 font-mono">Unlimited Custom Shifts</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Firmware OTA Updates</td>
                <td className="py-3 px-4 text-slate-600 font-mono">Standard</td>
                <td className="py-3 px-4 font-bold text-purple-900 font-mono bg-purple-50/30">Priority OTA Cloud</td>
                <td className="py-3 px-4 font-bold text-amber-900 font-mono">Instant Beta + Rollback</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Support Response SLA</td>
                <td className="py-3 px-4 text-slate-600">Email (48 Hours)</td>
                <td className="py-3 px-4 font-bold text-purple-900 bg-purple-50/30">WhatsApp (Under 2 Hours)</td>
                <td className="py-3 px-4 font-bold text-amber-900">Dedicated VIP Lead (&lt; 15 mins)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTERACTIVE PLAN ACTIVATION MODAL ================= */}
      {selectedPlanModal && (
        <div 
          id="subscription-activation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Laser Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 rounded-t-3xl" />

            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Annual Subscription Order</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activationSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto animate-bounce">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-2xl font-black text-white">License Activated!</h3>
                <p className="text-xs text-slate-300">
                  {selectedPlanModal.name} is now linked with your cloud Firestore tenant for 365 days.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-white">
                    {selectedPlanModal.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPlanModal.subtitle}
                  </p>

                  <div className="pt-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ₹{selectedPlanModal.annualPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      / 1 Year Full License
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono text-slate-300 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terminals:</span>
                    <span className="text-white font-bold">{selectedPlanModal.terminalLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="text-white font-bold">{selectedPlanModal.workerLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing Cycle:</span>
                    <span className="text-emerald-400 font-bold">12 Months (Annual)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmActivation}
                    disabled={isActivating}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isActivating ? (
                      <span>Activating License...</span>
                    ) : (
                      <>
                        <span>Activate ₹{selectedPlanModal.annualPrice} License</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
