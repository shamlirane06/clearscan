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
}

export default function HistoryPage({
  history,
  onClearHistory,
  onRemoveItem,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Audit Trail &amp; Telemetry Logs
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Privacy-Preserving Client Storage &bull; Indexed in local storage
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 font-mono text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Purge Log</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search domain, host or full URL query..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-9 pr-4 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-mono text-xs text-zinc-500">Tier:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-xs text-zinc-300 outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Records ({history.length})</option>
            <option value="LOW">Low Risk Only</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH_OR_CRITICAL">High &amp; Critical Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Card List */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <History className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
            No Records Found
          </h4>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
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
                className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 shadow-sm transition-all hover:border-zinc-700/80"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white truncate">
                        {item.normalizedHostname || item.url}
                      </span>
                      <span className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.2 font-mono text-[9px] uppercase font-semibold text-zinc-400">
                        {item.source}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-zinc-400">{item.url}</p>
                    <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      {item.warnings && item.warnings.length > 0 && (
                        <span className="text-amber-400 font-semibold">
                          {item.warnings.length} warning(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    <span
                      className={`rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                        isCritical
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                          : isHigh
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : isModerate
                          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      SCORE: {item.riskScore >= 0 ? item.riskScore : "—"}
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                    >
                      <span>{isExpanded ? "COLLAPSE" : "INSPECT"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-lg border border-zinc-800 p-1 text-zinc-500 hover:border-rose-500/30 hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
                      title="Delete log record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-950/50 p-4">
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
