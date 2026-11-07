import type { BackendScanResponse, SecurityCheckResult } from "../types/scan";

const API_BASE_URL = "http://localhost:8081/api";
const TIMEOUT_MS = 6000;

export async function scanUrl(url: string): Promise<BackendScanResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server returned ${response.status}`);
    }

    const data: BackendScanResponse = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn("Backend API request failed or timed out. Using fallback client analyzer:", err);

    // Fallback: If backend is offline or unreachable, compute an explainable offline security report
    return performClientFallbackAnalysis(url);
  }
}

/**
 * Robust client-side fallback heuristic engine.
 * Ensures the app remains 100% functional and demonstratable even if backend port 8081 is momentarily starting up or offline.
 */
export function performClientFallbackAnalysis(rawUrl: string): BackendScanResponse {
  const timestamp = new Date().toISOString();
  let normalized = rawUrl.trim();
  if (!normalized.includes("://")) {
    normalized = `https://${normalized}`;
  }

  let host = "unknown";
  let pathname = "";
  try {
    const parsed = new URL(normalized);
    host = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    return {
      url: rawUrl,
      status: "UNABLE_TO_VERIFY",
      message: "The URL format could not be parsed.",
      normalizedHostname: "unknown",
      riskScore: -1,
      riskClassification: "UNABLE_TO_VERIFY",
      riskMessage: "We could not complete all required security checks. Treat this link with caution.",
      securityChecks: [],
      warnings: ["Invalid or malformed URL string."],
      recommendedAction: "Do not open this URL.",
      timestamp,
      threatIntelligenceAvailable: false,
    };
  }

  const checks: SecurityCheckResult[] = [];
  const warnings: string[] = [];
  let score = 0;

  // 1. Known synthetic demo malicious
  if (
    host.includes("testsafebrowsing.appspot.com") ||
    host.includes("malware.testing") ||
    host.includes("evil-phishing-test")
  ) {
    checks.push({
      checkName: "Threat Intelligence (Synthetic Demo)",
      passed: false,
      riskContribution: 100,
      riskLevel: "CRITICAL",
      explanation: "[DEMO] This URL matches a synthetic test indicator used for cybersecurity demonstrations.",
      evidence: `Demo test host: ${host}`,
    });
    warnings.push("[DEMO] Confirmed synthetic malicious test domain.");
    score = 95;
  }

  // 2. Lookalike domain check
  const brands: Record<string, string[]> = {
    google: ["google.com", "google.co.in"],
    amazon: ["amazon.com", "amazon.in"],
    sbi: ["sbi.co.in", "onlinesbi.sbi"],
    hdfc: ["hdfcbank.com"],
    paytm: ["paytm.com"],
    apple: ["apple.com", "icloud.com"],
    paypal: ["paypal.com"],
  };

  const substitutions: Record<string, string> = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "9": "g",
  };

  let normalizedSubHost = host;
  for (const [digit, char] of Object.entries(substitutions)) {
    normalizedSubHost = normalizedSubHost.replaceAll(digit, char);
  }

  for (const [brand, legitDomains] of Object.entries(brands)) {
    const isLegit = legitDomains.some((d) => host === d || host.endsWith("." + d));
    if (isLegit) continue;

    if (host.includes(brand)) {
      checks.push({
        checkName: "Possible Brand Impersonation",
        passed: false,
        riskContribution: 35,
        riskLevel: "HIGH",
        explanation: `The domain contains "${brand}" but does not match official domains (${legitDomains.join(", ")}).`,
        evidence: `Domain: ${host}`,
      });
      warnings.push(`Domain contains brand "${brand}" but is not on an official domain.`);
      score += 35;
      break;
    }

    if (normalizedSubHost.includes(brand) && !host.includes(brand)) {
      checks.push({
        checkName: "Lookalike Domain Detected",
        passed: false,
        riskContribution: 40,
        riskLevel: "HIGH",
        explanation: `The domain appears to impersonate "${brand}" using character substitutions (e.g. 0 for o).`,
        evidence: `Domain: ${host} mimics ${brand}`,
      });
      warnings.push(`Character substitution lookalike detected for "${brand}".`);
      score += 40;
      break;
    }
  }

  // 3. Shortener check
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"];
  if (shorteners.some((s) => host === s || host.endsWith("." + s))) {
    checks.push({
      checkName: "URL Shortener Detected",
      passed: false,
      riskContribution: 25,
      riskLevel: "MEDIUM",
      explanation: `URL shortener "${host}" disguises the true destination. Shortened links are frequently used in scams.`,
      evidence: `Shortener host: ${host}`,
    });
    warnings.push("Shortened URL masks final destination.");
    score += 25;
  }

  // 4. Suspicious keywords in host or path
  const keywords = ["login", "verify", "kyc", "secure", "update", "account", "banking", "otp", "upi-cancel"];
  const foundKeywords = keywords.filter((k) => host.includes(k) || pathname.includes(k));
  if (foundKeywords.length > 0) {
    checks.push({
      checkName: "Suspicious Phishing Keywords",
      passed: false,
      riskContribution: 20,
      riskLevel: "MEDIUM",
      explanation: `URL contains keywords often associated with credential harvesting: ${foundKeywords.join(", ")}.`,
      evidence: `Found keywords: ${foundKeywords.join(", ")}`,
    });
    warnings.push(`Phishing keywords detected: ${foundKeywords.join(", ")}`);
    score += 20;
  }

  // 5. Suspicious TLD
  const suspiciousTlds = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".work", ".buzz"];
  if (suspiciousTlds.some((tld) => host.endsWith(tld))) {
    checks.push({
      checkName: "Suspicious Top-Level Domain",
      passed: false,
      riskContribution: 20,
      riskLevel: "MEDIUM",
      explanation: "Domain uses a high-abuse TLD commonly used in disposable phishing sites.",
      evidence: `Host: ${host}`,
    });
    warnings.push("Domain uses a high-risk TLD frequently abused by scammers.");
    score += 20;
  }

  // 6. Protocol
  if (normalized.startsWith("http://")) {
    checks.push({
      checkName: "Unencrypted Connection (HTTP)",
      passed: false,
      riskContribution: 15,
      riskLevel: "LOW",
      explanation: "Website uses unencrypted HTTP. Data sent over this connection can be intercepted.",
      evidence: "Protocol: http://",
    });
    warnings.push("Connection is unencrypted (HTTP).");
    score += 15;
  } else {
    checks.push({
      checkName: "Protocol Security",
      passed: true,
      riskContribution: 0,
      riskLevel: "LOW",
      explanation: "Uses encrypted HTTPS protocol.",
      evidence: "Protocol: https://",
    });
  }

  score = Math.min(score, 100);

  let classification: BackendScanResponse["riskClassification"] = "LOW_RISK";
  let legacyStatus: "SAFE" | "DANGEROUS" = "SAFE";
  let riskMessage = "No threats were detected by the checks performed. This does not guarantee that the website is safe.";

  if (score >= 75) {
    classification = "CRITICAL_RISK";
    legacyStatus = "DANGEROUS";
    riskMessage = "A known malicious URL or serious security threat was identified. Do not visit this website.";
  } else if (score >= 50) {
    classification = "HIGH_RISK";
    legacyStatus = "DANGEROUS";
    riskMessage = "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.";
  } else if (score >= 25) {
    classification = "MODERATE_RISK";
    legacyStatus = "DANGEROUS";
    riskMessage = "Some unusual URL characteristics were detected. Verify the website before continuing.";
  }

  return {
    url: rawUrl,
    status: legacyStatus,
    message: riskMessage,
    normalizedHostname: host,
    riskScore: score,
    riskClassification: classification,
    riskMessage,
    securityChecks: checks,
    warnings,
    recommendedAction:
      score >= 50
        ? "Do not open this link. Verify the sender through official telephone or in-person channels."
        : score >= 25
        ? "Exercise caution. Confirm the identity of the sender before providing any details."
        : "Link passed heuristic checks. Always confirm banking operations in official apps.",
    timestamp,
    threatIntelligenceAvailable: false,
  };
}
