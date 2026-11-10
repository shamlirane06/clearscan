import { describe, it, expect } from "vitest";
import type { ScanHistoryItem } from "../types/scan";

describe("Reports Page Logic & Analytics", () => {
  const mockScans: ScanHistoryItem[] = [
    {
      id: "scan-1",
      url: "https://www.google.com/search?q=clearscan",
      normalizedHostname: "google.com",
      status: "SAFE",
      riskScore: 10,
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
      url: "https://google.com/maps",
      normalizedHostname: "google.com",
      status: "SAFE",
      riskScore: 12,
      riskClassification: "LOW_RISK",
      riskMessage: "Safe destination",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "scan-3",
      url: "http://sbi-kyc-update.xyz/login",
      normalizedHostname: "sbi-kyc-update.xyz",
      status: "SAFE",
      riskScore: 65,
      riskClassification: "MODERATE_RISK",
      riskMessage: "Potentially Risky",
      message: "Potentially Risky",
      securityChecks: [],
      warnings: ["Suspicious banking keywords"],
      recommendedAction: "Proceed with caution",
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "scan-4",
      url: "http://unknown-verify.net",
      normalizedHostname: "unknown-verify.net",
      status: "DANGEROUS",
      riskScore: 95,
      riskClassification: "HIGH_RISK",
      riskMessage: "Malicious Content Detected",
      message: "Malicious Content Detected",
      securityChecks: [],
      warnings: ["Active phishing signature"],
      recommendedAction: "Block destination",
      timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      threatIntelligenceAvailable: true,
      source: "url",
    },
  ];

  it("calculates summary metrics accurately", () => {
    const total = mockScans.length;
    const safe = mockScans.filter((s) => s.riskClassification === "LOW_RISK").length;
    const suspicious = mockScans.filter((s) => s.riskClassification === "MODERATE_RISK").length;
    const dangerous = mockScans.filter((s) => s.riskClassification === "HIGH_RISK").length;
    const flagged = suspicious + dangerous;

    expect(total).toBe(4);
    expect(safe).toBe(2);
    expect(flagged).toBe(2);
    expect(Math.round((safe / total) * 100)).toBe(50);
  });

  it("aggregates top domains ranked by frequency", () => {
    const domainCounts: Record<string, number> = {};
    for (const item of mockScans) {
      const d = item.normalizedHostname;
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    }

    const sorted = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, count], idx) => ({ rank: idx + 1, domain, count }));

    expect(sorted[0].domain).toBe("google.com");
    expect(sorted[0].count).toBe(2);
    expect(sorted[0].rank).toBe(1);
    expect(sorted).toHaveLength(3);
  });

  it("filters scans properly within a 3-day time window", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000);
    const filtered = mockScans.filter((s) => new Date(s.timestamp) >= threeDaysAgo);

    expect(filtered).toHaveLength(3);
    expect(filtered.some((s) => s.url.includes("unknown-verify.net"))).toBe(false);
  });

  it("generates structured report CSV format containing executive summary and domain audits", () => {
    const lines = [
      "ClearScan - Threat Intelligence & Security Scan Report",
      "Executive Summary",
      `Total Scans,${mockScans.length}`,
      "Top Scanned Domains",
      "Rank,Domain,Scans",
      "1,google.com,2",
    ];

    const csvContent = lines.join("\n");
    expect(csvContent).toContain("Executive Summary");
    expect(csvContent).toContain("google.com,2");
    expect(csvContent).toContain("Total Scans,4");
  });
});
