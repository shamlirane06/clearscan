export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskClassification =
  | "LOW_RISK"
  | "MODERATE_RISK"
  | "HIGH_RISK"
  | "CRITICAL_RISK"
  | "UNABLE_TO_VERIFY";

export type PanelState = "empty" | "loading" | "error" | "result";
export type ScanSource = "qr" | "url" | "message";

export interface SecurityCheckResult {
  checkName: string;
  passed: boolean;
  riskContribution: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "INFO" | "WARNING";
  explanation: string;
  evidence: string;
}

export interface BackendScanResponse {
  url: string;
  status: "SAFE" | "DANGEROUS" | "UNABLE_TO_VERIFY";
  message: string;
  normalizedHostname: string;
  riskScore: number; // 0-100 or -1 if unable to verify
  riskClassification: RiskClassification;
  riskMessage: string;
  securityChecks: SecurityCheckResult[];
  warnings: string[];
  recommendedAction: string;
  timestamp: string;
  threatIntelligenceAvailable: boolean;
}

export interface ScanHistoryItem extends BackendScanResponse {
  id: string;
  source: ScanSource;
}

export interface ScanStats {
  total: number;
  lowRisk: number;
  moderateRisk: number;
  highRisk: number;
  criticalRisk: number;
  unableToVerify: number;
}

// Retain legacy scan types for backwards compatibility with demo flows
export type ScanResult = {
  source: ScanSource;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  warningSigns: string[];
  explanation: string;
  actions: string[];
  inputPreview: string;
  isDemo: boolean;
};

export type MessageExample = {
  id: string;
  label: string;
  text: string;
};
