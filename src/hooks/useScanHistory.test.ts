import { describe, it, expect } from "vitest";
import type { BackendScanResponse } from "../types/scan";

describe("Scan History & Statistics Calculation", () => {
  const mockSafe: BackendScanResponse = {
    url: "https://wikipedia.org",
    status: "SAFE",
    message: "No threats detected",
    normalizedHostname: "wikipedia.org",
    riskScore: 0,
    riskClassification: "LOW_RISK",
    riskMessage: "Safe",
    securityChecks: [],
    warnings: [],
    recommendedAction: "Proceed normally",
    timestamp: new Date().toISOString(),
    threatIntelligenceAvailable: false,
  };

  const mockCritical: BackendScanResponse = {
    url: "https://evil-phish.xyz",
    status: "DANGEROUS",
    message: "Critical threat",
    normalizedHostname: "evil-phish.xyz",
    riskScore: 85,
    riskClassification: "CRITICAL_RISK",
    riskMessage: "Dangerous",
    securityChecks: [],
    warnings: ["Malicious domain"],
    recommendedAction: "Do not visit",
    timestamp: new Date().toISOString(),
    threatIntelligenceAvailable: true,
  };

  it("should calculate correct aggregate statistics across risk tiers", () => {
    const history = [
      { ...mockSafe, id: "1", source: "qr" as const },
      { ...mockCritical, id: "2", source: "url" as const },
      { ...mockCritical, id: "3", source: "url" as const },
    ];

    const stats = {
      total: history.length,
      lowRisk: history.filter((i) => i.riskClassification === "LOW_RISK").length,
      moderateRisk: history.filter((i) => i.riskClassification === "MODERATE_RISK").length,
      highRisk: history.filter((i) => i.riskClassification === "HIGH_RISK").length,
      criticalRisk: history.filter((i) => i.riskClassification === "CRITICAL_RISK").length,
      unableToVerify: history.filter((i) => i.riskClassification === "UNABLE_TO_VERIFY").length,
    };

    expect(stats.total).toBe(3);
    expect(stats.lowRisk).toBe(1);
    expect(stats.criticalRisk).toBe(2);
    expect(stats.moderateRisk).toBe(0);
    expect(stats.unableToVerify).toBe(0);
  });
});
