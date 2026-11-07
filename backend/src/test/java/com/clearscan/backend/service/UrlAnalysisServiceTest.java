package com.clearscan.backend.service;

import com.clearscan.backend.analyzer.*;
import com.clearscan.backend.dto.ScanResponse;
import com.clearscan.backend.security.SsrfProtection;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;

class UrlAnalysisServiceTest {

    private UrlAnalysisService service;

    @BeforeEach
    void setUp() {
        RestClient restClient = RestClient.builder().build();
        UrlValidationAnalyzer urlValidation = new UrlValidationAnalyzer();
        SuspiciousDomainAnalyzer suspiciousDomain = new SuspiciousDomainAnalyzer();
        LookalikeDomainAnalyzer lookalikeDomain = new LookalikeDomainAnalyzer();
        UrlShortenerAnalyzer urlShortener = new UrlShortenerAnalyzer();
        UrlStructureAnalyzer urlStructure = new UrlStructureAnalyzer();
        ThreatIntelligenceAnalyzer threatIntel = new ThreatIntelligenceAnalyzer(restClient, "", false);
        RiskScoringService riskScoring = new RiskScoringService();
        SsrfProtection ssrfProtection = new SsrfProtection();

        service = new UrlAnalysisService(
                urlValidation, suspiciousDomain, lookalikeDomain,
                urlShortener, urlStructure, threatIntel,
                riskScoring, ssrfProtection
        );
    }

    @Test
    @DisplayName("1. Normal HTTPS URL should have low risk")
    void normalHttpsUrl() {
        ScanResponse result = service.analyze("https://www.wikipedia.org");
        assertEquals("SAFE", result.getStatus());
        assertTrue(result.getRiskScore() < 25, "Risk score should be low for a normal URL");
        assertEquals("LOW_RISK", result.getRiskClassification());
    }

    @Test
    @DisplayName("2. Malformed URL should return UNABLE_TO_VERIFY")
    void malformedUrl() {
        ScanResponse result = service.analyze("not a url at all !!!");
        assertEquals("UNABLE_TO_VERIFY", result.getStatus());
    }

    @Test
    @DisplayName("3. IP-address-based URL should be flagged")
    void ipAddressUrl() {
        ScanResponse result = service.analyze("http://192.168.1.1/admin");
        // Should be blocked by SSRF protection (private IP)
        assertEquals("UNABLE_TO_VERIFY", result.getStatus());
    }

    @Test
    @DisplayName("4. Suspicious lookalike domain should be flagged")
    void lookalikeDomain() {
        ScanResponse result = service.analyze("https://g00gle.com/login");
        assertTrue(result.getRiskScore() >= 25, "Lookalike domain should have elevated risk");
        assertFalse(result.getWarnings().isEmpty(), "Should have warnings");
    }

    @Test
    @DisplayName("5. URL containing suspicious keywords should be flagged")
    void suspiciousKeywords() {
        ScanResponse result = service.analyze("https://secure-login-verify.example.com/account");
        assertTrue(result.getRiskScore() >= 25, "Suspicious keywords should elevate risk");
    }

    @Test
    @DisplayName("6. Shortened URL should be flagged")
    void shortenedUrl() {
        ScanResponse result = service.analyze("https://bit.ly/abc123");
        assertTrue(result.getRiskScore() > 0, "Shortened URL should have some risk");
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.toLowerCase().contains("shortener") || w.toLowerCase().contains("shorten")));
    }

    @Test
    @DisplayName("7. Known malicious synthetic test URL should be CRITICAL")
    void knownMaliciousTestUrl() {
        ScanResponse result = service.analyze("https://testsafebrowsing.appspot.com/malware");
        assertEquals("DANGEROUS", result.getStatus());
        assertTrue(result.getRiskScore() >= 75, "Known malicious should be critical risk");
        assertEquals("CRITICAL_RISK", result.getRiskClassification());
    }

    @Test
    @DisplayName("8. URL that cannot be verified returns proper state")
    void unverifiableUrl() {
        ScanResponse result = service.analyze("ftp://files.example.com/data");
        assertEquals("UNABLE_TO_VERIFY", result.getStatus());
    }

    @Test
    @DisplayName("9. Unavailable threat intelligence does not produce false SAFE")
    void unavailableThreatIntel() {
        // With threat intel disabled, suspicious URL should still be flagged by heuristics
        ScanResponse result = service.analyze("https://sbi-login-verify.xyz/kyc");
        assertNotEquals("SAFE", result.getStatus());
        assertTrue(result.getRiskScore() >= 25);
    }

    @Test
    @DisplayName("10. Localhost URL should be blocked")
    void localhostBlocked() {
        ScanResponse result = service.analyze("http://localhost:8080/admin");
        assertEquals("UNABLE_TO_VERIFY", result.getStatus());
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.toLowerCase().contains("localhost")));
    }

    @Test
    @DisplayName("Risk explanations match detected indicators")
    void riskExplanationsMatch() {
        ScanResponse result = service.analyze("https://amaz0n-login.tk/verify");
        assertFalse(result.getSecurityChecks().isEmpty());
        for (String warning : result.getWarnings()) {
            assertTrue(result.getSecurityChecks().stream()
                    .anyMatch(c -> c.getExplanation().equals(warning)),
                    "Warning should match a security check explanation: " + warning);
        }
    }

    @Test
    @DisplayName("Confirmed malicious result is never downgraded")
    void criticalNeverDowngraded() {
        ScanResponse result = service.analyze("https://testsafebrowsing.appspot.com/safe-looking-page");
        assertTrue(result.getRiskScore() >= 75, "Critical finding should enforce minimum score of 75");
        assertEquals("CRITICAL_RISK", result.getRiskClassification());
    }
}
