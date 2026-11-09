import { useState } from "react";
import {
  History,
  Trash2,
  Search,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Terminal,
} from "lucide-react";
import type { ScanHistoryItem } from "../types/scan";
import SecurityReport from "../components/SecurityReport";

interface HistoryPageProps {
  history: ScanHistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  reportView?: boolean;
}

export default function HistoryPage({
  history,
  onClearHistory,
  onRemoveItem,
  reportView = false,
}: HistoryPageProps) {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      item.normalizedHostname.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterLevel === "ALL") return true;
    if (filterLevel === "LOW") return item.riskClassification === "LOW_RISK";
    if (filterLevel === "MODERATE") return item.riskClassification === "MODERATE_RISK";
    if (filterLevel === "UNABLE") return item.riskClassification === "UNABLE_TO_VERIFY";
    if (filterLevel === "HIGH_OR_CRITICAL")
      return (
        item.riskClassification === "HIGH_RISK" ||
        item.riskClassification === "CRITICAL_RISK"
      );
    return true;
  });

  const exportCsv = () => {
    if (history.length === 0) return;
    const headers = "id,url,hostname,riskScore,classification,status,timestamp\n";
    const rows = history
      .map(
        (h) =>
          `"${h.id}","${h.url}","${h.normalizedHostname}",${h.riskScore},"${h.riskClassification}","${h.status}","${h.timestamp}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clearscan-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Terminal className="h-5 w-5 text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {reportView ? "Reports" : "Scan history"}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {reportView
              ? "Security reports from scans stored in this browser."
              : "Only destination origins and redacted check summaries are saved in this browser. Clear history below to remove them."}
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm("Purge all local audit records? This action cannot be reversed.")) {
                  onClearHistory();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved destination hostname..."
            aria-label="Search scan history"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-700/80 bg-slate-950 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Risk Filter:</span>
          <select
            aria-label="Filter scan history by risk"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-10 rounded-lg border border-slate-700/80 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-teal-500"
          >
            <option value="ALL">All Records ({history.length})</option>
            <option value="LOW">Low Risk Only</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH_OR_CRITICAL">High &amp; Critical Only</option>
            <option value="UNABLE">Unable to Verify</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Card List */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <History className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300">
            No Records Found
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {history.length === 0
              ? "Scan a QR code or inspect a URL to generate your first audit record."
              : "No records match your active search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const isCritical = item.riskScore >= 75 || item.riskClassification === "CRITICAL_RISK";
            const isHigh = item.riskScore >= 50 && item.riskScore < 75;
            const isModerate = item.riskScore >= 25 && item.riskScore < 50;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm transition-colors hover:border-slate-700"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-white truncate">
                        {item.normalizedHostname || item.url}
                      </span>
                      <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.2 text-[10px] uppercase font-semibold text-slate-400">
                        {item.source}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-slate-400">{item.url}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      {item.warnings && item.warnings.length > 0 && (
                        <span className="text-amber-400 font-medium">
                          {item.warnings.length} warning(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        isCritical
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                          : isHigh
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : isModerate
                          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      Score: {item.riskScore >= 0 ? item.riskScore : "—"}
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <span>{isExpanded ? "Hide report" : "View report"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete scan for ${item.normalizedHostname || item.url}`}
                      className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-rose-500/30 hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/60 p-5">
                    <SecurityReport report={item} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
