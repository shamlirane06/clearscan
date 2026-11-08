package com.clearscan.backend.service;

import com.clearscan.backend.analyzer.*;
import com.clearscan.backend.dto.ScanResponse;
import com.clearscan.backend.model.RiskClassification;
import com.clearscan.backend.model.SecurityCheckResult;
import com.clearscan.backend.security.SsrfProtection;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class UrlAnalysisService {

    private final List<SecurityAnalyzer> analyzers;
    private final RiskScoringService riskScoringService;
    private final SsrfProtection ssrfProtection;
    private final ThreatIntelligenceAnalyzer threatIntelligenceAnalyzer;

    public UrlAnalysisService(
            UrlValidationAnalyzer urlValidationAnalyzer,
            SuspiciousDomainAnalyzer suspiciousDomainAnalyzer,
            LookalikeDomainAnalyzer lookalikeDomainAnalyzer,
            UrlShortenerAnalyzer urlShortenerAnalyzer,
            UrlStructureAnalyzer urlStructureAnalyzer,
            ThreatIntelligenceAnalyzer threatIntelligenceAnalyzer,
            RiskScoringService riskScoringService,
            SsrfProtection ssrfProtection) {

        // Keep deterministic local checks separate from external threat intelligence.
        this.analyzers = List.of(
                urlValidationAnalyzer,
                suspiciousDomainAnalyzer,
                lookalikeDomainAnalyzer,
                urlShortenerAnalyzer,
                urlStructureAnalyzer
        );
        this.riskScoringService = riskScoringService;
        this.ssrfProtection = ssrfProtection;
        this.threatIntelligenceAnalyzer = threatIntelligenceAnalyzer;
    }

    public ScanResponse analyze(String rawUrl) {
        String timestamp = Instant.now().toString();

        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            return buildErrorResponse("", "URL cannot be empty.", timestamp);
        }
        if (rawUrl.length() > 2048) return buildErrorResponse(rawUrl, "URL exceeds the 2048 character limit.", timestamp);

        // Normalize URL
        String normalizedUrl = rawUrl.trim();
        if (!normalizedUrl.contains("://")) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        // Parse URL
        URI parsedUri;
        try {
            parsedUri = URI.create(normalizedUrl);
            if (parsedUri.getHost() == null) {
                throw new IllegalArgumentException("No host in URL");
            }
            if (parsedUri.getUserInfo() != null || parsedUri.getPort() < -1 || parsedUri.getPort() > 65535 || parsedUri.getPort() == 0) {
                throw new IllegalArgumentException("Invalid URL authority");
            }
        } catch (Exception e) {
            return buildErrorResponse(rawUrl, "The provided URL could not be parsed. Please check the format.", timestamp);
        }

        // Protocol restriction
        String scheme = parsedUri.getScheme();
        if (scheme != null && !scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https")) {
            return buildErrorResponse(rawUrl, "Only HTTP and HTTPS URLs are supported for security scanning.", timestamp);
        }

        // SSRF protection
        String ssrfError = ssrfProtection.validate(parsedUri);
        if (ssrfError != null) {
            return buildErrorResponse(rawUrl, ssrfError, timestamp);
        }

        // Run all analyzers
        List<SecurityCheckResult> allChecks = new ArrayList<>();
        for (SecurityAnalyzer analyzer : analyzers) {
            try {
                allChecks.addAll(analyzer.analyze(normalizedUrl, parsedUri));
            } catch (Exception e) {
                return buildErrorResponse(rawUrl,
                        "A required local security check could not complete. Treat this URL as unverified.", timestamp);
            }
        }

        ThreatIntelligenceAnalyzer.Outcome threatOutcome = threatIntelligenceAnalyzer.analyzeWithStatus(normalizedUrl);
        allChecks.addAll(threatOutcome.checks());

        // Calculate risk score
        int riskScore = riskScoringService.calculateRiskScore(allChecks);
        RiskClassification classification = riskScoringService.classify(riskScore);
        // Legacy SAFE must never imply Safe Browsing succeeded. Keep the richer heuristic
        // classification separate and use the legacy unverifiable state until TI was checked.
        boolean threatIntelChecked = threatOutcome.status() == ThreatIntelligenceAnalyzer.Status.CHECKED_NO_MATCH
                || threatOutcome.status() == ThreatIntelligenceAnalyzer.Status.MATCH_FOUND;
        String legacyStatus = classification == RiskClassification.LOW_RISK && !threatIntelChecked
                ? "UNABLE_TO_VERIFY" : riskScoringService.toLegacyStatus(classification);

        // Collect warnings
        List<String> warnings = allChecks.stream()
                .filter(c -> !c.isPassed())
                .map(SecurityCheckResult::getExplanation)
                .toList();

        // Build hostname
        String hostname = parsedUri.getHost() != null ? parsedUri.getHost().toLowerCase() : "unknown";

        return new ScanResponse()
                .url(rawUrl)
                .status(legacyStatus)
                .message(classification.getMessage())
                .normalizedHostname(hostname)
                .riskScore(riskScore)
                .riskClassification(classification.name())
                .riskMessage(classification.getMessage())
                .securityChecks(allChecks)
                .warnings(warnings)
                .recommendedAction(riskScoringService.getRecommendedAction(classification))
                .timestamp(timestamp)
                .threatIntelligenceAvailable(threatIntelChecked)
                .analysisSource("BACKEND")
                .threatIntelligenceStatus(threatOutcome.status().name());
    }

    private ScanResponse buildErrorResponse(String rawUrl, String errorMessage, String timestamp) {
        return new ScanResponse()
                .url(rawUrl)
                .status("UNABLE_TO_VERIFY")
                .message(errorMessage)
                .normalizedHostname("unknown")
                .riskScore(-1)
                .riskClassification(RiskClassification.UNABLE_TO_VERIFY.name())
                .riskMessage(RiskClassification.UNABLE_TO_VERIFY.getMessage())
                .securityChecks(List.of())
                .warnings(List.of(errorMessage))
                .recommendedAction("The URL could not be analyzed. Do not open it unless you can verify its source through a trusted channel.")
                .timestamp(timestamp)
                .threatIntelligenceAvailable(false)
                .analysisSource("BACKEND")
                .threatIntelligenceStatus("NOT_CHECKED");
    }
}
