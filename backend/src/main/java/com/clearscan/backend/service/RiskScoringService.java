package com.clearscan.backend.service;

import com.clearscan.backend.model.RiskClassification;
import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RiskScoringService {

    /**
     * Calculates the overall risk score from individual check results.
     * Uses a weighted approach: takes the maximum single contribution as a base,
     * then adds diminishing contributions from other failed checks.
     *
     * A CRITICAL check always forces the score to at least 75.
     */
    public int calculateRiskScore(List<SecurityCheckResult> checks) {
        boolean hasCritical = checks.stream()
                .anyMatch(c -> "CRITICAL".equals(c.getRiskLevel()));

        // Collect risk contributions from failed checks, sorted descending
        List<Integer> contributions = checks.stream()
                .filter(c -> !c.isPassed())
                .map(SecurityCheckResult::getRiskContribution)
                .sorted((a, b) -> b - a)
                .toList();

        if (contributions.isEmpty()) {
            return 0;
        }

        // Start with the highest contribution
        double score = contributions.get(0);

        // Add diminishing contributions from other checks
        for (int i = 1; i < contributions.size(); i++) {
            // Each additional check adds 40% of its contribution (diminishing returns)
            score += contributions.get(i) * 0.4;
        }

        int finalScore = Math.min((int) Math.round(score), 100);

        // Critical findings enforce a minimum score of 75
        if (hasCritical && finalScore < 75) {
            finalScore = 75;
        }

        return finalScore;
    }

    public RiskClassification classify(int score) {
        return RiskClassification.fromScore(score);
    }

    /**
     * Maps the new risk classification to the legacy status for backward compatibility.
     */
    public String toLegacyStatus(RiskClassification classification) {
        return switch (classification) {
            case LOW_RISK -> "SAFE";
            case MODERATE_RISK, HIGH_RISK, CRITICAL_RISK -> "DANGEROUS";
            case UNABLE_TO_VERIFY -> "UNABLE_TO_VERIFY";
        };
    }

    public String getRecommendedAction(RiskClassification classification) {
        return switch (classification) {
            case LOW_RISK -> "No immediate threats detected. Still verify the domain before entering personal information.";
            case MODERATE_RISK -> "Proceed with caution. Verify the website through official channels before interacting.";
            case HIGH_RISK -> "Avoid opening this link. Multiple suspicious indicators were detected. Verify the source through trusted channels.";
            case CRITICAL_RISK -> "Do not visit this website. A confirmed threat or critical risk indicators were identified.";
            case UNABLE_TO_VERIFY -> "Security checks could not be fully completed. Treat this link with extra caution.";
        };
    }
}
