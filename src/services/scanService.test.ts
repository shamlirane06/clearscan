import { describe, it, expect } from "vitest";
import { performClientFallbackAnalysis } from "./scanService";

describe("Heuristic Scan Service & Offline Fallback Engine", () => {
  it("should classify a normal HTTPS site as LOW_RISK", () => {
    const report = performClientFallbackAnalysis("https://www.wikipedia.org");
    expect(report.riskClassification).toBe("LOW_RISK");
    expect(report.status).toBe("SAFE");
    expect(report.riskScore).toBeLessThan(25);
    expect(report.normalizedHostname).toBe("www.wikipedia.org");
  });

  it("should detect lookalike typosquatting domains (e.g. g00gle.com)", () => {
    const report = performClientFallbackAnalysis("https://g00gle.com/login");
    expect(report.riskScore).toBeGreaterThanOrEqual(25);
    expect(report.status).toBe("DANGEROUS");
    expect(report.warnings.some((w) => w.toLowerCase().includes("lookalike") || w.toLowerCase().includes("google"))).toBe(true);
  });

  it("should detect brand impersonation in unofficial domains", () => {
    const report = performClientFallbackAnalysis("https://amazon-pay-update.xyz/verify");
    expect(report.riskScore).toBeGreaterThanOrEqual(50);
    expect(["HIGH_RISK", "CRITICAL_RISK"]).toContain(report.riskClassification);
    expect(report.warnings.some((w) => w.toLowerCase().includes("brand"))).toBe(true);
  });

  it("should flag URL shorteners due to hidden destination risk", () => {
    const report = performClientFallbackAnalysis("https://bit.ly/sbi-kyc");
    expect(report.riskScore).toBeGreaterThanOrEqual(25);
    expect(report.warnings.some((w) => w.toLowerCase().includes("shorten"))).toBe(true);
  });

  it("should classify synthetic malicious test domains as CRITICAL_RISK (score >= 75)", () => {
    const report = performClientFallbackAnalysis("https://testsafebrowsing.appspot.com/malware");
    expect(report.riskClassification).toBe("CRITICAL_RISK");
    expect(report.status).toBe("DANGEROUS");
    expect(report.riskScore).toBeGreaterThanOrEqual(75);
    expect(report.warnings.some((w) => w.includes("[DEMO]"))).toBe(true);
  });

  it("should flag suspicious top-level domains like .xyz, .tk", () => {
    const report = performClientFallbackAnalysis("https://account-verify-team.xyz");
    expect(report.riskScore).toBeGreaterThanOrEqual(20);
    expect(report.warnings.some((w) => w.toLowerCase().includes("tld") || w.toLowerCase().includes("top-level"))).toBe(true);
  });

  it("should flag unencrypted HTTP protocol", () => {
    const report = performClientFallbackAnalysis("http://example.com");
    expect(report.warnings.some((w) => w.toLowerCase().includes("http") || w.toLowerCase().includes("unencrypted"))).toBe(true);
  });

  it("should handle unparseable input with UNABLE_TO_VERIFY state", () => {
    const report = performClientFallbackAnalysis("not a valid url!@#$");
    expect(report.status).toBe("UNABLE_TO_VERIFY");
    expect(report.riskClassification).toBe("UNABLE_TO_VERIFY");
    expect(report.riskScore).toBe(-1);
  });
});
