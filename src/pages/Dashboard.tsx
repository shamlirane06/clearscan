import { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  Clock,
  Terminal,
  Activity,
  Shield,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
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
      {/* Executive Security Command Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              <span>Zero-Trust Destination Verification</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Scan Before You Trust.
            </h1>

            <p className="text-sm leading-relaxed text-slate-300">
              Proactive multi-layer inspection defending against QR phishing (quishing), disguised payment mandates,
              typosquatted lookalikes, and cloaked redirects before opening destinations or authorizing credentials.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("scanner")}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <QrCode className="h-4 w-4" />
              <span>Launch QR Scanner</span>
            </button>

            <button
              onClick={() => onNavigate("learn")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <GraduationCap className="h-4 w-4 text-teal-400" />
              <span>Threat Academy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Inspected"
          value={stats.total}
          description="Total links and QR codes evaluated in local session."
          icon={Activity}
          badge="Audit Trail"
          badgeColor="bg-slate-800 text-slate-300 border-slate-700"
        />
        <DashboardCard
          title="Clean Targets"
          value={stats.lowRisk}
          description="Destinations passing all 6 heuristic threat checks."
          icon={ShieldCheck}
          badge="Verified"
          badgeColor="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
        />
        <DashboardCard
          title="Suspicious Flags"
          value={stats.moderateRisk + stats.highRisk}
          description="Lookalikes, shortener masks, and credential keywords."
          icon={AlertTriangle}
          badge="Caution"
          badgeColor="bg-amber-500/10 text-amber-300 border-amber-500/20"
        />
        <DashboardCard
          title="Critical Intercepts"
          value={stats.criticalRisk}
          description="Known malicious indicators or confirmed threat CVEs."
          icon={ShieldAlert}
          badge="Critical"
          badgeColor="bg-rose-500/15 text-rose-300 border-rose-500/30"
        />
      </div>

      {/* Main Focus: Dual Inspection Workstation */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Command Bar Inspector & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Direct Destination Inspector
                </h3>
              </div>
              <span className="text-xs text-slate-400">SSRF Guard Active</span>
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
                <h3 className="text-sm font-semibold text-slate-200">
                  Recent Audit Trail
                </h3>
              </div>
              <button
                onClick={() => onNavigate("history")}
                className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Audit Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No destinations recorded yet in this session. Analyze a URL or QR code above.
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
              <span>Zero-Trust Security Advisory</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attacker stickers on physical parking meters, retail counters, and flyers are the leading vector for UPI quishing.
              Remember: You never enter a PIN or scan a code to <em>receive</em> funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
