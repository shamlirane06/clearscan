import { useState } from "react";
import { AlertOctagon, CheckCircle, ChevronDown, HelpCircle, WarningShield, WarningTriangle } from "./icons/ClearScanIcons";
import type { SecurityCheckResult } from "../types/scan";

interface SecurityCheckItemProps {
  check: SecurityCheckResult;
  variant?: "finding" | "log";
}

export type CheckDisplayStatus = "Passed" | "Flagged" | "Not Checked" | "Unable to Verify" | "Critical";

export function deriveCheckStatus(check: SecurityCheckResult): CheckDisplayStatus {
  const { passed, riskLevel } = check;
  const isExternalCheck = /threat|safe browsing|reputation|external/i.test(check.checkName);

  if (riskLevel === "CRITICAL") return "Critical";
  if (riskLevel === "WARNING" && !passed) return "Unable to Verify";
  if (isExternalCheck && !passed) {
    const isUnavailable = /unavailable|failed|could not|error/i.test(check.explanation) || /unavailable/i.test(check.evidence);
    return isUnavailable ? "Unable to Verify" : "Not Checked";
  }
  if (riskLevel === "INFO") return passed ? "Not Checked" : "Not Checked";
  if (riskLevel === "HIGH" || riskLevel === "MEDIUM" || (riskLevel === "LOW" && !passed)) return "Flagged";
  if (passed) return "Passed";
  return "Flagged";
}

export function severityLabel(check: SecurityCheckResult): string {
  switch (check.riskLevel) {
    case "CRITICAL":
      return "Critical";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Moderate";
    case "WARNING":
      return "Unable to Verify";
    case "INFO":
      return "Informational";
    default:
      return check.passed ? "Low" : "Low";
  }
}

export function findingRiskWhy(check: SecurityCheckResult): string {
  const name = check.checkName.toLowerCase();
  if (name.includes("impersonation") || name.includes("lookalike") || name.includes("punycode")) {
    return "Attackers use lookalike names to impersonate trusted brands and collect credentials.";
  }
  if (name.includes("shortener")) {
    return "A shortened link can hide the real destination until after you open it.";
  }
  if (name.includes("keyword") || name.includes("path")) {
    return "Urgent login or verification wording is commonly used to rush people into phishing pages.";
  }
  if (name.includes("tld")) {
    return "Some top-level domains are frequently abused for short-lived phishing sites.";
  }
  if (name.includes("http") || name.includes("validation")) {
    return "Unencrypted HTTP lets a network attacker alter the page or steal data in transit.";
  }
  if (name.includes("ip address")) {
    return "Legitimate services almost always use a registered domain, not a raw address.";
  }
  if (name.includes("query")) {
    return "A large query string can hide tracking, redirects, or obfuscated payloads.";
  }
  if (name.includes("encoding") || name.includes("@")) {
    return "Encoded or misleading characters can conceal the true host from a casual glance.";
  }
  if (name.includes("port") || name.includes("subdomain") || name.includes("length")) {
    return "Unusual URL structure can be a sign of obfuscation or a non-standard hosting setup.";
  }
  if (name.includes("threat")) {
    return "A threat-intelligence match means the URL has been reported in a known-bad dataset.";
  }
  return check.explanation;
}

function statusTone(status: CheckDisplayStatus) {
  switch (status) {
    case "Critical":
      return { icon: <AlertOctagon className="h-4 w-4" />, className: "cs-check-status cs-check-status--critical" };
    case "Flagged":
      return { icon: <WarningTriangle className="h-4 w-4" />, className: "cs-check-status cs-check-status--flagged" };
    case "Unable to Verify":
      return { icon: <WarningShield className="h-4 w-4" />, className: "cs-check-status cs-check-status--unable" };
    case "Not Checked":
      return { icon: <HelpCircle className="h-4 w-4" />, className: "cs-check-status cs-check-status--unchecked" };
    default:
      return { icon: <CheckCircle className="h-4 w-4" />, className: "cs-check-status cs-check-status--passed" };
  }
}

function FindingBody({ check }: { check: SecurityCheckResult }) {
  return (
    <dl className="cs-finding-meta">
      <div>
        <dt>Explanation</dt>
        <dd>{check.explanation}</dd>
      </div>
      {check.evidence ? (
        <div>
          <dt>Evidence</dt>
          <dd>
            <code>{check.evidence}</code>
          </dd>
        </div>
      ) : null}
      <div>
        <dt>Why this could be a security risk</dt>
        <dd>{findingRiskWhy(check)}</dd>
      </div>
    </dl>
  );
}

export default function SecurityCheckItem({ check, variant = "finding" }: SecurityCheckItemProps) {
  const [open, setOpen] = useState(variant === "finding");
  const status = deriveCheckStatus(check);
  const tone = statusTone(status);
  const severity = severityLabel(check);

  if (variant === "log") {
    return (
      <div className="cs-check-log-item">
        <button
          type="button"
          className="cs-check-log-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className="cs-check-log-name">{check.checkName}</span>
          <span className={tone.className}>
            {tone.icon}
            {status === "Critical" ? "Flagged" : status}
          </span>
          <ChevronDown className={`h-4 w-4 cs-check-log-chevron ${open ? "is-open" : ""}`} />
        </button>
        {open ? (
          <div className="cs-check-log-body">
            <p className="cs-check-log-severity">Severity: {severity}</p>
            <FindingBody check={check} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <article className={`cs-finding ${status === "Critical" ? "is-critical" : ""}`}>
      <header className="cs-finding-header">
        <div>
          <h4>{check.checkName}</h4>
          <p className="cs-finding-severity">Severity: {severity}</p>
        </div>
        <span className={tone.className}>
          {tone.icon}
          {status === "Critical" ? "Flagged" : status}
        </span>
      </header>
      <FindingBody check={check} />
    </article>
  );
}
