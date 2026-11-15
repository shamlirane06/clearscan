import { useState } from "react";
import {
  CheckCircle,
  CheckMark,
  ChevronDown,
  Close,
  CopyMark,
  HelpCircle,
  InfoCircle,
  ReportDocument,
  RotateBack,
  WarningTriangle,
} from "./icons/ClearScanIcons";
import type { BackendScanResponse, SecurityCheckResult } from "../types/scan";
import RiskMeter from "./RiskMeter";
import SecurityCheckItem, { deriveCheckStatus } from "./SecurityCheckItem";

interface SecurityReportProps {
  report: BackendScanResponse;
  onReset?: () => void;
  onClose?: () => void;
  embedded?: boolean;
}

function categoriseChecks(checks: SecurityCheckResult[]) {
  const passed: SecurityCheckResult[] = [];
  const flagged: SecurityCheckResult[] = [];
  const notChecked: SecurityCheckResult[] = [];
  const unableToVerify: SecurityCheckResult[] = [];

  for (const check of checks) {
    const status = deriveCheckStatus(check);
    if (status === "Passed") passed.push(check);
    else if (status === "Not Checked") notChecked.push(check);
    else if (status === "Unable to Verify") unableToVerify.push(check);
    else flagged.push(check);
  }
  return { passed, flagged, notChecked, unableToVerify };
}

function severityOrder(check: SecurityCheckResult): number {
  if (check.riskLevel === "CRITICAL") return 0;
  if (check.riskLevel === "HIGH") return 1;
  if (check.riskLevel === "MEDIUM") return 2;
  if (check.riskLevel === "LOW" && !check.passed) return 3;
  return 4;
}

function buildActionItems(report: BackendScanResponse): string[] {
  const items: string[] = [];
  const checks = report.securityChecks || [];
  const flagged = checks.filter((check) => !check.passed && check.riskLevel !== "INFO");
  const names = new Set(flagged.map((check) => check.checkName));

  if (report.recommendedAction) items.push(report.recommendedAction);
  if (names.has("URL Shortener Detected")) {
    items.push("If you must inspect a shortened link, reveal the final destination with a URL preview service before opening it.");
  }
  if (names.has("Possible Brand Impersonation") || names.has("Lookalike Domain Detected")) {
    items.push("Open the official website or app yourself. Do not use this link to reach the organisation.");
  }
  if (names.has("Suspicious Domain Keywords") || names.has("Suspicious Path Keywords")) {
    items.push("Do not enter passwords, OTPs, or personal details on a page reached from an unsolicited message.");
  }
  if (names.has("IP Address Detection")) {
    items.push("Treat an IP-only address as untrusted until you can confirm the operator through a known channel.");
  }
  if (names.has("Punycode Domain")) {
    items.push("Compare the domain character by character with the official spelling before trusting it.");
  }
  if (
    report.threatIntelligenceStatus === "NOT_CONFIGURED" ||
    report.threatIntelligenceStatus === "UNAVAILABLE" ||
    report.threatIntelligenceStatus === "NOT_CHECKED"
  ) {
    items.push("Google Safe Browsing was not completed for this scan. Recheck the URL through an official Safe Browsing lookup if you need more assurance.");
  }
  if (report.analysisSource === "LOCAL_FALLBACK") {
    items.push("Backend analysis did not complete. Treat these results as a local heuristic review only.");
  }
  if (flagged.length === 0 && report.riskScore >= 0 && report.riskScore < 25) {
    items.push("Even with no flagged indicators, do not enter sensitive information on a site reached through an unsolicited link.");
  }
  return [...new Set(items)];
}

type AnalysisState = "Completed" | "Not Checked" | "Failed" | "Unable to Verify";

