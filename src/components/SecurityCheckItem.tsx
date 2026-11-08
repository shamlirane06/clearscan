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

  let statusBadge = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  let statusText = "Passed";

  if (isCritical) {
    statusBadge = "bg-rose-500/15 text-rose-300 border-rose-500/30";
    statusText = "Critical Threat";
  } else if (isHigh) {
    statusBadge = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    statusText = "Suspicious";
  } else if (isWarning) {
    statusBadge = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    statusText = "Warning";
  } else if (check.riskLevel === "INFO") {
    statusBadge = "bg-slate-800 text-slate-300 border-slate-700";
    statusText = "Info";
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isCritical
          ? "border-rose-500/30 bg-rose-950/20"
          : !isPass
          ? "border-amber-500/30 bg-amber-950/15"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isCritical ? (
              <AlertOctagon className="h-5 w-5 text-rose-400" />
            ) : isHigh ? (
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            ) : isWarning ? (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            ) : check.riskLevel === "INFO" ? (
              <Info className="h-5 w-5 text-slate-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-medium text-slate-200">
              {check.checkName}
            </h5>
            <p className="text-xs leading-relaxed text-slate-400">{check.explanation}</p>

            {check.evidence && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                <span className="text-slate-400 font-medium">Evidence:</span>
                <span className="font-mono text-[11px] text-teal-300">{check.evidence}</span>
              </div>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadge}`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
