import { useState } from "react";
import { ArrowRight, Camera, CheckCircle, HelpCircle, LinkChain, QrCodeMark, ScanHistory, ShieldCheck, WarningShield, WarningTriangle } from "../components/icons/ClearScanIcons";
import DashboardCard from "../components/DashboardCard";
import ActivityChart from "../components/ActivityChart";
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

function classificationLabel(classification: ScanHistoryItem["riskClassification"]) {
  switch (classification) {
    case "LOW_RISK": return "Low risk";
    case "MODERATE_RISK": return "Needs review";
    case "HIGH_RISK": return "High risk";
    case "CRITICAL_RISK": return "Critical risk";
    case "UNABLE_TO_VERIFY": return "Unable to verify";
  }
}

function classificationStyle(classification: ScanHistoryItem["riskClassification"]) {
  switch (classification) {
    case "LOW_RISK": return { badge: "bg-emerald-950 text-emerald-200", icon: "text-emerald-400" };
    case "MODERATE_RISK": return { badge: "bg-amber-950 text-amber-200", icon: "text-amber-300" };
    case "HIGH_RISK":
    case "CRITICAL_RISK": return { badge: "bg-rose-950 text-rose-300", icon: "text-rose-300" };
    case "UNABLE_TO_VERIFY": return { badge: "bg-slate-800 text-slate-300", icon: "text-slate-500" };
  }
}

function formatScanTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 60 * 60_000) return `${Math.floor(elapsed / 60_000)} min ago`;
  if (elapsed < 24 * 60 * 60_000) return `${Math.floor(elapsed / (60 * 60_000))} hr ago`;
  if (elapsed < 7 * 24 * 60 * 60_000) return `${Math.floor(elapsed / (24 * 60 * 60_000))} day${elapsed >= 2 * 24 * 60 * 60_000 ? "s" : ""} ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function getRecentTrend(
  history: ScanHistoryItem[],
  include: (scan: ScanHistoryItem) => boolean,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    return history.filter((scan) => {
      const timestamp = new Date(scan.timestamp);
      return include(scan) && !Number.isNaN(timestamp.getTime()) && timestamp >= day && timestamp < nextDay;
    }).length;
  });
}

export default function Dashboard({
  stats,
  recentScans,
  onNavigate,
  onScanComplete,
}: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<BackendScanResponse | null>(null);
  const totalTrend = getRecentTrend(recentScans, () => true);
  const reviewTrend = getRecentTrend(recentScans, (scan) => scan.riskClassification !== "LOW_RISK");
  const lowRiskTrend = getRecentTrend(recentScans, (scan) => scan.riskClassification === "LOW_RISK");

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
    <div className="dashboard-layout min-w-0 w-full space-y-3">
      <header className="xl:pb-3">
        <p className="text-base font-semibold text-teal-700">Welcome</p>
        <h1 className="mt-0 text-3xl font-semibold leading-tight tracking-tight text-slate-100 lg:text-[40px]">
          Check before you open
        </h1>
        <p className="mt-1 text-base leading-6 text-slate-300 sm:text-lg">
          Scan suspicious links and QR codes to stay safe online.
        </p>
      </header>

      <section className="grid min-w-0 items-start gap-4 lg:grid-cols-12" aria-label="Start a safety check">
        <div className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5 lg:col-span-8">
          <div className="mb-4 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-950 text-teal-700">
              <LinkChain className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-100 xl:text-xl">Inspect a destination</h2>
              <p className="mt-1 text-sm leading-5 text-slate-400 xl:text-base">
                Paste a URL to analyze its safety or scan a QR code instead.
              </p>
            </div>
          </div>
          <URLInput onScan={handleQuickScan} loading={loading} />
        </div>

        <aside className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-teal-600/15 bg-teal-950 p-4 text-center sm:p-5 xl:pb-7 lg:col-span-4" aria-labelledby="qr-entry-title">
          <span className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-teal-700">
            <QrCodeMark className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 id="qr-entry-title" className="text-lg font-semibold text-slate-100 xl:text-xl">Check a QR code</h2>
          <p className="mt-1 max-w-xs text-sm leading-5 text-slate-400 xl:text-base">
            Open the camera scanner or choose a QR image from your device.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("scanner")}
            className="mt-2 inline-flex min-h-10 w-full max-w-80 items-center justify-center gap-2 rounded-lg border border-teal-700 bg-slate-900 px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span>Open QR scanner</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="mt-1 flex items-center gap-1.5 text-xs leading-4 text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" />
            Your camera stays off until you choose to scan.
          </p>
        </aside>
      </section>

      {loading && (
        <p className="dashboard-feedback -mt-2 text-sm text-slate-400" role="status" aria-live="polite">
          Checking the link…
        </p>
      )}

      {quickResult && (
        <div className="dashboard-feedback min-w-0">
          <SecurityReport report={quickResult} onReset={() => setQuickResult(null)} />
        </div>
      )}

      <section className="grid min-w-0 gap-4 md:grid-cols-3" aria-label="Local scan totals">
        <DashboardCard
          title="Total scans"
          value={stats.total}
          description="Checks run in this browser."
          icon={LinkChain}
          trend={totalTrend}
        />
        <DashboardCard
          title="Needs review"
          value={stats.moderateRisk + stats.highRisk + stats.criticalRisk + stats.unableToVerify}
          description="Warnings or incomplete checks."
          icon={WarningShield}
          tone="warning"
          trend={reviewTrend}
        />
        <DashboardCard
          title="Low-risk results"
          value={stats.lowRisk}
          description="No warning patterns found; use care."
          icon={ShieldCheck}
          trend={lowRiskTrend}
        />
      </section>

      <div className="dashboard-lower-grid grid min-w-0 items-stretch gap-3 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <ActivityChart history={recentScans} />
        </div>
        <section className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 p-4 lg:col-span-5" aria-labelledby="recent-scans-title">
          <div className="flex items-center justify-between gap-3 pb-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-950 text-teal-700">
                <ScanHistory className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 id="recent-scans-title" className="text-lg font-semibold text-slate-100">Recent scans</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("history")}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-teal-700 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {recentScans.length === 0 ? (
            <div className="flex min-h-20 items-center gap-3 py-3" role="status">
              <ScanHistory className="h-[18px] w-[18px] shrink-0 text-slate-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-slate-300">No recent scans</p>
                <p className="mt-0.5 text-sm text-slate-400">Check a link or QR code to see it here.</p>
              </div>
            </div>
          ) : (
            <ul aria-label="Latest scan results" className="divide-y divide-slate-700">
              {recentScans.slice(0, 3).map((scan) => {
                const appearance = classificationStyle(scan.riskClassification);
                const StatusIcon = scan.riskClassification === "LOW_RISK"
                  ? CheckCircle
                  : scan.riskClassification === "UNABLE_TO_VERIFY" ? HelpCircle : WarningTriangle;
                const sourceLabel = scan.source === "qr" ? "QR code" : scan.source === "message" ? "Message" : "Link";

                return (
                  <li key={scan.id} className="flex min-w-0 items-center gap-3 py-2 xl:py-1.5">
                    <StatusIcon className={`h-[18px] w-[18px] shrink-0 ${appearance.icon}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-5 text-slate-100 xl:text-base" title={scan.url}>
                        {scan.url}
                      </p>
                      <p className="truncate text-xs leading-4 text-slate-400 xl:text-sm" title={scan.url}>
                        {sourceLabel} · {formatScanTime(scan.timestamp)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${appearance.badge}`}>
                      {classificationLabel(scan.riskClassification)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
