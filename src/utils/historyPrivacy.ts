import type { BackendScanResponse, ScanHistoryItem } from "../types/scan";

export function sanitizeStoredUrl(value: string): string {
  if (!value || value === "[URL details removed]") return value;
  try {
    const target = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(target);
    if (!["http:", "https:"].includes(url.protocol) || url.hostname.includes("%")) return "[URL details removed]";
    // Remove embedded credentials if present, but preserve full destination URL including path and query
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return "[URL details removed]";
  }
}

export function sanitizeScanForHistory<T extends BackendScanResponse>(scan: T): T {
  return {
    ...scan,
    url: sanitizeStoredUrl(scan.url),
    securityChecks: scan.securityChecks.map((check) => ({
      ...check,
      evidence: check.evidence,
    })),
  };
}

export function sanitizeHistoryItems(items: unknown): ScanHistoryItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is ScanHistoryItem => Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.url === "string" && Array.isArray(item.securityChecks)))
    .map((item) => sanitizeScanForHistory(item));
}
