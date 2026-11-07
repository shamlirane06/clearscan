import { useState } from "react";
import {
  History,
  Trash2,
  Search,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            Scan History &amp; Risk Insights
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Privacy-First Storage &bull; Scans remain strictly in your browser&apos;s localStorage
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your local scan history?")) {
                onClearHistory();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Local History
          </button>
        )}
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search scanned domains or URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-4 text-xs text-zinc-800 outline-none focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">Filter:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-medium text-zinc-700 outline-none focus:border-emerald-700"
          >
            <option value="ALL">All Risk Levels ({history.length})</option>
            <option value="LOW">Low Risk Only</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH_OR_CRITICAL">High &amp; Critical Risk</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <History className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
          <h4 className="text-sm font-semibold text-zinc-800">No matching scan records</h4>
          <p className="mt-1 text-xs text-zinc-500">
            {history.length === 0
              ? "Start by inspecting a QR code or pasting a URL on the dashboard."
              : "Try adjusting your search query or risk filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const isCritical = item.riskScore >= 75 || item.riskClassification === "CRITICAL_RISK";
            const isHigh = item.riskScore >= 50 && item.riskScore < 75;
            const isModerate = item.riskScore >= 25 && item.riskScore < 50;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-all"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 truncate">
                        {item.normalizedHostname || item.url}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 border border-zinc-200 rounded px-1.5">
                        {item.source}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">{item.url}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      {item.warnings && item.warnings.length > 0 && (
                        <span className="text-amber-700 font-medium">
                          {item.warnings.length} warning(s) detected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        isCritical
                          ? "bg-rose-100 text-rose-800"
                          : isHigh
                          ? "bg-amber-100 text-amber-800"
                          : isModerate
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      Score: {item.riskScore >= 0 ? item.riskScore : "—"}
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      {isExpanded ? "Hide" : "Details"}
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-lg p-1 text-zinc-400 hover:text-rose-600"
                      title="Delete this record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-4">
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
