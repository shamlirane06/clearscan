import { describe, expect, it } from "vitest";
import { sanitizeHistoryItems, sanitizeScanForHistory } from "./historyPrivacy";
import type { BackendScanResponse, ScanHistoryItem } from "../types/scan";

const scan: BackendScanResponse = {
  url: "https://user:secret@example.com/reset/secret?token=private#fragment", status: "SAFE", message: "", normalizedHostname: "example.com", riskScore: 0,
  riskClassification: "LOW_RISK", riskMessage: "", securityChecks: [{ checkName: "Suspicious Path Keywords", passed: false, riskContribution: 15, riskLevel: "MEDIUM", explanation: "Matched a path keyword", evidence: "Path: /reset/secret" }],
  warnings: [], recommendedAction: "", timestamp: "2026-01-01T00:00:00Z", threatIntelligenceAvailable: false,
};

describe("history privacy", () => {
  it("stores only URL origin and omits path evidence", () => {
    const history = sanitizeScanForHistory({ ...scan, id: "1", source: "url" }) as ScanHistoryItem;
    expect(history.url).toBe("https://example.com");
    expect(history.securityChecks[0].evidence).toBe("URL detail omitted from local history.");
    expect(JSON.stringify(history)).not.toContain("private");
  });
  it("sanitizes existing local history when loaded", () => {
    expect(sanitizeHistoryItems([{ ...scan, id: "1", source: "url" }])[0].url).toBe("https://example.com");
  });
});
