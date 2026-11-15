import { describe, expect, it } from "vitest";
import { sanitizeHistoryItems, sanitizeScanForHistory } from "./historyPrivacy";
import type { BackendScanResponse, ScanHistoryItem } from "../types/scan";

const scan: BackendScanResponse = {
  url: "https://user:secret@example.com/reset/secret?token=private#fragment", status: "SAFE", message: "", normalizedHostname: "example.com", riskScore: 0,
  riskClassification: "LOW_RISK", riskMessage: "", securityChecks: [{ checkName: "Suspicious Path Keywords", passed: false, riskContribution: 15, riskLevel: "MEDIUM", explanation: "Matched a path keyword", evidence: "Path: /reset/secret" }],
  warnings: [], recommendedAction: "", timestamp: "2026-01-01T00:00:00Z", threatIntelligenceAvailable: false,
};

describe("history privacy", () => {
  it("preserves URL path and query while stripping embedded credentials", () => {
    const history = sanitizeScanForHistory({ ...scan, id: "1", source: "url" }) as ScanHistoryItem;
    expect(history.url).toBe("https://example.com/reset/secret?token=private#fragment");
    expect(history.securityChecks[0].evidence).toBe("Path: /reset/secret");
    expect(history.url).not.toContain("user:secret@");
  });

  it("preserves exact test QR URL with path and query parameters", () => {
    const testUrl = "http://sbi-kyc-update.xyz/verify-account?urgent=true";
    const testScan: BackendScanResponse = {
      ...scan,
      url: testUrl,
      normalizedHostname: "sbi-kyc-update.xyz",
      securityChecks: [
        {
          checkName: "Suspicious Path Keywords",
          passed: false,
          riskContribution: 15,
          riskLevel: "MEDIUM",
          explanation: "Matched a path keyword",
          evidence: "Path: /verify-account",
        },
      ],
    };
    const history = sanitizeScanForHistory({ ...testScan, id: "qr-1", source: "qr" }) as ScanHistoryItem;
    expect(history.url).toBe("http://sbi-kyc-update.xyz/verify-account?urgent=true");
    expect(history.securityChecks[0].evidence).toBe("Path: /verify-account");
  });

  it("sanitizes existing local history when loaded while preserving path and query", () => {
    const items = sanitizeHistoryItems([{ ...scan, id: "1", source: "url" }]);
    expect(items[0].url).toBe("https://example.com/reset/secret?token=private#fragment");
  });
});
