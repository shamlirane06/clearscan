import { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import URLInput from "../components/URLInput";
import SecurityReport from "../components/SecurityReport";
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
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-emerald-950 to-zinc-950 p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute right-0 top-0 -z-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Hackathon Edition &bull; Intelligent Multi-Layer Protection
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Scan Before You Trust.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-emerald-100/80 sm:text-base">
            Every day, thousands fall prey to disguised QR codes and deceptive links. ClearScan
            evaluates destination anatomy, brand lookalikes, URL shorteners, and threat intelligence
            before you navigate.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("scanner")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm transition-all hover:bg-emerald-400"
            >
              <QrCode className="h-4 w-4" />
              Open Camera Scanner
            </button>

            <button
              onClick={() => onNavigate("learn")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-white/20"
            >
              <GraduationCap className="h-4 w-4" />
              Interactive Safety Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Inspected"
          value={stats.total}
          description="Total links and QR codes evaluated in this session."
          icon={ShieldCheck}
          badge="Local History"
          badgeColor="bg-emerald-100 text-emerald-800"
        />
        <DashboardCard
          title="Safe / Low Risk"
          value={stats.lowRisk}
          description="URLs passing all multi-layer heuristic security checks."
          icon={ShieldCheck}
          badge="Passed"
          badgeColor="bg-emerald-100 text-emerald-800"
        />
        <DashboardCard
          title="Suspicious / Moderate"
          value={stats.moderateRisk + stats.highRisk}
          description="Flagged for lookalike domains, shorteners, or phishing keywords."
          icon={AlertTriangle}
          badge="Caution"
          badgeColor="bg-amber-100 text-amber-800"
        />
        <DashboardCard
          title="Critical / Threats"
          value={stats.criticalRisk}
          description="Known malicious indicators or confirmed threat detections."
          icon={ShieldAlert}
          badge="High Alert"
          badgeColor="bg-rose-100 text-rose-800"
        />
      </div>

      {/* Quick URL Input Section & Results */}
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-bold text-emerald-950">Quick Security Scan</h3>
            <p className="mt-0.5 text-xs text-zinc-500 mb-4">
              Enter any URL or select a synthetic test case to evaluate immediately.
            </p>

            <URLInput onScan={handleQuickScan} loading={loading} />
          </div>

          {quickResult && (
            <SecurityReport report={quickResult} onReset={() => setQuickResult(null)} />
          )}
        </div>

        {/* Recent Scans Activity Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate("history")}
                className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center text-xs text-zinc-500">
                <Clock className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
                No scans recorded yet in this local session.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentScans.slice(0, 4).map((scan) => {
                  const isHigh =
                    scan.riskClassification === "CRITICAL_RISK" ||
                    scan.riskClassification === "HIGH_RISK";
                  return (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-900">
                          {scan.normalizedHostname || scan.url}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(scan.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isHigh
                            ? "bg-rose-100 text-rose-800"
                            : scan.riskClassification === "MODERATE_RISK"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        Score: {scan.riskScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Awareness Card */}
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-950">
              <ShieldCheck className="h-4 w-4 text-emerald-800" />
              Security Awareness Tip
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700">
              Scammers often use fake QR codes on parking meters and merchant stands. If a QR code
              prompts you to enter your UPI PIN or banking password to <strong>receive</strong> a
              refund or payment, cancel immediately!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
