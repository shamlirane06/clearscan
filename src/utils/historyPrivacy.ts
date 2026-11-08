import type { BackendScanResponse, ScanHistoryItem } from "../types/scan";

export function sanitizeStoredUrl(value: string): string {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.hostname.includes("%")) return "[URL details removed]";
    return url.origin;
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
      evidence: /authority|path|query/i.test(check.checkName) ? "URL detail omitted from local history." : check.evidence,
    })),
  };
}

export function sanitizeHistoryItems(items: unknown): ScanHistoryItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is ScanHistoryItem => Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.url === "string" && Array.isArray(item.securityChecks)))
    .map((item) => sanitizeScanForHistory(item));
}
