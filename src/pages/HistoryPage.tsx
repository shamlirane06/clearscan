import { useState, useMemo, useEffect, useRef } from "react";
import {
  Download,
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MoreVertical,
  Globe,
  Link2,
  QrCode,
  AlertCircle,
  ShieldCheck,
  BarChart2,
  X,
  Copy,
  Check,
  Clock,
  Terminal,
} from "lucide-react";
import type { ScanHistoryItem } from "../types/scan";
import SecurityReport from "../components/SecurityReport";

interface HistoryPageProps {
  history: ScanHistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  reportView?: boolean;
  onNavigate?: (page: string) => void;
}

type DateRangeFilter = "7d" | "30d" | "90d" | "all" | "custom";
type StatusFilter = "ALL" | "LOW_RISK" | "SUSPICIOUS" | "DANGEROUS";

function getRiskStatus(item: ScanHistoryItem): "low" | "suspicious" | "dangerous" {
  if (
    item.riskClassification === "HIGH_RISK" ||
    item.riskClassification === "CRITICAL_RISK" ||
    item.status === "DANGEROUS" ||
    item.riskScore >= 70
  ) {
    return "dangerous";
  }
  if (
    item.riskClassification === "MODERATE_RISK" ||
    item.riskClassification === "UNABLE_TO_VERIFY" ||
    (item.riskScore >= 25 && item.riskScore < 70)
  ) {
    return "suspicious";
  }
  return "low";
}

function getRiskStatusLabel(status: "low" | "suspicious" | "dangerous"): string {
  switch (status) {
    case "low":
      return "Low Risk";
    case "suspicious":
      return "Suspicious";
    case "dangerous":
      return "Dangerous";
  }
}

function formatScanDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "Unknown Date";

  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

const DATE_OPTIONS: { id: DateRangeFilter; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom date range" },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All Scans" },
  { id: "LOW_RISK", label: "Low Risk" },
  { id: "SUSPICIOUS", label: "Suspicious" },
  { id: "DANGEROUS", label: "Dangerous" },
];

