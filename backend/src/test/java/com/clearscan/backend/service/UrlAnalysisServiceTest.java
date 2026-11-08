package com.clearscan.backend.service;

import com.clearscan.backend.analyzer.*;
import com.clearscan.backend.dto.ScanResponse;
import com.clearscan.backend.security.SsrfProtection;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import static org.junit.jupiter.api.Assertions.*;

class UrlAnalysisServiceTest {

    private UrlAnalysisService service;

    @BeforeEach
    void setUp() {
        RestClient restClient = RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory()).build();
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
        assertEquals("UNABLE_TO_VERIFY", result.getStatus(), "Legacy status must not imply an unavailable threat-intelligence check was safe");
        assertTrue(result.getRiskScore() < 25, "Risk score should be low for a normal URL");
        assertEquals("LOW_RISK", result.getRiskClassification());
        assertEquals("NOT_CONFIGURED", result.getThreatIntelligenceStatus());
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
    @DisplayName("Public IPv6 literals receive an IP-address warning")
    void publicIpv6AddressIsFlagged() {
        ScanResponse result = service.analyze("https://[2606:4700:4700::1111]/");
        assertEquals("LOW_RISK", result.getRiskClassification());
        assertTrue(result.getSecurityChecks().stream().anyMatch(check -> check.getCheckName().equals("IP Address Detection")));
    }

    @Test
    @DisplayName("4. Suspicious lookalike domain should be flagged")
    void lookalikeDomain() {
        ScanResponse result = service.analyze("https://g00gle.com/login");
        assertEquals(41, result.getRiskScore(), "Score follows max 35 + 40% of the 15 point path check");
        assertEquals("MODERATE_RISK", result.getRiskClassification());
        assertFalse(result.getWarnings().isEmpty(), "Should have warnings");
    }

    @Test
    @DisplayName("5. URL containing suspicious keywords should be flagged")
    void suspiciousKeywords() {
        ScanResponse result = service.analyze("https://secure-login-verify.example.com/account");
        assertTrue(result.getRiskScore() >= 25, "Suspicious keywords should elevate risk");
    }

    @Test
    @DisplayName("Demo preset scores use backend analyzer output and weighted scoring")
    void demoPresetScores() {
        assertEquals(0, service.analyze("https://www.wikipedia.org").getRiskScore());
        assertEquals(41, service.analyze("https://g00gle.com/login").getRiskScore());
        assertEquals(26, service.analyze("https://bit.ly/sbi-urgent-update").getRiskScore());
        assertEquals(56, service.analyze("http://sbi-kyc-update.xyz/verify").getRiskScore());
    }

    @Test
    @DisplayName("6. Shortened URL should be flagged")
    void shortenedUrl() {
        ScanResponse result = service.analyze("https://bit.ly/abc123");
        assertTrue(result.getRiskScore() > 0, "Shortened URL should have some risk");
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.toLowerCase().contains("shortener") || w.toLowerCase().contains("shorten")));
    }

    @Test
    @DisplayName("7. Google test URL is not labeled malicious without a real threat response")
    void testUrlDoesNotInventThreatIntel() {
        ScanResponse result = service.analyze("https://testsafebrowsing.appspot.com/malware");
        assertEquals("NOT_CONFIGURED", result.getThreatIntelligenceStatus());
        assertEquals("LOW_RISK", result.getRiskClassification());
        assertEquals("UNABLE_TO_VERIFY", result.getStatus());
        assertFalse(result.isThreatIntelligenceAvailable());
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
    @DisplayName("Synthetic test host does not create a fake critical result")
    void testHostDoesNotCreateThreat() {
        ScanResponse result = service.analyze("https://testsafebrowsing.appspot.com/safe-looking-page");
        assertEquals("NOT_CONFIGURED", result.getThreatIntelligenceStatus());
        assertEquals("LOW_RISK", result.getRiskClassification());
    }
}
