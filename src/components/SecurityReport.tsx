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
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
      {/* Top Telemetry Header */}
      <div
        className={`border-b p-5 sm:p-6 transition-colors ${
          isCritical
            ? "border-rose-500/20 bg-rose-950/20"
            : isHigh
            ? "border-amber-500/20 bg-amber-950/20"
            : isModerate
            ? "border-yellow-500/10 bg-yellow-950/10"
            : isUnable
            ? "border-zinc-800 bg-zinc-900/50"
            : "border-emerald-500/10 bg-emerald-950/15"
        }`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
                {isCritical || isHigh ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                ) : isModerate ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Security Incident Dossier &bull; Ref #{report.timestamp ? report.timestamp.slice(-6) : "SCAN"}
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-mono">
              {report.normalizedHostname || "UNKNOWN HOST"}
            </h3>

            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
              {report.riskMessage || report.message}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 shadow-inner">
            <RiskMeter score={report.riskScore} classification={report.riskClassification} />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Scanned Destination URL Box */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              Target Destination URI
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy URI</span>
                  </>
                )}
              </button>

              <button
                onClick={exportReportJson}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
                title="Copy complete analysis in JSON format"
              >
                {reportExported ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">JSON Copied</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3" />
                    <span>Export JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 break-all font-mono text-xs sm:text-sm text-zinc-200 select-all">
            {report.url}
          </p>
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1 font-mono text-[11px] text-zinc-300">
            <Cpu className="h-3 w-3 text-emerald-400" />
            6-Layer Heuristic Engine
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] ${
              report.threatIntelligenceAvailable
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                report.threatIntelligenceAvailable ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {report.threatIntelligenceAvailable
              ? "Google Safe Browsing: Active"
              : "Threat Intel: Local Engine"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1 font-mono text-[11px] text-zinc-400">
            <Lock className="h-3 w-3 text-zinc-400" />
            SSRF Network Guard: Verified
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1 font-mono text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            {new Date(report.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Recommended Action / Incident Playbook */}
        <div
          className={`rounded-xl border p-4 transition-colors ${
            isCritical
              ? "border-rose-500/30 bg-rose-950/20 text-rose-200"
              : isHigh
              ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
              : isModerate
              ? "border-yellow-500/20 bg-yellow-950/15 text-yellow-200"
              : "border-emerald-500/20 bg-emerald-950/20 text-emerald-200"
          }`}
        >
          <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Actionable Mitigation Guidance
          </h4>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-300">
            {report.recommendedAction ||
              "Link passed heuristic scrutiny. Always confirm critical banking operations inside dedicated official apps."}
          </p>
        </div>

        {/* Identified Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Active Security Warnings ({report.warnings.length})
            </h4>
            <div className="space-y-2">
              {report.warnings.map((warn, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-950/15 p-2.5 text-xs text-amber-200/90 leading-relaxed"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Granular Checks Accordion */}
        {report.securityChecks && report.securityChecks.length > 0 && (
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <button
              onClick={() => setShowAllChecks(!showAllChecks)}
              className="flex w-full items-center justify-between text-left group"
            >
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                  Multi-Layer Inspection Telemetry ({report.securityChecks.length} Checks)
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Granular evidence logs across protocol, reputation, typosquatting, and threat feeds.
                </p>
              </div>
              <span className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-1.5 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors">
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
        <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] text-zinc-500">
            Heuristic indicators are for risk guidance. No automated tool claims 100% immunity against zero-days.
          </p>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 shadow-sm transition-all hover:bg-zinc-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Scan Another Destination
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
