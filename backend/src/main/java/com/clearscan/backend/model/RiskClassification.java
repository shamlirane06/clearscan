package com.clearscan.backend.model;

public enum RiskClassification {
    LOW_RISK(0, 24, "No threats were detected by the checks performed. This does not guarantee that the website is safe."),
    MODERATE_RISK(25, 49, "Some unusual URL characteristics were detected. Verify the website before continuing."),
    HIGH_RISK(50, 74, "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source."),
    CRITICAL_RISK(75, 100, "A known malicious URL or serious security threat was identified. Do not visit this website."),
    UNABLE_TO_VERIFY(-1, -1, "We could not complete all required security checks. Treat this link with caution.");

    private final int minScore;
    private final int maxScore;
    private final String message;

    RiskClassification(int minScore, int maxScore, String message) {
        this.minScore = minScore;
        this.maxScore = maxScore;
        this.message = message;
    }

    public String getMessage() { return message; }
    public int getMinScore() { return minScore; }
    public int getMaxScore() { return maxScore; }

    public static RiskClassification fromScore(int score) {
        if (score < 0) return UNABLE_TO_VERIFY;
        if (score <= 24) return LOW_RISK;
        if (score <= 49) return MODERATE_RISK;
        if (score <= 74) return HIGH_RISK;
        return CRITICAL_RISK;
    }
}
