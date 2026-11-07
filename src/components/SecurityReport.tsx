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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
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
  const [showAllChecks, setShowAllChecks] = useState(true);

  const copyUrl = () => {
    navigator.clipboard.writeText(report.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = report.riskScore >= 75 || report.riskClassification === "CRITICAL_RISK";
  const isHigh = report.riskScore >= 50 && report.riskScore < 75;
  const isModerate = report.riskScore >= 25 && report.riskScore < 50;
  const isLow = report.riskScore >= 0 && report.riskScore < 25;
  const isUnable = report.riskClassification === "UNABLE_TO_VERIFY";

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
      {/* Header Banner */}
      <div
        className={`border-b p-5 sm:p-6 ${
          isCritical
            ? "border-rose-200 bg-rose-50/70"
            : isHigh
            ? "border-amber-200 bg-amber-50/70"
            : isModerate
            ? "border-amber-100 bg-amber-50/40"
            : isUnable
            ? "border-zinc-200 bg-zinc-50"
            : "border-emerald-100 bg-emerald-50/60"
        }`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900/10 text-emerald-900">
                {isCritical || isHigh ? (
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                ) : isModerate ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                )}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                ClearScan Security Assessment
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
              {report.normalizedHostname || "Unknown Host"}
            </h3>

            <p className="max-w-xl text-sm leading-relaxed text-zinc-600">
              {report.riskMessage || report.message}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur">
            <RiskMeter score={report.riskScore} classification={report.riskClassification} />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Scanned Destination URL Box */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              Scanned Destination Link
            </span>
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-zinc-600 hover:bg-zinc-200"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1.5 break-all font-mono text-sm text-zinc-900 select-all">
            {report.url}
          </p>
        </div>

        {/* Threat Intelligence & Service Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-50/80 px-3 py-1 text-emerald-800">
            <Cpu className="h-3.5 w-3.5 text-emerald-700" />
            Multi-Layer Analysis Engine (6 Checks)
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              report.threatIntelligenceAvailable
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                report.threatIntelligenceAvailable ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            {report.threatIntelligenceAvailable
              ? "Live Threat Intelligence Active"
              : "Local Heuristic Security Analyzer"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            {new Date(report.timestamp || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Recommended Action */}
        <div
          className={`rounded-xl border p-4 ${
            isCritical
              ? "border-rose-200 bg-rose-50/60 text-rose-950"
              : isHigh
              ? "border-amber-200 bg-amber-50/60 text-amber-950"
              : isModerate
              ? "border-amber-100 bg-amber-50/40 text-amber-950"
              : "border-emerald-200 bg-emerald-50/50 text-emerald-950"
          }`}
        >
          <h4 className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Recommended Safety Action
          </h4>
          <p className="mt-1 text-sm leading-relaxed">
            {report.recommendedAction ||
              "Always confirm banking, OTP, or payment requests using official phone numbers or dedicated apps."}
          </p>
        </div>

        {/* Warnings List */}
        {report.warnings && report.warnings.length > 0 && (
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-amber-900">
              Identified Suspicious Indicators ({report.warnings.length})
            </h4>
            <div className="space-y-2">
              {report.warnings.map((warn, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/40 p-2.5 text-xs text-amber-950"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Security Checks Accordion */}
        {report.securityChecks && report.securityChecks.length > 0 && (
          <div className="border-t border-zinc-200/80 pt-5">
            <button
              onClick={() => setShowAllChecks(!showAllChecks)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Detailed Security Checks ({report.securityChecks.length})
                </h4>
                <p className="text-xs text-zinc-500">
                  Inspect the granular multi-layer scan results and evidence.
                </p>
              </div>
              <span className="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100">
                {showAllChecks ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>

            {showAllChecks && (
              <div className="mt-4 space-y-2.5">
                {report.securityChecks.map((check, idx) => (
                  <SecurityCheckItem key={idx} check={check} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safety Disclaimer and Controls */}
        <div className="flex flex-col gap-3 border-t border-zinc-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Heuristic indicators are for guidance. A low risk score does not guarantee absolute safety.
          </p>

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-xs font-semibold text-emerald-950 shadow-sm transition-colors hover:bg-emerald-50"
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