function analysisStatuses(report: BackendScanResponse): { label: string; status: AnalysisState; detail: string }[] {
  const local: AnalysisState = "Completed";
  const backend: AnalysisState = report.analysisSource === "LOCAL_FALLBACK" ? "Failed" : "Completed";
  let browsing: AnalysisState = "Not Checked";
  let browsingDetail = "This check was not run for the destination URL.";

  switch (report.threatIntelligenceStatus) {
    case "CHECKED_NO_MATCH":
      browsing = "Completed";
      browsingDetail = "Google Safe Browsing returned no listed threat for this URL.";
      break;
    case "MATCH_FOUND":
      browsing = "Completed";
      browsingDetail = "Google Safe Browsing reported a known threat match.";
      break;
    case "UNAVAILABLE":
      browsing = "Unable to Verify";
      browsingDetail = "Google Safe Browsing could not be reached.";
      break;
    case "NOT_CHECKED":
      browsing = "Not Checked";
      browsingDetail = "Google Safe Browsing was skipped because the backend scan did not complete.";
      break;
    default:
      browsing = "Not Checked";
      browsingDetail = "Google Safe Browsing is not configured for this environment.";
  }

  return [
    {
      label: "Local heuristic analysis",
      status: local,
      detail: "Structural URL checks ran on protocol, host, path, and query parameters.",
    },
    {
      label: "Backend analysis",
      status: backend,
      detail:
        backend === "Failed"
          ? report.analysisNotice || "The analysis server could not complete this scan."
          : "Server-side heuristic analysis completed for this destination.",
    },
    {
      label: "Google Safe Browsing",
      status: browsing,
      detail: browsingDetail,
    },
  ];
}

function statusClass(status: AnalysisState) {
  if (status === "Completed") return "cs-analysis-pill cs-analysis-pill--ok";
  if (status === "Failed") return "cs-analysis-pill cs-analysis-pill--fail";
  if (status === "Unable to Verify") return "cs-analysis-pill cs-analysis-pill--unable";
  return "cs-analysis-pill cs-analysis-pill--idle";
}

