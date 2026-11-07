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
  Zap,
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
      {/* Top Banner / Security Command Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ZERO-TRUST DESTINATION VERIFICATION</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              Scan Before You Trust.
            </h1>

            <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
              Proactive multi-layer defense against quishing, disguised payment mandates, typosquatted
              domains, and obscured redirects before opening links or entering credentials.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate("scanner")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:bg-emerald-400"
            >
              <QrCode className="h-4 w-4" />
              <span>OPTICAL CAMERA</span>
            </button>

            <button
              onClick={() => onNavigate("learn")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>THREAT ACADEMY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Audit Volume"
          value={stats.total}
          description="Total links and QR codes evaluated in local session."
          icon={Activity}
          badge="Audit Trail"
          badgeColor="bg-zinc-800 text-zinc-300 border-zinc-700"
        />
        <DashboardCard
          title="Clean Targets"
          value={stats.lowRisk}
          description="Destinations passing all 6 heuristic threat checks."
          icon={ShieldCheck}
          badge="Verified"
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />
        <DashboardCard
          title="Suspicious Flags"
          value={stats.moderateRisk + stats.highRisk}
          description="Lookalikes, shortener masks, and credential keywords."
          icon={AlertTriangle}
          badge="Caution"
          badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
        />
        <DashboardCard
          title="Critical Intercepts"
          value={stats.criticalRisk}
          description="Known malicious indicators or confirmed synthetic CVEs."
          icon={ShieldAlert}
          badge="Critical"
          badgeColor="bg-rose-500/15 text-rose-400 border-rose-500/30"
        />
      </div>

      {/* Main Focus: Dual Core Inspection Center */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Command Bar Inspector & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Manual Destination Inspector
                </h3>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">SSRF SHIELD READY</span>
            </div>

            <URLInput onScan={handleQuickScan} loading={loading} />
          </div>

          {quickResult && (
            <SecurityReport report={quickResult} onReset={() => setQuickResult(null)} />
          )}

          {/* Recent Audit Feed */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Recent Audit Trail
                </h3>
              </div>
              <button
                onClick={() => onNavigate("history")}
                className="font-mono text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Full Audit Log</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-6 text-center font-mono text-xs text-zinc-600">
                NO AUDIT LOGS RECORDED YET IN THIS SESSION
              </div>
            ) : (
              <div className="space-y-2">
                {recentScans.slice(0, 4).map((scan) => {
                  const isCritical = scan.riskScore >= 75 || scan.riskClassification === "CRITICAL_RISK";
                  const isHigh = scan.riskScore >= 50 && scan.riskScore < 75;
                  const isModerate = scan.riskScore >= 25 && scan.riskScore < 50;

                  return (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs transition-colors hover:border-zinc-700"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-zinc-200 truncate">
                            {scan.normalizedHostname || scan.url}
                          </span>
                          <span className="rounded border border-zinc-800 px-1 font-mono text-[9px] uppercase text-zinc-500">
                            {scan.source}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-zinc-500 truncate pt-0.5">{scan.url}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${
                            isCritical
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                              : isHigh
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : isModerate
                              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
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

          {/* Zero-Trust Telemetry Advisory */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Zero-Trust Security Advisory</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Attacker stickers on physical parking meters and merchant stands are the #1 source of UPI quishing.
              Never authorize a PIN to <em>receive</em> funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
