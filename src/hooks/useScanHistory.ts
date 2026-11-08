import { useState, useEffect } from "react";
import type { BackendScanResponse, ScanHistoryItem, ScanSource, ScanStats } from "../types/scan";
import { sanitizeHistoryItems, sanitizeScanForHistory } from "../utils/historyPrivacy";

const STORAGE_KEY = "clearscan_history_v1";

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return sanitizeHistoryItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load scan history:", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to persist scan history:", e);
    }
  }, [history]);

  const addScan = (response: BackendScanResponse, source: ScanSource = "url") => {
    const newItem: ScanHistoryItem = {
      ...sanitizeScanForHistory(response),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const removeScan = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear scan history:", e);
    }
  };

  const stats: ScanStats = {
    total: history.length,
    lowRisk: history.filter((i) => i.riskClassification === "LOW_RISK").length,
    moderateRisk: history.filter((i) => i.riskClassification === "MODERATE_RISK").length,
    highRisk: history.filter((i) => i.riskClassification === "HIGH_RISK").length,
    criticalRisk: history.filter((i) => i.riskClassification === "CRITICAL_RISK").length,
    unableToVerify: history.filter((i) => i.riskClassification === "UNABLE_TO_VERIFY").length,
  };

  return {
    history,
    addScan,
    removeScan,
    clearHistory,
    stats,
  };
}
