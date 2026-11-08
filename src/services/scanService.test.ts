import { afterEach, describe, it, expect, vi } from "vitest";
import { performClientFallbackAnalysis, scanUrl } from "./scanService";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Heuristic Scan Service & Offline Fallback Engine", () => {
  it("classifies ordinary HTTPS links as low risk without claiming verification", () => {
    const report = performClientFallbackAnalysis("https://www.wikipedia.org");
    expect(report.riskClassification).toBe("LOW_RISK");
    expect(report.status).toBe("UNABLE_TO_VERIFY");
    expect(report.riskScore).toBe(0);
    expect(report.normalizedHostname).toBe("www.wikipedia.org");
    expect(report.threatIntelligenceStatus).toBe("NOT_CHECKED");
  });
  it("detects lookalikes and aligns the weighted sample score", () => {
    const report = performClientFallbackAnalysis("https://g00gle.com/login");
    expect(report.riskScore).toBe(41);
    expect(report.riskClassification).toBe("MODERATE_RISK");
    expect(report.warnings.some((w) => w.toLowerCase().includes("lookalike"))).toBe(true);
  });
  it("detects brand impersonation in unofficial domains", () => {
    const report = performClientFallbackAnalysis("https://amazon-pay-update.xyz/verify");
    expect(report.riskScore).toBe(47);
    expect(report.riskClassification).toBe("MODERATE_RISK");
    expect(report.warnings.some((w) => w.toLowerCase().includes("brand"))).toBe(true);
  });
  it("flags shorteners, HTTP, and suspicious TLDs", () => {
    expect(performClientFallbackAnalysis("https://bit.ly/sbi-urgent-update").riskScore).toBe(26);
    expect(performClientFallbackAnalysis("http://sbi-kyc-update.xyz/verify").riskScore).toBe(56);
    expect(performClientFallbackAnalysis("http://example.com").warnings.some((w) => w.toLowerCase().includes("http"))).toBe(true);
    expect(performClientFallbackAnalysis("https://account-verify-team.xyz").riskScore).toBeGreaterThanOrEqual(20);
  });
  it("does not fabricate a threat-intelligence result for a Safe Browsing test URL", () => {
    const report = performClientFallbackAnalysis("https://testsafebrowsing.appspot.com/malware");
    expect(report.riskClassification).toBe("LOW_RISK");
    expect(report.threatIntelligenceStatus).toBe("NOT_CHECKED");
    expect(report.analysisSource).toBe("LOCAL_FALLBACK");
    expect(report.analysisNotice).toContain("Only local URL analysis");
  });
  it("rejects malformed, unsupported, UPI, and private destinations as unverifiable", () => {
    for (const url of ["not a valid url!@#$", "ftp://example.com/a", "upi://pay?pa=merchant%40upi", "http://127.0.0.1", "http://10.0.0.1", "http://169.254.169.254", "http://2130706433", "http://[fd00::1]"]) {
      const report = performClientFallbackAnalysis(url);
      expect(report.riskClassification, url).toBe("UNABLE_TO_VERIFY");
      expect(report.riskScore, url).toBe(-1);
    }
  });
  it("uses the actual backend response and score when the API succeeds", async () => {
    const response = {
      url: "https://example.com", status: "DANGEROUS", message: "warning", normalizedHostname: "example.com",
      riskScore: 38, riskClassification: "MODERATE_RISK", riskMessage: "warning", securityChecks: [], warnings: [],
      recommendedAction: "review", timestamp: "2026-01-01T00:00:00Z", threatIntelligenceAvailable: true,
      analysisSource: "BACKEND", threatIntelligenceStatus: "CHECKED_NO_MATCH",
    };
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(response), { status: 200 }))));
    expect((await scanUrl("https://example.com")).riskScore).toBe(38);
    expect((await scanUrl("https://example.com")).analysisSource).toBe("BACKEND");
  });
  it("labels network errors and invalid responses as local-only analysis", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(new Response("{}", { status: 200 })));
    const network = await scanUrl("https://example.com");
    const invalid = await scanUrl("https://example.com");
    expect(network.analysisSource).toBe("LOCAL_FALLBACK");
    expect(network.analysisNotice).toContain("Failed to fetch");
    expect(network.threatIntelligenceStatus).toBe("NOT_CHECKED");
    expect(invalid.analysisSource).toBe("LOCAL_FALLBACK");
    expect(invalid.analysisNotice).toContain("invalid scan response");
  });
  it("labels timed out backend scans as local-only", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
    })));
    const pending = scanUrl("https://example.com");
    await vi.advanceTimersByTimeAsync(6000);
    expect((await pending).analysisNotice).toContain("timed out");
  });
});
