import { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Terminal,
  Activity,
  Shield,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import ActivityChart from "../components/ActivityChart";
import URLInput from "../components/URLInput";
import SecurityReport from "../components/SecurityReport";
import Scanner from "../components/Scanner";
import { scanUrl } from "../services/scanService";
import type { BackendScanResponse, ScanHistoryItem, ScanStats } from "../types/scan";

interface DashboardProps {
  stats: ScanStats;
  recentScans: ScanHistoryItem[];
  onNavigate: (page: string) => void;
  onScanComplete: (response: BackendScanResponse) => void;
}

export default function Dashboard({
  stats,
  recentScans,
  onNavigate,
  onScanComplete,
}: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<BackendScanResponse | null>(null);

  const handleQuickScan = async (url: string) => {
    setLoading(true);
    try {
      const result = await scanUrl(url);
      setQuickResult(result);
      onScanComplete(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial introduction, using only the product's real scan actions. */}
      <section className="editorial-hero relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-9 lg:p-11">
        <div className="relative z-10 grid items-center gap-7 sm:gap-9 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>A safer pause before you open</span>
            </div>

            <h1 className="text-3xl font-semibold leading-[1] tracking-tight text-white sm:text-5xl lg:text-5xl">
              <span className="block">Scan. Analyze.</span>
              <span className="mt-1 block text-teal-500">Stay Secure.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Check a QR destination or unfamiliar link for common warning signs before you open it.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate("scanner")}
                className="ink-action inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <QrCode className="h-4 w-4" />
                <span>Start scanning</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate("manual")}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-teal-500/40 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Check a link</span>
              </button>
            </div>
          </div>

          <div className="hero-illustration relative mx-auto grid h-48 w-full max-w-[22rem] place-items-center overflow-hidden rounded-[1.75rem] sm:h-60 lg:h-[18rem]" aria-hidden="true">
            <span className="hero-orbit hero-orbit-one" />
            <span className="hero-orbit hero-orbit-two" />
            <span className="hero-orbit-dot hero-orbit-dot-one" />
            <span className="hero-orbit-dot hero-orbit-dot-two" />
            <svg className="hero-shield-art relative z-10 h-40 w-40 sm:h-56 sm:w-56" viewBox="0 0 240 260" fill="none">
              <defs>
                <linearGradient id="hero-shield-metal" x1="35" y1="44" x2="207" y2="202" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#77716f" />
                  <stop offset=".24" stopColor="#383433" />
                  <stop offset=".53" stopColor="#242323" />
                  <stop offset=".78" stopColor="#44403f" />
                  <stop offset="1" stopColor="#171717" />
                </linearGradient>
                <linearGradient id="hero-shield-edge" x1="34" y1="36" x2="189" y2="224" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f4e7dd" />
                  <stop offset=".45" stopColor="#988b84" />
                  <stop offset="1" stopColor="#d7c7bd" />
                </linearGradient>
                <linearGradient id="hero-lock-metal" x1="79" y1="112" x2="164" y2="181" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fffaf6" />
                  <stop offset=".54" stopColor="#cfc5bf" />
                  <stop offset="1" stopColor="#918985" />
                </linearGradient>
                <filter id="hero-shield-shadow" x="4" y="2" width="232" height="258" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="7" />
                  <feOffset dy="8" />
                  <feComponentTransfer><feFuncA type="linear" slope=".28" /></feComponentTransfer>
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path d="M120 16 214 51v62c0 63-35 108-94 140-59-32-94-77-94-140V51l94-35Z" fill="url(#hero-shield-metal)" stroke="url(#hero-shield-edge)" strokeWidth="5" filter="url(#hero-shield-shadow)" />
              <path d="M120 31 199 60v52c0 52-29 91-79 120-50-29-79-68-79-120V60l79-29Z" stroke="#88817e" strokeOpacity=".58" strokeWidth="2" />
              <path d="M56 61 116 39" stroke="#fffaf6" strokeOpacity=".2" strokeWidth="5" strokeLinecap="round" />
              <path d="M91 111V93a29 29 0 0 1 58 0v18" stroke="#171717" strokeOpacity=".65" strokeWidth="17" strokeLinecap="round" />
              <path d="M91 108V92a29 29 0 0 1 58 0v16" stroke="url(#hero-lock-metal)" strokeWidth="13" strokeLinecap="round" />
              <rect x="75" y="105" width="90" height="74" rx="14" fill="url(#hero-lock-metal)" stroke="#fffaf6" strokeOpacity=".75" strokeWidth="2" />
              <path d="M84 117a6 6 0 0 1 6-6h60" stroke="#fffaf6" strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
              <circle cx="120" cy="136" r="8" fill="#292624" />
              <path d="m116 141-4 18h16l-4-18" fill="#292624" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Focus: Dual Inspection Workstation */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Command Bar Inspector & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-teal-400" />
              <h2 className="text-sm font-semibold text-slate-100 sm:text-base">
                  Check a link
                </h2>
              </div>
              <span className="text-xs text-slate-400">Private network checks on</span>
            </div>

            <URLInput onScan={handleQuickScan} loading={loading} />
          </div>

          {quickResult && (
            <SecurityReport report={quickResult} onReset={() => setQuickResult(null)} />
          )}

          {/* Recent Audit Feed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  Recent scans
                </h2>
              </div>
              <button
                onClick={() => onNavigate("history")}
                className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <span>View history</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Your recent checks will appear here. Analyze a URL or QR code to begin.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentScans.slice(0, 4).map((scan) => {
                  const isCritical = scan.riskScore >= 75 || scan.riskClassification === "CRITICAL_RISK";
                  const isHigh = scan.riskScore >= 50 && scan.riskScore < 75;
                  const isModerate = scan.riskScore >= 25 && scan.riskScore < 50;

                  return (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs transition-colors hover:border-slate-700"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200 truncate">
                            {scan.normalizedHostname || scan.url}
                          </span>
                          <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.2 text-[10px] uppercase font-semibold text-slate-400">
                            {scan.source}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-400 truncate pt-1">{scan.url}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${
                            isCritical
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                              : isHigh
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              : isModerate
                              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          Score: {scan.riskScore >= 0 ? scan.riskScore : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Optical QR Scanner (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Scanner onScanComplete={onScanComplete} />

          {/* Zero-Trust Security Advisory */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
              <Shield className="h-4 w-4" />
              <span>Safety reminder</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A QR sticker can be placed over a legitimate code on a parking meter, counter, or flyer. Check the destination before opening it. You never need to enter a PIN or scan a code to <em>receive</em> money.
            </p>
          </div>
        </div>
      </div>

      {/* Real local totals mirror the reference metrics without implying resolved issues. */}
      <div className="grid grid-cols-1 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <DashboardCard
          title="Total scans"
          value={stats.total}
          description="Links and QR codes checked in this browser."
          icon={Activity}
          badge="This browser"
          badgeColor="bg-slate-800 text-slate-300 border-slate-700"
        />
        <DashboardCard
          title="Needs review"
          value={stats.moderateRisk + stats.highRisk + stats.criticalRisk + stats.unableToVerify}
          description="Scans with warning signs or incomplete checks."
          icon={AlertTriangle}
          badge="Review"
          badgeColor="bg-amber-500/10 text-amber-300 border-amber-500/20"
        />
        <DashboardCard
          title="Low risk"
          value={stats.lowRisk}
          description="No configured warning patterns found."
          icon={ShieldCheck}
          badge="Context only"
          badgeColor="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
        />
      </div>

      <ActivityChart history={recentScans} />
    </div>
  );
}
