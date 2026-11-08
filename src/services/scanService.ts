import type { BackendScanResponse, RiskClassification, SecurityCheckResult } from "../types/scan";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
const TIMEOUT_MS = 6000;

export async function scanUrl(url: string): Promise<BackendScanResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }), signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
    const raw: unknown = await response.json();
    if (!isBackendResponse(raw)) throw new Error("Backend returned an invalid scan response");
    return {
      ...raw,
      analysisSource: raw.analysisSource || "BACKEND",
      threatIntelligenceStatus: raw.threatIntelligenceStatus || (raw.threatIntelligenceAvailable ? "CHECKED_NO_MATCH" : "NOT_CONFIGURED"),
    };
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError"
      ? "The backend scan timed out."
      : error instanceof Error ? error.message : "The backend could not be reached.";
    console.warn(`${reason} Falling back to local URL heuristics.`);
    return performClientFallbackAnalysis(url, reason);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isBackendResponse(value: unknown): value is BackendScanResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const classes = ["LOW_RISK", "MODERATE_RISK", "HIGH_RISK", "CRITICAL_RISK", "UNABLE_TO_VERIFY"];
  const intelStatuses = ["NOT_CONFIGURED", "CHECKED_NO_MATCH", "MATCH_FOUND", "UNAVAILABLE", "NOT_CHECKED"];
  const validCheck = (check: unknown) => {
    if (!check || typeof check !== "object") return false;
    const result = check as Record<string, unknown>;
    return typeof result.checkName === "string" && typeof result.passed === "boolean"
      && Number.isInteger(result.riskContribution) && Number(result.riskContribution) >= 0 && Number(result.riskContribution) <= 100
      && ["LOW", "MEDIUM", "HIGH", "CRITICAL", "INFO", "WARNING"].includes(String(result.riskLevel))
      && typeof result.explanation === "string" && typeof result.evidence === "string";
  };
  return typeof data.url === "string" && ["SAFE", "DANGEROUS", "UNABLE_TO_VERIFY"].includes(String(data.status))
    && typeof data.message === "string" && typeof data.normalizedHostname === "string"
    && Number.isInteger(data.riskScore) && Number(data.riskScore) >= -1 && Number(data.riskScore) <= 100
    && typeof data.riskClassification === "string" && classes.includes(data.riskClassification)
    && (Number(data.riskScore) < 0) === (data.riskClassification === "UNABLE_TO_VERIFY")
    && typeof data.riskMessage === "string" && Array.isArray(data.securityChecks) && data.securityChecks.every(validCheck)
    && Array.isArray(data.warnings) && data.warnings.every((warning) => typeof warning === "string")
    && typeof data.recommendedAction === "string" && typeof data.timestamp === "string"
    && Number.isFinite(Date.parse(data.timestamp)) && typeof data.threatIntelligenceAvailable === "boolean"
    && (data.analysisSource === undefined || ["BACKEND", "LOCAL_FALLBACK"].includes(String(data.analysisSource)))
    && (data.threatIntelligenceStatus === undefined || intelStatuses.includes(String(data.threatIntelligenceStatus)));
}

const brands: Record<string, string[]> = {
  google: ["google.com", "google.co.in"], amazon: ["amazon.com", "amazon.in"],
  facebook: ["facebook.com"], microsoft: ["microsoft.com", "live.com", "outlook.com"],
  apple: ["apple.com", "icloud.com"], paypal: ["paypal.com"], netflix: ["netflix.com"],
  instagram: ["instagram.com"], whatsapp: ["whatsapp.com"], sbi: ["sbi.co.in", "onlinesbi.sbi"],
  hdfc: ["hdfcbank.com"], icici: ["icicibank.com"], paytm: ["paytm.com"],
  phonepe: ["phonepe.com"], gpay: ["pay.google.com"],
};
const substitutions: Record<string, string> = { "0": "o", "1": "l", i: "l", "3": "e", "4": "a", "5": "s", "9": "g", q: "g", "7": "t" };
const suspiciousKeywords = ["login", "verify", "secure", "update", "account", "banking", "confirm", "suspend", "alert", "urgent", "password", "signin", "credential", "wallet", "helpdesk", "support-team", "kyc"];
const suspiciousTlds = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".work", ".click", ".link", ".buzz", ".rest", ".icu", ".cam"];
const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "rb.gy", "short.io", "cutt.ly", "shorturl.at", "t.ly", "v.gd", "qr.ae", "lnkd.in", "db.tt", "j.mp", "amzn.to", "youtu.be", "surl.li"];

function blockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "metadata.google.internal") return true;
  if (h.includes(":")) return h === "::" || h === "::1" || /^f[cd]/i.test(h) || /^fe[89ab]/i.test(h) || h.startsWith("ff") || h.startsWith("::ffff:");
  if (/^(?:0x[\da-f]+|\d+)(?:\.(?:0x[\da-f]+|\d+))*$/i.test(h) && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(h)) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  if ([m[1],m[2],m[3],m[4]].some((part) => part.length > 1 && part.startsWith("0"))) return true;
  const [a,b] = [Number(m[1]), Number(m[2])];
  return [m[1],m[2],m[3],m[4]].some((x) => Number(x) > 255) || a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168 || b === 88 && Number(m[3]) === 99))
    || (a === 198 && (b === 18 || b === 19 || b === 51 && Number(m[3]) === 100))
    || (a === 203 && b === 0 && Number(m[3]) === 113);
}

function makeUnable(rawUrl: string, reason: string, timestamp: string): BackendScanResponse {
  return {
    url: rawUrl, status: "UNABLE_TO_VERIFY", message: reason, normalizedHostname: "unknown", riskScore: -1,
    riskClassification: "UNABLE_TO_VERIFY", riskMessage: "Required URL checks could not complete. Treat this link with caution.",
    securityChecks: [], warnings: [reason], recommendedAction: "Do not open the link until you can verify it through a trusted channel.",
    timestamp, threatIntelligenceAvailable: false, analysisSource: "LOCAL_FALLBACK",
    threatIntelligenceStatus: "NOT_CHECKED", analysisNotice: "Only local URL analysis was available because the backend could not complete the scan.",
  };
}