export default function SecurityReport({ report, onReset, onClose, embedded = false }: SecurityReportProps) {
  const [copied, setCopied] = useState(false);
  const [reportExported, setReportExported] = useState(false);
  const [showAllChecks, setShowAllChecks] = useState(false);

  const closeHandler = onClose ?? onReset;
  const destinationUrl = report.url || "";

  const copyUrl = async () => {
    await navigator.clipboard.writeText(destinationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReportJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setReportExported(true);
    setTimeout(() => setReportExported(false), 2000);
  };

  const categories = categoriseChecks(report.securityChecks || []);
  const sortedFlagged = [...categories.flagged].sort((a, b) => severityOrder(a) - severityOrder(b));
  const actionItems = buildActionItems(report);
  const statuses = analysisStatuses(report);

  return (
    <section className={`cs-scan-report ${embedded ? "is-embedded" : ""}`} aria-labelledby="cs-report-title">
      <header className="cs-scan-report__header">
        <div className="cs-scan-report__heading">
          <h2 id="cs-report-title">Detailed Scan Report</h2>
          <p className="cs-scan-report__url" title={destinationUrl}>
            {destinationUrl}
          </p>
        </div>
        {closeHandler && !embedded ? (
          <button type="button" className="cs-scan-report__icon-btn" onClick={closeHandler} aria-label="Close report">
            <Close className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      <div className="cs-scan-report__body">
        <section className="cs-report-section cs-risk-overview" aria-labelledby="cs-risk-heading">
          <div className="cs-risk-overview__copy">
            <h3 id="cs-risk-heading">Risk overview</h3>
            <p className="cs-risk-overview__message">{report.riskMessage || report.message}</p>
            <p className="cs-risk-overview__note">
              <InfoCircle className="h-4 w-4" />
              <span>
                This score is a heuristic assessment of suspicious URL indicators. It is not the probability that the URL is
                malicious, and a low score is not a guarantee of safety.
              </span>
            </p>
          </div>
          <RiskMeter score={report.riskScore} classification={report.riskClassification} size="lg" />
        </section>

        <section className="cs-report-section" aria-labelledby="cs-destination-heading">
          <div className="cs-section-head">
            <h3 id="cs-destination-heading">Destination details</h3>
            <div className="cs-report-actions">
              <button type="button" className="cs-report-btn" onClick={copyUrl}>
                {copied ? <CheckMark className="h-3.5 w-3.5" /> : <CopyMark className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy URL"}
              </button>
              <button type="button" className="cs-report-btn" onClick={exportReportJson}>
                {reportExported ? <CheckMark className="h-3.5 w-3.5" /> : <ReportDocument className="h-3.5 w-3.5" />}
                {reportExported ? "JSON copied" : "Export JSON"}
              </button>
            </div>
          </div>
          <p className="cs-destination-url">{destinationUrl}</p>
        </section>

        <section className="cs-report-section" aria-labelledby="cs-analysis-heading">
          <h3 id="cs-analysis-heading">Analysis status</h3>
          <ul className="cs-analysis-list">
            {statuses.map((item) => (
              <li key={item.label}>
                <div className="cs-analysis-row">
                  <span>{item.label}</span>
                  <span className={statusClass(item.status)}>{item.status}</span>
                </div>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cs-report-section" aria-labelledby="cs-checks-heading">
          <h3 id="cs-checks-heading">Security checks</h3>
          <ul className="cs-check-summary">
            <li>
              <CheckCircle className="h-4 w-4 text-[var(--cs-success)]" />
              <strong>{categories.passed.length}</strong>
              <span>Passed</span>
            </li>
            <li>
              <WarningTriangle className="h-4 w-4 text-[var(--cs-warning)]" />
              <strong>{categories.flagged.length}</strong>
              <span>Flagged</span>
            </li>
            <li>
              <HelpCircle className="h-4 w-4 text-[var(--cs-text-muted)]" />
              <strong>{categories.notChecked.length}</strong>
              <span>Not Checked</span>
            </li>
            <li>
              <WarningTriangle className="h-4 w-4 text-[var(--cs-danger)]" />
              <strong>{categories.unableToVerify.length}</strong>
              <span>Unable to Verify</span>
            </li>
          </ul>
        </section>

        {sortedFlagged.length > 0 ? (
          <section className="cs-report-section" aria-labelledby="cs-findings-heading">
            <h3 id="cs-findings-heading">Security findings ({sortedFlagged.length})</h3>
            <p className="cs-section-help">Detected indicators, sorted by severity. Evidence is taken from the analyzed URL.</p>
            <div className="cs-finding-list">
              {sortedFlagged.map((check, index) => (
                <SecurityCheckItem key={`${check.checkName}-${index}`} check={check} variant="finding" />
              ))}
            </div>
          </section>
        ) : (
          <section className="cs-report-section" aria-labelledby="cs-findings-heading">
            <h3 id="cs-findings-heading">Security findings</h3>
            <p className="cs-section-help">No flagged indicators were returned for this destination.</p>
          </section>
        )}

        <section className="cs-report-section" aria-labelledby="cs-actions-heading">
          <h3 id="cs-actions-heading">Recommended actions</h3>
          {actionItems.length > 0 ? (
            <ul className="cs-action-list">
              {actionItems.map((item, index) => (
                <li key={item} className={index === 0 ? "is-primary" : undefined}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="cs-section-help">No additional actions were generated from this result.</p>
          )}
        </section>

        {report.securityChecks && report.securityChecks.length > 0 ? (
          <section className="cs-report-section" aria-labelledby="cs-log-heading">
            <button
              type="button"
              className="cs-log-toggle"
              onClick={() => setShowAllChecks((value) => !value)}
              aria-expanded={showAllChecks}
            >
              <span>
                <h3 id="cs-log-heading">Complete security check log</h3>
                <p>All {report.securityChecks.length} individual checks and their results.</p>
              </span>
              <ChevronDown className={`h-4 w-4 ${showAllChecks ? "rotate-180" : ""}`} />
            </button>
            {showAllChecks ? (
              <div className="cs-check-log">
                {report.securityChecks.map((check, index) => (
                  <SecurityCheckItem key={`${check.checkName}-log-${index}`} check={check} variant="log" />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {report.analysisNotice ? (
          <p className="cs-analysis-notice" role="status">
            {report.analysisNotice}
          </p>
        ) : null}
      </div>

      <footer className="cs-scan-report__footer">
        <div className="cs-report-actions">
          <button type="button" className="cs-report-btn" onClick={copyUrl}>
            {copied ? <CheckMark className="h-3.5 w-3.5" /> : <CopyMark className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button type="button" className="cs-report-btn" onClick={exportReportJson}>
            {reportExported ? <CheckMark className="h-3.5 w-3.5" /> : <ReportDocument className="h-3.5 w-3.5" />}
            {reportExported ? "JSON copied" : "Export JSON"}
          </button>
        </div>
        <div className="cs-report-actions">
          {onReset && onReset !== closeHandler ? (
            <button type="button" className="cs-report-btn" onClick={onReset}>
              <RotateBack className="h-3.5 w-3.5" />
              Scan another
            </button>
          ) : null}
          {closeHandler && !embedded ? (
            <button type="button" className="cs-report-btn cs-report-btn--primary" onClick={closeHandler}>
              Close Report
            </button>
          ) : null}
        </div>
      </footer>
    </section>
  );
}
