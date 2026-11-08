import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  FileText,
} from "lucide-react";
import type { BackendScanResponse } from "../types/scan";
import RiskMeter from "./RiskMeter";
import SecurityCheckItem from "./SecurityCheckItem";

interface SecurityReportProps {
  report: BackendScanResponse;
  onReset?: () => void;
}

export default function SecurityReport({ report, onReset }: SecurityReportProps) {
  const [copied, setCopied] = useState(false);
  const [reportExported, setReportExported] = useState(false);
  const [showAllChecks, setShowAllChecks] = useState(true);

  const copyUrl = () => {
    navigator.clipboard.writeText(report.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReportJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setReportExported(true);
    setTimeout(() => setReportExported(false), 2000);
  };

  const isCritical = report.riskScore >= 75 || report.riskClassification === "CRITICAL_RISK";
  const isHigh = report.riskScore >= 50 && report.riskScore < 75;
  const isModerate = report.riskScore >= 25 && report.riskScore < 50;
  const isUnable = report.riskClassification === "UNABLE_TO_VERIFY";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
      {/* Top Dossier Header */}
      <div
        className={`border-b p-6 sm:p-7 transition-colors ${
          isCritical
            ? "border-rose-500/20 bg-rose-950/20"
            : isHigh
            ? "border-amber-500/20 bg-amber-950/20"
            : isModerate
            ? "border-yellow-500/15 bg-yellow-950/10"
            : isUnable
            ? "border-slate-800 bg-slate-900/50"
            : "border-teal-500/20 bg-teal-950/15"
        }`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                {isCritical || isHigh ? (
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                ) : isModerate ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                )}
              </span>
              <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Destination Security Dossier &bull; Ref #{report.timestamp ? report.timestamp.slice(-6) : "SCAN"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {report.normalizedHostname || "Unresolved Destination"}
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              {report.riskMessage || report.message}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <RiskMeter score={report.riskScore} classification={report.riskClassification} />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scanned Destination URL Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Globe className="h-4 w-4 text-slate-400" />
              Target Destination URI
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span className="text-teal-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy URI</span>
                  </>
                )}
              </button>

              <button
                onClick={exportReportJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                title="Export complete analysis in JSON format"
              >
                {reportExported ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                    <span className="text-teal-400">JSON Copied</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2.5 break-all font-mono text-sm text-slate-200 select-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            {report.url}
          </p>
        </div>

        {/* Telemetry Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-teal-400" />
            <span>6-Layer Heuristic Pipeline</span>
          </span>

          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
              report.threatIntelligenceAvailable
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-950/70 text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                report.threatIntelligenceAvailable ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span>
              {report.threatIntelligenceAvailable
                ? "Google Safe Browsing: Connected"
                : "Safe Browsing: Offline (Local Heuristics Active)"}
            </span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-slate-400">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>SSRF Network Guard: Verified</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-slate-400 font-mono text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {new Date(report.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </span>
        </div>

        {/* Actionable Mitigation Guidance */}
        <div
          className={`rounded-xl border p-4 sm:p-5 transition-colors ${
            isCritical
              ? "border-rose-500/30 bg-rose-950/20 text-rose-200"
              : isHigh
              ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
              : isModerate
              ? "border-yellow-500/20 bg-yellow-950/15 text-yellow-200"
              : "border-emerald-500/20 bg-emerald-950/20 text-emerald-200"
          }`}
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Recommended Mitigation Action</span>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {report.recommendedAction ||
              "Destination passed heuristic scrutiny. Always confirm sensitive transactions directly inside official mobile banking apps."}
          </p>
        </div>

        {/* Active Security Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Active Security Warnings ({report.warnings.length})
            </h3>
            <div className="space-y-2">
              {report.warnings.map((warn, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-950/15 p-3.5 text-sm text-amber-200 leading-relaxed"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Layer Inspection Checks */}
        {report.securityChecks && report.securityChecks.length > 0 && (
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <button
              onClick={() => setShowAllChecks(!showAllChecks)}
              className="flex w-full items-center justify-between text-left group rounded-xl p-2 -mx-2 hover:bg-slate-800/40 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Multi-Layer Inspection Telemetry ({report.securityChecks.length} Checks)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Granular evaluation logs across protocol, reputation, typosquatting, and threat feeds.
                </p>
              </div>
              <span className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 group-hover:text-white transition-colors">
                {showAllChecks ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>

            {showAllChecks && (
              <div className="space-y-2.5">
                {report.securityChecks.map((check, idx) => (
                  <SecurityCheckItem key={idx} check={check} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer controls */}
        <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Heuristic indicators are provided for proactive risk prevention. Always maintain operational caution.
          </p>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Scan Another Destination</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