export default function HistoryPage({
  history,
  onClearHistory,
  onRemoveItem,
  reportView = false,
  onNavigate,
}: HistoryPageProps) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ScanHistoryItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ScanHistoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
      if (actionMenuId && !(e.target as HTMLElement).closest(".action-menu-container")) {
        setActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuId]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange, customStartDate, customEndDate, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard");
  };

  // Dynamic statistics derived from actual history
  const totalScans = history.length;
  const lowRiskCount = history.filter((i) => getRiskStatus(i) === "low").length;
  const needsReviewCount = history.filter((i) => getRiskStatus(i) !== "low").length;

  // Filtered scans
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    return history.filter((item) => {
      // 1. Search filter
      const term = search.trim().toLowerCase();
      if (term) {
        const matchesUrl = item.url.toLowerCase().includes(term);
        const matchesHost = item.normalizedHostname && item.normalizedHostname.toLowerCase().includes(term);
        if (!matchesUrl && !matchesHost) return false;
      }

      // 2. Status filter
      if (statusFilter !== "ALL") {
        const status = getRiskStatus(item);
        if (statusFilter === "LOW_RISK" && status !== "low") return false;
        if (statusFilter === "SUSPICIOUS" && status !== "suspicious") return false;
        if (statusFilter === "DANGEROUS" && status !== "dangerous") return false;
      }

      // 3. Date filter
      const itemTime = new Date(item.timestamp).getTime();
      if (!Number.isNaN(itemTime)) {
        if (dateRange === "7d") {
          if (itemTime < now - 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === "30d") {
          if (itemTime < now - 30 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === "90d") {
          if (itemTime < now - 90 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate).getTime();
            if (itemTime < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000;
            if (itemTime > end) return false;
          }
        }
      }

      return true;
    });
  }, [history, search, statusFilter, dateRange, customStartDate, customEndDate]);

  // Pagination calculation
  const totalFilteredScans = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredScans / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredHistory.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) {
      showToast("No scan records to export");
      return;
    }
    const headers = [
      "URL",
      "Scan Type",
      "Date & Time",
      "Risk Status",
      "Risk Score",
      "Normalized Hostname",
      "Risk Classification",
      "Timestamp",
    ];
    const rows = filteredHistory.map((item) => {
      const riskStatus = getRiskStatusLabel(getRiskStatus(item));
      const scanType = item.source === "qr" ? "QR Code" : "Link";
      const dateFormatted = formatScanDateTime(item.timestamp);
      const scoreStr = item.riskScore >= 0 ? `${item.riskScore}/100` : "N/A";
      const cleanUrl = item.url.replace(/"/g, '""');
      const cleanHost = (item.normalizedHostname || "").replace(/"/g, '""');
      const cleanClass = item.riskClassification || "";
      return `"${cleanUrl}","${scanType}","${dateFormatted}","${riskStatus}","${scoreStr}","${cleanHost}","${cleanClass}","${item.timestamp}"`;
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clearscan-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredHistory.length} scans to CSV`);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      onRemoveItem(deleteCandidate.id);
      showToast("Scan record removed from history");
      setDeleteCandidate(null);
    }
  };

  const dateRangeLabel =
    DATE_OPTIONS.find((o) => o.id === dateRange)?.label || "Date Filter";

  // Dedicated Reports view when navigated via Reports
  if (reportView) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#d5ddda] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-[#176b50]" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24322c]">
                Security Reports
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#65736d]">
              Review comprehensive security dossiers and threat checks stored in this browser.
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-[#176b50] hover:bg-[#155d46] px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Purge all local audit records? This action cannot be reversed.")) {
                    onClearHistory();
                    showToast("History cleared");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear history</span>
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d5ddda] bg-white p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-[#65736d]" />
            <h2 className="text-base font-semibold text-[#24322c]">No Reports Generated Yet</h2>
            <p className="mt-1 text-sm text-[#65736d]">
              Scan a destination or inspect a QR code to view its detailed security analysis.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate("dashboard")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#176b50] px-4 py-2 text-sm font-medium text-white hover:bg-[#155d46]"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#d5ddda] bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#e8edeb]">
                  <div>
                    <span className="text-xs font-semibold text-[#65736d] uppercase tracking-wider">
                      {item.source === "qr" ? "QR Code Scan" : "URL Scan"} · {formatScanDateTime(item.timestamp)}
                    </span>
                    <h3 className="text-lg font-semibold text-[#24322c]">{item.url}</h3>
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-center items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      getRiskStatus(item) === "low"
                        ? "bg-[#e8f2eb] text-[#1d8050]"
                        : getRiskStatus(item) === "suspicious"
                        ? "bg-[#f7efdf] text-[#b45309]"
                        : "bg-[#f7eae9] text-[#a84342]"
                    }`}
                  >
                    Score: {item.riskScore >= 0 ? `${item.riskScore}/100` : "—"} · {getRiskStatusLabel(getRiskStatus(item))}
                  </span>
                </div>
                <SecurityReport report={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Scan History view matching the reference specification exactly
  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#24322c] px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check className="h-4 w-4 text-[#1d8050]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Heading & Top-Right Export Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#24322c]">
            Scan History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#65736d]">
            Review and manage the URLs and QR codes you've checked.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176b50] hover:bg-[#155d46] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50] shrink-0"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Export History</span>
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Total Scans */}
        <div className="relative flex items-center justify-between rounded-xl border border-[#d5ddda] bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4f0e9] text-[#176b50]">
              <BarChart2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#65736d]">Total Scans</p>
              <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#24322c] tabular-nums">
                {totalScans}
              </p>
            </div>
          </div>
          {/* Green Sparkline */}
          <svg className="h-8 w-24 sm:w-28 shrink-0 overflow-visible" viewBox="0 0 110 32" fill="none" aria-hidden="true">
            <path
              d="M 2 24 C 20 25, 32 18, 52 20 C 72 22, 82 11, 96 13 C 102 14, 106 6, 109 4"
              stroke="#1d8050"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 2 24 C 20 25, 32 18, 52 20 C 72 22, 82 11, 96 13 C 102 14, 106 6, 109 4 L 109 32 L 2 32 Z"
              fill="#1d8050"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        {/* Card 2: Low-Risk Results */}
        <div className="relative flex items-center justify-between rounded-xl border border-[#d5ddda] bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4f0e9] text-[#176b50]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#65736d]">Low-Risk Results</p>
              <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#24322c] tabular-nums">
                {lowRiskCount}
              </p>
            </div>
          </div>
          {/* Green Sparkline */}
          <svg className="h-8 w-24 sm:w-28 shrink-0 overflow-visible" viewBox="0 0 110 32" fill="none" aria-hidden="true">
            <path
              d="M 2 26 C 18 24, 30 18, 50 19 C 68 20, 80 12, 94 13 C 101 14, 105 7, 109 3"
              stroke="#1d8050"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 2 26 C 18 24, 30 18, 50 19 C 68 20, 80 12, 94 13 C 101 14, 105 7, 109 3 L 109 32 L 2 32 Z"
              fill="#1d8050"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        {/* Card 3: Needs Review */}
        <div className="relative flex items-center justify-between rounded-xl border border-[#eadfc9] bg-[#fffaf2] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#faede0] text-[#b45309]">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#7c5e40]">Needs Review</p>
              <p className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#24322c] tabular-nums">
                {needsReviewCount}
              </p>
            </div>
          </div>
          {/* Amber Sparkline */}
          <svg className="h-8 w-24 sm:w-28 shrink-0 overflow-visible" viewBox="0 0 110 32" fill="none" aria-hidden="true">
            <path
              d="M 2 25 C 22 26, 36 17, 56 19 C 74 21, 84 10, 96 12 C 102 13, 106 6, 109 4"
              stroke="#b45309"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 2 25 C 22 26, 36 17, 56 19 C 74 21, 84 10, 96 12 C 102 13, 106 6, 109 4 L 109 32 L 2 32 Z"
              fill="#b45309"
              fillOpacity="0.08"
            />
          </svg>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-xl border border-[#d5ddda] bg-white p-3.5 sm:p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65736d]" />
            <input
              type="text"
              placeholder="Search URL or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#d5ddda] bg-white pl-10 pr-9 text-sm text-[#24322c] placeholder:text-[#65736d] outline-none focus:border-[#176b50] focus:ring-1 focus:ring-[#176b50] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#65736d] hover:text-[#24322c]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative shrink-0" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="inline-flex h-10 w-full sm:w-auto items-center justify-between gap-2.5 rounded-lg border border-[#d5ddda] bg-white px-3.5 text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] focus:outline-none focus:ring-2 focus:ring-[#176b50]/20 transition-colors"
              aria-expanded={dateDropdownOpen}
              aria-label="Filter by date range"
            >
              <Calendar className="h-4 w-4 text-[#65736d]" />
              <span>{dateRangeLabel}</span>
              <ChevronDown className="h-4 w-4 text-[#65736d]" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-60 rounded-xl border border-[#d5ddda] bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDateRange(opt.id);
                      if (opt.id !== "custom") setDateDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                      dateRange === opt.id
                        ? "bg-[#e4f0e9] font-medium text-[#176b50]"
                        : "text-[#24322c] hover:bg-[#f4f6f5]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {dateRange === opt.id && <Check className="h-3.5 w-3.5 text-[#176b50]" />}
                  </button>
                ))}

                {dateRange === "custom" && (
                  <div className="border-t border-[#e8edeb] mt-1.5 pt-2 px-2 pb-1 space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#65736d]">From</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="mt-0.5 w-full rounded border border-[#d5ddda] px-2 py-1 text-xs text-[#24322c] outline-none focus:border-[#176b50]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#65736d]">To</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="mt-0.5 w-full rounded border border-[#d5ddda] px-2 py-1 text-xs text-[#24322c] outline-none focus:border-[#176b50]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#176b50] text-white shadow-xs"
                    : "border border-[#d5ddda] bg-white text-[#4b5a53] hover:bg-[#f4f6f5]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scan History Table Container */}
      <div className="rounded-xl border border-[#d5ddda] bg-white overflow-hidden shadow-xs">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-[#65736d]" />
            <h2 className="text-base font-semibold text-[#24322c]">
              {history.length === 0 ? "No scan history recorded" : "No matching records found"}
            </h2>
            <p className="mt-1 text-sm text-[#65736d]">
              {history.length === 0
                ? "URLs and QR codes you inspect will automatically be archived here."
                : "No scans match your current search query or filter selection."}
            </p>
            {history.length === 0 && onNavigate && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="rounded-lg bg-[#176b50] px-4 py-2 text-sm font-medium text-white hover:bg-[#155d46] transition-colors"
                >
                  Inspect a URL
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("scanner")}
                  className="rounded-lg border border-[#d5ddda] bg-white px-4 py-2 text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] transition-colors"
                >
                  Scan QR code
                </button>
              </div>
            )}
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDateRange("all");
                  setStatusFilter("ALL");
                }}
                className="mt-4 rounded-lg border border-[#d5ddda] bg-white px-4 py-2 text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d5ddda] bg-[#fafbfb] text-[11px] sm:text-xs font-semibold tracking-wider text-[#4b5a53] uppercase">
                  <th scope="col" className="py-3.5 px-4 font-semibold">URL / DOMAIN</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">SCAN TYPE</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">DATE AND TIME</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">RISK STATUS</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">RISK SCORE</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold text-right sm:text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edeb]">
                {paginatedItems.map((item) => {
                  const status = getRiskStatus(item);
                  const isQr = item.source === "qr";
                  return (
                    <tr key={item.id} className="hover:bg-[#fafbfb] transition-colors">
                      {/* 1. URL / DOMAIN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs sm:max-w-md lg:max-w-sm xl:max-w-md">
                          {isQr ? (
                            <QrCode className="h-4 w-4 shrink-0 text-[#65736d]" aria-hidden="true" />
                          ) : (
                            <Globe className="h-4 w-4 shrink-0 text-[#65736d]" aria-hidden="true" />
                          )}
                          <span
                            className="truncate font-semibold text-sm text-[#24322c]"
                            title={item.url}
                          >
                            {item.url}
                          </span>
                        </div>
                      </td>

                      {/* 2. SCAN TYPE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-[#4b5a53]">
                          {isQr ? (
                            <>
                              <QrCode className="h-3.5 w-3.5 text-[#65736d]" aria-hidden="true" />
                              <span>QR Code</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="h-3.5 w-3.5 text-[#65736d]" aria-hidden="true" />
                              <span>Link</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 3. DATE AND TIME */}
                      <td className="py-3.5 px-4 text-sm text-[#4b5a53] whitespace-nowrap">
                        {formatScanDateTime(item.timestamp)}
                      </td>

                      {/* 4. RISK STATUS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            status === "low"
                              ? "bg-[#e8f2eb] text-[#1d8050]"
                              : status === "suspicious"
                              ? "bg-[#f7efdf] text-[#b45309]"
                              : "bg-[#f7eae9] text-[#a84342]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "low"
                                ? "bg-[#1d8050]"
                                : status === "suspicious"
                                ? "bg-[#b45309]"
                                : "bg-[#a84342]"
                            }`}
                            aria-hidden="true"
                          />
                          <span>{getRiskStatusLabel(status)}</span>
                        </span>
                      </td>

                      {/* 5. RISK SCORE */}
                      <td className="py-3.5 px-4 text-sm font-medium text-[#4b5a53] tabular-nums whitespace-nowrap">
                        {item.riskScore >= 0 ? `${item.riskScore} / 100` : "—"}
                      </td>

                      {/* 6. ACTIONS */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 action-menu-container">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewingItem(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5ddda] bg-white px-2.5 py-1 text-xs font-medium text-[#24322c] hover:bg-[#f4f6f5] hover:border-[#bcc8c3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#65736d]" aria-hidden="true" />
                            <span>View</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(item)}
                            className="inline-flex items-center justify-center rounded-lg border border-[#d5ddda] bg-white p-1 text-[#65736d] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            title="Delete scan"
                            aria-label={`Delete scan record for ${item.normalizedHostname || item.url}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>

                          {/* Three-dot dropdown menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenuId(actionMenuId === item.id ? null : item.id)
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-[#d5ddda] bg-white p-1 text-[#65736d] hover:bg-[#f4f6f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
                              title="More options"
                              aria-label="More options"
                              aria-expanded={actionMenuId === item.id}
                            >
                              <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            {actionMenuId === item.id && (
                              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-[#d5ddda] bg-white p-1 shadow-lg text-left animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingItem(item);
                                    setActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[#24322c] hover:bg-[#f4f6f5]"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#65736d]" />
                                  <span>View Report</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    copyUrl(item.url);
                                    setActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[#24322c] hover:bg-[#f4f6f5]"
                                >
                                  <Copy className="h-3.5 w-3.5 text-[#65736d]" />
                                  <span>Copy URL</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteCandidate(item);
                                    setActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Delete Record</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#d5ddda] px-4 py-3 bg-white text-xs sm:text-sm text-[#4b5a53]">
            <div>
              Showing {startIndex + 1}–
              {Math.min(startIndex + pageSize, totalFilteredScans)} of {totalFilteredScans} scans
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d5ddda] text-[#4b5a53] hover:bg-[#f4f6f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {getPageNumbers().map((page, idx) => {
                if (typeof page === "number") {
                  const isActive = currentPage === page;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 min-w-7 px-2 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#176b50] text-white"
                          : "border border-[#d5ddda] bg-white text-[#4b5a53] hover:bg-[#f4f6f5]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                }
                return (
                  <span key={idx} className="px-1 text-[#65736d]">
                    …
                  </span>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d5ddda] text-[#4b5a53] hover:bg-[#f4f6f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Detailed Report Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-[#d5ddda] bg-white shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-[#d5ddda] px-6 py-4 bg-[#fafbfb]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                  Detailed Scan Report
                </h3>
                <p className="text-xs text-[#65736d] font-mono mt-0.5 truncate max-w-md">
                  {viewingItem.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="rounded-lg p-1.5 text-[#65736d] hover:bg-[#e8edeb] hover:text-[#24322c] transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <SecurityReport report={viewingItem} />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d5ddda] px-6 py-3.5 bg-[#fafbfb]">
              <button
                type="button"
                onClick={() => copyUrl(viewingItem.url)}
                className="rounded-lg border border-[#d5ddda] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] transition-colors"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="rounded-lg bg-[#176b50] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46] transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#d5ddda] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#24322c]">Delete Scan Record</h3>
            </div>
            <p className="text-sm text-[#4b5a53] leading-relaxed">
              Are you sure you want to delete the record for:
            </p>
            <p className="my-2 truncate rounded-lg bg-[#f4f6f5] px-3 py-2 font-mono text-xs text-[#24322c] border border-[#d5ddda]">
              {deleteCandidate.url}
            </p>
            <p className="text-xs text-[#65736d]">
              This action cannot be undone. Summary statistics will update immediately.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="rounded-lg border border-[#d5ddda] bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
