import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldAlert } from "lucide-react";
import type { SecurityCheckResult } from "../types/scan";

interface SecurityCheckItemProps {
  check: SecurityCheckResult;
}

export default function SecurityCheckItem({ check }: SecurityCheckItemProps) {
  const isPass = check.passed;
  const isCritical = check.riskLevel === "CRITICAL";
  const isHigh = check.riskLevel === "HIGH";
  const isWarning = check.riskLevel === "WARNING" || check.riskLevel === "MEDIUM";

  let statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let statusText = "PASSED";

  if (isCritical) {
    statusBadge = "bg-rose-500/15 text-rose-400 border-rose-500/30";
    statusText = "CRITICAL THREAT";
  } else if (isHigh) {
    statusBadge = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    statusText = "SUSPICIOUS";
  } else if (isWarning) {
    statusBadge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    statusText = "WARNING";
  } else if (check.riskLevel === "INFO") {
    statusBadge = "bg-zinc-800 text-zinc-400 border-zinc-700";
    statusText = "INFO";
  }

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        isCritical
          ? "border-rose-500/30 bg-rose-950/20"
          : !isPass
          ? "border-amber-500/20 bg-amber-950/15"
          : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isCritical ? (
              <AlertOctagon className="h-4 w-4 text-rose-400" />
            ) : isHigh ? (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            ) : isWarning ? (
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            ) : check.riskLevel === "INFO" ? (
              <Info className="h-4 w-4 text-zinc-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-semibold tracking-wide text-zinc-200">
                {check.checkName}
              </h5>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">{check.explanation}</p>

            {check.evidence && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 font-mono text-[11px] text-zinc-300">
                <span className="text-zinc-500">evidence:</span>
                <span>{check.evidence}</span>
              </div>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${statusBadge}`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
