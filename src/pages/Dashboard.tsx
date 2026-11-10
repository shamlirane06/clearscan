import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  AlertTriangle,
  AlertCircle,
  Link2,
  QrCode,
  ShieldCheck,
  BarChart2,
  History,
  X,
} from "lucide-react";
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

function getRiskCategory(classification: ScanHistoryItem["riskClassification"]) {
  switch (classification) {
    case "LOW_RISK":
      return {
        label: "Low Risk",
        desc: "Safe",
        tone: "low" as const,
        pillStyle: "bg-[#e2f1e8] text-[#176b50]",
        iconType: "safe" as const,
      };
    case "MODERATE_RISK":
    case "UNABLE_TO_VERIFY":
      return {
        label: "Suspicious",
        desc: "Potential Risk",
        tone: "suspicious" as const,
        pillStyle: "bg-[#fceddc] text-[#c2621a]",
        iconType: "suspicious" as const,
      };
    case "HIGH_RISK":
    case "CRITICAL_RISK":
      return {
        label: "Dangerous",
        desc: "High Risk",
        tone: "dangerous" as const,
        pillStyle: "bg-[#fde8e8] text-[#dc2626]",
        iconType: "dangerous" as const,
      };
  }
}

function formatScanTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "recently";

  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 60 * 60_000) {
    const mins = Math.floor(elapsed / 60_000);
    return `${mins} min ago`;
  }
  if (elapsed < 24 * 60 * 60_000) {
    const hrs = Math.floor(elapsed / (60 * 60_000));
    return `${hrs} hr ago`;
  }
  if (elapsed < 7 * 24 * 60 * 60_000) {
    const days = Math.floor(elapsed / (24 * 60 * 60_000));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getRecentTrend(
  history: ScanHistoryItem[],
  include: (scan: ScanHistoryItem) => boolean
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
      return (
        include(scan) &&
        !Number.isNaN(timestamp.getTime()) &&
        timestamp >= day &&
        timestamp < nextDay
      );
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
  const reviewTrend = getRecentTrend(
    recentScans,
    (scan) => scan.riskClassification !== "LOW_RISK"
  );
  const lowRiskTrend = getRecentTrend(
    recentScans,
    (scan) => scan.riskClassification === "LOW_RISK"
  );

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

  const needsReviewTotal =
    stats.moderateRisk + stats.highRisk + stats.criticalRisk + stats.unableToVerify;

  // Fallback demo items matching the design spec if local history is fresh
  const displayScans: ScanHistoryItem[] = recentScans.length > 0 ? recentScans.slice(0, 3) : [
    {
      id: "demo-1",
      url: "https://google.com",
      normalizedHostname: "google.com",
      status: "SAFE",
      riskScore: 5,
      riskClassification: "LOW_RISK",
      riskMessage: "Safe destination",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "demo-2",
      url: "http://suspicious-link.xyz",
      normalizedHostname: "suspicious-link.xyz",
      status: "SAFE",
      riskScore: 45,
      riskClassification: "MODERATE_RISK",
      riskMessage: "Potential Risk",
      message: "Potential Risk",
      securityChecks: [],
      warnings: ["Suspicious domain pattern"],
      recommendedAction: "Proceed with caution",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      threatIntelligenceAvailable: false,
      source: "url",
    },
    {
      id: "demo-3",
      url: "https://github.com",
      normalizedHostname: "github.com",
      status: "SAFE",
      riskScore: 0,
      riskClassification: "LOW_RISK",
      riskMessage: "Safe destination",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between min-h-0 space-y-2 xl:space-y-2.5">
      {/* 1. Welcome Section */}
      <header className="shrink-0">
        <p className="text-xs font-semibold text-[#176b50]">Welcome back!</p>
        <h1 className="mt-0.5 text-xl sm:text-2xl xl:text-[26px] font-bold tracking-tight text-[#24322c] leading-tight">
          Check before you open
        </h1>
        <p className="mt-0.5 text-xs text-[#65736d]">
          Scan suspicious links and QR codes to stay safe online.
        </p>
      </header>

      {/* 2. Main Scanning Section (Slim & Compact to give room to graph and recent scans) */}
      <section className="shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 xl:gap-3 items-stretch" aria-label="Scan Link or QR Code">
        {/* Left Card: Inspect a destination */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-xl border border-[#d5ddda] bg-white p-2.5 sm:p-3 xl:p-3.5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5 xl:mb-2">
              <span className="flex h-7 w-7 sm:h-7.5 sm:w-7.5 shrink-0 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50]">
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm sm:text-[15px] font-bold text-[#24322c] leading-tight">Inspect a destination</h2>
                <p className="text-[11px] text-[#65736d] mt-0.5 leading-none">
                  Paste a URL to analyze its safety or scan a QR code instead.
                </p>
              </div>
            </div>
            <URLInput onScan={handleQuickScan} loading={loading} />
          </div>
        </div>

        {/* Right Card: Check a QR code */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between text-center rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-2.5 sm:p-3 xl:p-3.5 shadow-xs">
          <div className="flex flex-col items-center">
            <span className="mb-0.5 flex h-7.5 w-7.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#dbece1] text-[#176b50]">
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm sm:text-[15px] font-bold text-[#24322c] leading-tight">Check a QR code</h2>
            <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-[#65736d] max-w-[210px] leading-tight">
              Open the camera scanner or choose a QR image from your device.
            </p>
          </div>

          <div className="w-full my-1 flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate("scanner")}
              className="inline-flex h-8 xl:h-8.5 w-full max-w-[210px] items-center justify-center gap-1.5 rounded-lg border border-[#176b50] bg-white px-3 text-xs sm:text-[13px] font-semibold text-[#176b50] shadow-xs transition-colors hover:bg-[#f4f9f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Open QR Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <p className="flex items-center justify-center gap-1 text-[10px] sm:text-[10.5px] text-[#65736d] leading-none">
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#176b50]" aria-hidden="true" />
            <span>Your camera stays off until you choose to scan.</span>
          </p>
        </div>
      </section>

      {/* Immediate scan result report (displayed as a focused modal overlay so layout does not expand or scroll) */}
      {quickResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8edeb]">
              <h3 className="text-base sm:text-lg font-bold text-[#24322c]">Scan Analysis Result</h3>
              <button
                type="button"
                onClick={() => setQuickResult(null)}
                className="rounded-lg p-1.5 text-[#65736d] hover:bg-[#f4f6f5] hover:text-[#24322c] transition-colors"
                aria-label="Close report"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <SecurityReport report={quickResult} onReset={() => setQuickResult(null)} />
          </div>
        </div>
      )}

      {/* 3. Statistics Cards (Order: Total scans, Needs review, Low-risk results) */}
      <section className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-2.5 xl:gap-3.5" aria-label="Local scan totals">
        {/* Card 1: Total scans */}
        <DashboardCard
          title="Total scans"
          value={stats.total}
          description="Links and QR codes checked in this browser."
          icon={BarChart2}
          tone="brand"
          trend={totalTrend}
        />

        {/* Card 2: Needs review */}
        <DashboardCard
          title="Needs review"
          value={needsReviewTotal}
          description="Warning signs or incomplete checks."
          icon={AlertTriangle}
          tone="warning"
          trend={reviewTrend}
        />

        {/* Card 3: Low-risk results */}
        <DashboardCard
          title="Low-risk results"
          value={stats.lowRisk}
          description="No concerning patterns found."
          icon={ShieldCheck}
          tone="brand"
          trend={lowRiskTrend}
        />
      </section>

      {/* 4. Bottom Dashboard Section (Two Columns) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 xl:gap-3.5 items-stretch">
        {/* Left Column: Scan activity card */}
        <div className="lg:col-span-7 min-h-0 flex flex-col">
          <ActivityChart history={recentScans} />
        </div>

        {/* Right Column: Recent scans card */}
        <section
          className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#d5ddda] bg-white p-3.5 xl:p-4 shadow-xs min-h-0 h-full"
          aria-labelledby="recent-scans-title"
        >
          <div className="min-h-0 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#edf2ef] shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50]">
                  <History className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 id="recent-scans-title" className="text-sm sm:text-base font-bold text-[#24322c]">
                  Recent scans
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("history")}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#176b50] hover:text-[#155d46] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Scans List matching uploaded screenshot */}
            <ul aria-label="Latest scan results" className="divide-y divide-[#edf2ef] my-auto">
              {displayScans.map((scan) => {
                const meta = getRiskCategory(scan.riskClassification);

                return (
                  <li key={scan.id} className="flex items-center justify-between gap-2.5 py-2.5 xl:py-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {meta.iconType === "safe" && (
                        <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[#1d8050] text-white">
                          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                        </span>
                      )}
                      {meta.iconType === "suspicious" && (
                        <AlertTriangle className="h-5.5 w-5.5 shrink-0 fill-[#c2621a] text-white" aria-hidden="true" />
                      )}
                      {meta.iconType === "dangerous" && (
                        <AlertCircle className="h-5.5 w-5.5 shrink-0 fill-[#dc2626] text-white" aria-hidden="true" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-xs sm:text-[13px] font-semibold text-[#24322c] leading-tight"
                          title={scan.url}
                        >
                          {scan.url}
                        </p>
                        <p className="text-[11px] text-[#65736d] leading-none mt-1">
                          {meta.desc} • {formatScanTime(scan.timestamp)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${meta.pillStyle}`}
                    >
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
