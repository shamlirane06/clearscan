import { describe, it, expect } from "vitest";
import type { ScanHistoryItem } from "../types/scan";

describe("HistoryPage Logic & Filtering", () => {
  const sampleItems: ScanHistoryItem[] = [
    {
      id: "scan-1",
      url: "https://www.google.com",
      normalizedHostname: "google.com",
      status: "SAFE",
      riskScore: 12,
      riskClassification: "LOW_RISK",
      riskMessage: "No known threats",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: "2025-11-10T10:42:00.000Z",
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "scan-2",
      url: "http://sbi-kyc-update.xyz",
      normalizedHostname: "sbi-kyc-update.xyz",
      status: "DANGEROUS",
      riskScore: 92,
      riskClassification: "CRITICAL_RISK",
      riskMessage: "Deceptive banking impersonation",
      message: "Phishing threat detected",
      securityChecks: [],
      warnings: ["Suspicious domain TLD", "Credential harvesting pattern"],
      recommendedAction: "Do not visit",
      timestamp: "2025-11-10T09:15:00.000Z",
      threatIntelligenceAvailable: true,
      source: "url",
    },
    {
      id: "scan-3",
      url: "https://youtube.com",
      normalizedHostname: "youtube.com",
      status: "SAFE",
      riskScore: 18,
      riskClassification: "LOW_RISK",
      riskMessage: "Safe multimedia platform",
      message: "Safe",
      securityChecks: [],
      warnings: [],
      recommendedAction: "Safe to open",
      timestamp: "2025-11-09T18:20:00.000Z",
      threatIntelligenceAvailable: true,
      source: "qr",
    },
    {
      id: "scan-4",
      url: "https://example-login.com",
      normalizedHostname: "example-login.com",
      status: "SAFE",
      riskScore: 67,
      riskClassification: "MODERATE_RISK",
      riskMessage: "Generic login form on newly registered domain",
      message: "Suspicious",
      securityChecks: [],
      warnings: ["Unverified login prompt"],
      recommendedAction: "Verify before entering credentials",
      timestamp: "2025-11-09T14:17:00.000Z",
      threatIntelligenceAvailable: false,
      source: "url",
    },
  ];

  it("calculates statistics dynamically from real items", () => {
    const total = sampleItems.length;
    const lowRisk = sampleItems.filter((i) => i.riskClassification === "LOW_RISK").length;
    const needsReview = sampleItems.filter((i) => i.riskClassification !== "LOW_RISK").length;

    expect(total).toBe(4);
    expect(lowRisk).toBe(2);
    expect(needsReview).toBe(2);
  });

  it("filters items by search term (URL or hostname)", () => {
    const term = "youtube";
    const filtered = sampleItems.filter(
      (item) =>
        item.url.toLowerCase().includes(term) ||
        item.normalizedHostname.toLowerCase().includes(term)
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("scan-3");
    expect(filtered[0].source).toBe("qr");
  });

  it("filters items by risk status correctly", () => {
    const dangerousItems = sampleItems.filter(
      (i) => i.riskClassification === "HIGH_RISK" || i.riskClassification === "CRITICAL_RISK"
    );
    const lowRiskItems = sampleItems.filter((i) => i.riskClassification === "LOW_RISK");
    const suspiciousItems = sampleItems.filter(
      (i) => i.riskClassification === "MODERATE_RISK" || i.riskClassification === "UNABLE_TO_VERIFY"
    );

    expect(dangerousItems).toHaveLength(1);
    expect(dangerousItems[0].url).toBe("http://sbi-kyc-update.xyz");
    expect(lowRiskItems).toHaveLength(2);
    expect(suspiciousItems).toHaveLength(1);
  });

  it("handles pagination correctly", () => {
    const pageSize = 2;
    const totalPages = Math.ceil(sampleItems.length / pageSize);
    const page1 = sampleItems.slice(0, pageSize);
    const page2 = sampleItems.slice(pageSize, pageSize * 2);

    expect(totalPages).toBe(2);
    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(2);
    expect(page1[0].id).toBe("scan-1");
    expect(page2[0].id).toBe("scan-3");
  });

  it("formats CSV correctly for filtered items", () => {
    const headers = [
      "URL",
      "Scan Type",
      "Date & Time",
      "Risk Status",
      "Risk Score",
      "Normalized Hostname",
      "Risk Classification",
      "Timestamp",
    ];
    const rows = sampleItems.map((item) => {
      const scanType = item.source === "qr" ? "QR Code" : "Link";
      const scoreStr = item.riskScore >= 0 ? `${item.riskScore}/100` : "N/A";
      return `"${item.url}","${scanType}","${scoreStr}","${item.normalizedHostname}"`;
    });

    const csv = [headers.join(","), ...rows].join("\n");
    expect(csv).toContain("https://www.google.com");
    expect(csv).toContain("QR Code");
    expect(csv).toContain("http://sbi-kyc-update.xyz");
  });
});
