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

  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let statusText = "Passed";

  if (isCritical) {
    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
    statusText = "Critical Threat";
  } else if (isHigh) {
    statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
    statusText = "Suspicious";
  } else if (isWarning) {
    statusBadge = "bg-amber-50/70 text-amber-700 border-amber-200";
    statusText = "Warning";
  } else if (check.riskLevel === "INFO") {
    statusBadge = "bg-zinc-50 text-zinc-600 border-zinc-200";
    statusText = "Info";
  }

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        isCritical
          ? "border-rose-200 bg-rose-50/30"
          : !isPass
          ? "border-amber-200 bg-amber-50/20"
          : "border-zinc-200/80 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {isCritical ? (
              <AlertOctagon className="h-5 w-5 text-rose-600" />
            ) : isHigh ? (
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            ) : isWarning ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : check.riskLevel === "INFO" ? (
              <Info className="h-5 w-5 text-zinc-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div>
            <h5 className="text-sm font-semibold text-zinc-900">{check.checkName}</h5>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">{check.explanation}</p>

            {check.evidence && (
              <div className="mt-2 rounded-md bg-zinc-100/80 px-2 py-1 font-mono text-[11px] text-zinc-700">
                <span className="font-semibold text-zinc-500">Evidence: </span>
                {check.evidence}
              </div>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadge}`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
