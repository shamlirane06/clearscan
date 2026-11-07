package com.clearscan.backend.dto;

import com.clearscan.backend.model.RiskClassification;
import com.clearscan.backend.model.SecurityCheckResult;
import java.time.Instant;
import java.util.List;

public class ScanResponse {
    // Legacy fields for backward compatibility
    private String url;
    private String status; // "SAFE", "DANGEROUS", "UNABLE_TO_VERIFY"
    private String message;

    // New rich fields
    private String normalizedHostname;
    private int riskScore;
    private String riskClassification;
    private String riskMessage;
    private List<SecurityCheckResult> securityChecks;
    private List<String> warnings;
    private String recommendedAction;
    private String timestamp;
    private boolean threatIntelligenceAvailable;

    public ScanResponse() {}

    // Builder-style setters
    public ScanResponse url(String url) { this.url = url; return this; }
    public ScanResponse status(String status) { this.status = status; return this; }
    public ScanResponse message(String message) { this.message = message; return this; }
    public ScanResponse normalizedHostname(String h) { this.normalizedHostname = h; return this; }
    public ScanResponse riskScore(int s) { this.riskScore = s; return this; }
    public ScanResponse riskClassification(String c) { this.riskClassification = c; return this; }
    public ScanResponse riskMessage(String m) { this.riskMessage = m; return this; }
    public ScanResponse securityChecks(List<SecurityCheckResult> checks) { this.securityChecks = checks; return this; }
    public ScanResponse warnings(List<String> w) { this.warnings = w; return this; }
    public ScanResponse recommendedAction(String a) { this.recommendedAction = a; return this; }
    public ScanResponse timestamp(String t) { this.timestamp = t; return this; }
    public ScanResponse threatIntelligenceAvailable(boolean t) { this.threatIntelligenceAvailable = t; return this; }

    // All getters
    public String getUrl() { return url; }
    public String getStatus() { return status; }
    public String getMessage() { return message; }
    public String getNormalizedHostname() { return normalizedHostname; }
    public int getRiskScore() { return riskScore; }
    public String getRiskClassification() { return riskClassification; }
    public String getRiskMessage() { return riskMessage; }
    public List<SecurityCheckResult> getSecurityChecks() { return securityChecks; }
    public List<String> getWarnings() { return warnings; }
    public String getRecommendedAction() { return recommendedAction; }
    public String getTimestamp() { return timestamp; }
    public boolean isThreatIntelligenceAvailable() { return threatIntelligenceAvailable; }
}
