package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.net.URI;
import java.util.*;

@Component
public class ThreatIntelligenceAnalyzer implements SecurityAnalyzer {

    private final RestClient restClient;
    private final String apiKey;
    private final boolean enabled;

    public enum Status { NOT_CONFIGURED, CHECKED_NO_MATCH, MATCH_FOUND, UNAVAILABLE }
    public record Outcome(Status status, List<SecurityCheckResult> checks) {}

    public ThreatIntelligenceAnalyzer(
            RestClient restClient,
            @Value("${clearscan.threat-intel.api-key:}") String apiKey,
            @Value("${clearscan.threat-intel.enabled:false}") boolean enabled) {
        this.restClient = restClient;
        this.apiKey = apiKey;
        this.enabled = enabled;
    }

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        return analyzeWithStatus(rawUrl).checks();
    }

    public Outcome analyzeWithStatus(String rawUrl) {

        // If threat intelligence is not enabled or API key is missing
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            return new Outcome(Status.NOT_CONFIGURED, List.of(new SecurityCheckResult(
                    "Threat Intelligence",
                    false,
                    0,
                    "INFO",
                    "Google Safe Browsing was not checked because it is not configured. Local URL heuristics still ran; this is not a safe-list check.",
                    "Service: Not configured"
            )));
        }

        // Call Google Safe Browsing API
        try {
            Map<String, Object> body = Map.of(
                    "client", Map.of("clientId", "clearscan", "clientVersion", "1.0.0"),
                    "threatInfo", Map.of(
                            "threatTypes", List.of("MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"),
                            "platformTypes", List.of("ANY_PLATFORM"),
                            "threatEntryTypes", List.of("URL"),
                            "threatEntries", List.of(Map.of("url", rawUrl))));

            Map<?, ?> response = restClient.post()
                    .uri(uriBuilder -> uriBuilder.scheme("https").host("safebrowsing.googleapis.com")
                            .path("/v4/threatMatches:find").queryParam("key", apiKey).build())
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null || (response.containsKey("matches") && !(response.get("matches") instanceof List<?>))) {
                return unavailable("Google Safe Browsing returned an invalid response.");
            }
            List<?> matches = response != null && response.get("matches") instanceof List<?> list ? list : List.of();
            if (!matches.isEmpty()) {
                boolean validMatches = matches.stream().allMatch(match -> match instanceof Map<?, ?> item
                        && item.get("threatType") instanceof String && item.get("platformType") instanceof String
                        && item.get("threatEntryType") instanceof String);
                if (!validMatches) return unavailable("Google Safe Browsing returned an invalid response.");
                return new Outcome(Status.MATCH_FOUND, List.of(SecurityCheckResult.critical(
                        "Threat Intelligence", "Google Safe Browsing reported a known threat for this URL.", "Source: Google Safe Browsing API")));
            }
            return new Outcome(Status.CHECKED_NO_MATCH, List.of(SecurityCheckResult.safe("Threat Intelligence",
                    "Google Safe Browsing reported no known match. Absence from its database does not guarantee safety.")));
        } catch (Exception e) {
            return unavailable("Google Safe Browsing could not complete the lookup. Local URL heuristics are shown separately.");
        }
    }

    private Outcome unavailable(String explanation) {
        return new Outcome(Status.UNAVAILABLE, List.of(new SecurityCheckResult("Threat Intelligence", false, 0, "INFO",
                explanation, "Service: unavailable")));
    }
}
