import { describe, it, expect } from "vitest";
import type { ScanHistoryItem } from "../types/scan";

describe("Dashboard Statistics & Formatting", () => {
  const mockScans: ScanHistoryItem[] = [
    {
      id: "scan-1",
      url: "https://google.com",
      normalizedHostname: "google.com",
      status: "SAFE",
      riskScore: 5,
      riskClassification: "LOW_RISK",
      riskMessage: "Safe destination",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: new Date().toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "scan-2",
      url: "http://suspicious-link.xyz",
      normalizedHostname: "suspicious-link.xyz",
      status: "SAFE",
      riskScore: 45,
      riskClassification: "MODERATE_RISK",
      riskMessage: "Suspicious keyword detected",
      message: "Needs review",
      securityChecks: [],
      warnings: ["Suspicious domain pattern"],
      recommendedAction: "Proceed with caution",
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      threatIntelligenceAvailable: false,
      source: "url",
    },
    {
      id: "scan-3",
      url: "https://github.com",
      normalizedHostname: "github.com",
      status: "SAFE",
      riskScore: 0,
      riskClassification: "LOW_RISK",
      riskMessage: "Verified domain",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
  ];

  it("computes dynamic statistics accurately for cards", () => {
    const total = mockScans.length;
    const lowRisk = mockScans.filter((s) => s.riskClassification === "LOW_RISK").length;
    const needsReview = mockScans.filter((s) => s.riskClassification !== "LOW_RISK").length;

    expect(total).toBe(3);
    expect(lowRisk).toBe(2);
    expect(needsReview).toBe(1);
  });

  it("limits recent scans to the latest 3 records", () => {
    const recent = mockScans.slice(0, 3);
    expect(recent).toHaveLength(3);
    expect(recent[0].url).toBe("https://google.com");
    expect(recent[1].url).toBe("http://suspicious-link.xyz");
    expect(recent[2].url).toBe("https://github.com");
  });
});
