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

    // Synthetic test URLs for demo mode — NEVER present as real threat intelligence
    private static final Set<String> DEMO_MALICIOUS_DOMAINS = Set.of(
            "testsafebrowsing.appspot.com",
            "malware.testing.google.test",
            "evil-phishing-test.example.com"
    );

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
        List<SecurityCheckResult> results = new ArrayList<>();
        String host = parsedUri.getHost();

        // Demo mode check
        if (host != null && DEMO_MALICIOUS_DOMAINS.stream().anyMatch(d -> host.toLowerCase().endsWith(d))) {
            results.add(SecurityCheckResult.critical("Threat Intelligence (Demo)",
                    "[DEMO] This URL matches a synthetic test indicator used for demonstration purposes. In production, this would be flagged by a real threat intelligence service.",
                    "Demo malicious domain: " + host));
            return results;
        }

        // If threat intelligence is not enabled or API key is missing
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            results.add(new SecurityCheckResult(
                    "Threat Intelligence",
                    true, // passed (not failed, just unavailable)
                    0,
                    "INFO",
                    "Real-time threat intelligence is not configured. The URL was checked using local heuristic analysis only. A URL not appearing in a threat database does not guarantee safety.",
                    "Service: Not configured"
            ));
            return results;
        }

        // Call Google Safe Browsing API
        try {
            String requestBody = """
                {
                    "client": {
                        "clientId": "clearscan",
                        "clientVersion": "1.0.0"
                    },
                    "threatInfo": {
                        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                        "platformTypes": ["ANY_PLATFORM"],
                        "threatEntryTypes": ["URL"],
                        "threatEntries": [{"url": "%s"}]
                    }
                }
                """.formatted(rawUrl.replace("\"", "\\\""));

            String response = restClient.post()
                    .uri("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (response != null && response.contains("\"matches\"")) {
                results.add(SecurityCheckResult.critical("Threat Intelligence",
                        "This URL has been identified as malicious by Google Safe Browsing. The threat database confirms this is a known dangerous URL.",
                        "Source: Google Safe Browsing API"));
            } else {
                results.add(SecurityCheckResult.safe("Threat Intelligence",
                        "No known threats found in Google Safe Browsing database. Note: a URL not appearing in the database does not guarantee it is safe."));
            }
        } catch (Exception e) {
            results.add(new SecurityCheckResult(
                    "Threat Intelligence",
                    true, // Don't mark as failed-unsafe
                    0,
                    "WARNING",
                    "Threat intelligence service was unavailable. The URL was checked using local heuristic analysis only. Treat results with additional caution.",
                    "Error: Service timeout or unavailable"
            ));
        }

        return results;
    }

    public boolean isAvailable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
