package com.clearscan.backend.model;

public class SecurityCheckResult {
    private final String checkName;
    private final boolean passed;
    private final int riskContribution; // 0-100 how much this check contributes to risk
    private final String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private final String explanation;
    private final String evidence;

    public SecurityCheckResult(String checkName, boolean passed, int riskContribution,
                                String riskLevel, String explanation, String evidence) {
        this.checkName = checkName;
        this.passed = passed;
        this.riskContribution = riskContribution;
        this.riskLevel = riskLevel;
        this.explanation = explanation;
        this.evidence = evidence;
    }

    // Static factory methods
    public static SecurityCheckResult safe(String checkName, String explanation) {
        return new SecurityCheckResult(checkName, true, 0, "LOW", explanation, "");
    }

    public static SecurityCheckResult warning(String checkName, int riskContribution,
                                               String explanation, String evidence) {
        String level = riskContribution >= 30 ? "HIGH" : riskContribution >= 15 ? "MEDIUM" : "LOW";
        return new SecurityCheckResult(checkName, false, riskContribution, level, explanation, evidence);
    }

    public static SecurityCheckResult critical(String checkName, String explanation, String evidence) {
        return new SecurityCheckResult(checkName, false, 100, "CRITICAL", explanation, evidence);
    }

    // Getters
    public String getCheckName() { return checkName; }
    public boolean isPassed() { return passed; }
    public int getRiskContribution() { return riskContribution; }
    public String getRiskLevel() { return riskLevel; }
    public String getExplanation() { return explanation; }
    public String getEvidence() { return evidence; }
}