export function performClientFallbackAnalysis(rawUrl: string, backendFailure = "Backend service unavailable"): BackendScanResponse {
  const timestamp = new Date().toISOString();
  const input = rawUrl.trim();
  if (!input || input.length > 2048) return makeUnable(rawUrl, "Enter a URL with no more than 2048 characters.", timestamp);
  const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`;
  let parsed: URL;
  try { parsed = new URL(normalized); } catch { return makeUnable(rawUrl, "The URL format could not be parsed.", timestamp); }
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || (parsed.port && Number(parsed.port) === 0)) {
    return makeUnable(rawUrl, "Only valid HTTP and HTTPS URLs without embedded credentials can be analyzed.", timestamp);
  }
  const host = parsed.hostname.toLowerCase();
  if (host.includes("%") || /\s/.test(host) || blockedHost(host)) return makeUnable(rawUrl, "This hostname is malformed, local, private, reserved, or ambiguous and cannot be analyzed.", timestamp);

  const checks: SecurityCheckResult[] = [];
  const add = (checkName: string, riskContribution: number, explanation: string, evidence = "") => checks.push({
    checkName, passed: false, riskContribution,
    riskLevel: riskContribution >= 75 ? "CRITICAL" : riskContribution >= 30 ? "HIGH" : riskContribution >= 15 ? "MEDIUM" : "LOW",
    explanation, evidence,
  });
  const safe = (checkName: string, explanation: string) => checks.push({ checkName, passed: true, riskContribution: 0, riskLevel: "LOW", explanation, evidence: "" });

  if (parsed.protocol === "http:") add("URL Validation", 10, "URL uses unencrypted HTTP instead of HTTPS.", "Protocol: http");
  const ipv4 = host.match(/^\d{1,3}(?:\.\d{1,3}){3}$/);
  if (ipv4 || host.includes(":")) add("IP Address Detection", 20, "URL uses a raw IP address instead of a domain name.", `Host: ${host}`);
  if (parsed.port && !["80", "443"].includes(parsed.port)) add("Unusual Port", 15, "URL specifies a non-standard port.", `Port: ${parsed.port}`);
  if (/%(?:00|0[aAdD]|25|3[cCeE]|2[27])/i.test(normalized)) add("Suspicious Encoding", 20, "URL contains suspicious encoded characters that may disguise the destination.", "Suspicious encoding detected");
  const foundKeywords = suspiciousKeywords.filter((keyword) => host.includes(keyword));
  if (foundKeywords.length) add("Suspicious Domain Keywords", Math.min(foundKeywords.length * 12, 35), `The domain contains keywords commonly used in phishing URLs: ${foundKeywords.join(", ")}.`, `Domain: ${host}`);
  const hostLabels = host.split(".");
  if (hostLabels.length > 4) add("Excessive Subdomains", 20, "The domain has more than four levels, which is unusual.", `Domain: ${host}`);
  const tld = suspiciousTlds.find((suffix) => host.endsWith(suffix));
  if (tld) add("Suspicious TLD", 15, `The domain uses the ${tld} top-level domain, which is frequently associated with malicious websites.`, `TLD: ${tld}`);
  for (const [brand, legitDomains] of Object.entries(brands)) {
    if (legitDomains.some((domain) => host === domain || host.endsWith(`.${domain}`))) continue;
    if (host.includes(brand)) { add("Possible Brand Impersonation", 30, `Possible brand impersonation: the domain contains "${brand}" but does not match known official domains.`, `Domain: ${host}`); break; }
    const normalizedHost = [...host].map((char) => substitutions[char] ?? char).join("");
    if (normalizedHost.includes(brand) && !host.includes(brand)) { add("Lookalike Domain Detected", 35, `A lookalike domain appears to imitate "${brand}" using character substitutions.`, `Domain: ${host}`); break; }
  }
  if (host.startsWith("xn--") || host.includes(".xn--")) add("Punycode Domain", 25, "This domain uses Punycode, which can be used to create visually similar lookalike domains.", `Domain: ${host}`);
  if (shorteners.some((domain) => host === domain || host.endsWith(`.${domain}`))) add("URL Shortener Detected", 20, "This URL uses a shortening service; its destination cannot be checked without following the redirect.", `Shortener: ${host}`);
  if (normalized.length > 200) add("Excessive URL Length", 10, "This URL is unusually long.", `Length: ${normalized.length}`);
  if (parsed.host.includes("@")) add("Misleading @ Symbol", 30, "The URL authority contains an @ symbol, which can obscure the actual host.", "URL authority contains @");
  if ([...parsed.search].length > 10) add("Excessive Query Parameters", 10, "The URL contains more than ten query parameters.", `${[...parsed.search].length} parameters detected`);
  const pathWords = ["login", "signin", "verify", "account", "password", "secure", "update", "confirm", "banking"].filter((word) => parsed.pathname.toLowerCase().includes(word));
  if (pathWords.length) add("Suspicious Path Keywords", 15, `The URL path contains sensitive keywords: ${pathWords.join(", ")}.`, `Path: ${parsed.pathname}`);
  if (checks.length === 0) safe("Local URL Heuristics", "No suspicious patterns were detected by the local URL checks. This does not verify the website or its reputation.");

  const contributions = checks.filter((check) => !check.passed).map((check) => check.riskContribution).sort((a,b) => b-a);
  let score = contributions.length ? Math.min(100, Math.round(contributions[0] + contributions.slice(1).reduce((sum, value) => sum + value * 0.4, 0))) : 0;
  if (checks.some((check) => check.riskLevel === "CRITICAL") && score < 75) score = 75;
  const classification: RiskClassification = score < 25 ? "LOW_RISK" : score < 50 ? "MODERATE_RISK" : score < 75 ? "HIGH_RISK" : "CRITICAL_RISK";
  const message: Record<Exclude<RiskClassification, "UNABLE_TO_VERIFY">, string> = {
    LOW_RISK: "No warning patterns were detected by local checks. This does not guarantee the website is safe.",
    MODERATE_RISK: "Some unusual URL characteristics were detected. Verify the website before continuing.",
    HIGH_RISK: "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.",
    CRITICAL_RISK: "A critical risk indicator was identified. Do not visit this website.",
  };
  const warnings = checks.filter((check) => !check.passed).map((check) => check.explanation);
  return {
    url: rawUrl, status: classification === "LOW_RISK" ? "UNABLE_TO_VERIFY" : "DANGEROUS", message: message[classification],
    normalizedHostname: host, riskScore: score, riskClassification: classification, riskMessage: message[classification],
    securityChecks: checks, warnings,
    recommendedAction: score >= 50 ? "Do not open this link. Verify the sender through official channels." : score >= 25 ? "Verify the website through an official channel before interacting." : "Use normal caution. A low heuristic score is not a safety verification.",
    timestamp, threatIntelligenceAvailable: false, analysisSource: "LOCAL_FALLBACK", threatIntelligenceStatus: "NOT_CHECKED",
    analysisNotice: `Only local URL analysis was available. Backend analysis and Google Safe Browsing were not completed (${backendFailure}).`,
  };
}
