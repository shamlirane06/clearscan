package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LookalikeDomainAnalyzerTest {

    private final LookalikeDomainAnalyzer analyzer = new LookalikeDomainAnalyzer();

    @Test
    @DisplayName("Legitimate Google domain should pass")
    void legitimateGoogle() {
        List<SecurityCheckResult> results = analyzer.analyze(
                "https://www.google.com", URI.create("https://www.google.com"));
        assertTrue(results.stream().allMatch(SecurityCheckResult::isPassed));
    }

    @Test
    @DisplayName("g00gle.com should be detected as lookalike")
    void googleLookalike() {
        List<SecurityCheckResult> results = analyzer.analyze(
                "https://g00gle.com", URI.create("https://g00gle.com"));
        assertTrue(results.stream().anyMatch(r -> !r.isPassed() && r.getCheckName().contains("Lookalike")));
    }

    @Test
    @DisplayName("amaz0n.com should be detected as lookalike")
    void amazonLookalike() {
        List<SecurityCheckResult> results = analyzer.analyze(
                "https://amaz0n.com", URI.create("https://amaz0n.com"));
        assertTrue(results.stream().anyMatch(r -> !r.isPassed()));
    }

    @Test
    @DisplayName("Brand name in wrong domain should flag impersonation")
    void brandInWrongDomain() {
        List<SecurityCheckResult> results = analyzer.analyze(
                "https://google-login.evil.com", URI.create("https://google-login.evil.com"));
        assertTrue(results.stream().anyMatch(r -> !r.isPassed() && r.getCheckName().contains("Brand")));
    }

    @Test
    @DisplayName("Punycode domain should be flagged")
    void punycodeDomain() {
        List<SecurityCheckResult> results = analyzer.analyze(
                "https://xn--80ak6aa92e.com", URI.create("https://xn--80ak6aa92e.com"));
        assertTrue(results.stream().anyMatch(r -> !r.isPassed() && r.getCheckName().contains("Punycode")));
    }
}
