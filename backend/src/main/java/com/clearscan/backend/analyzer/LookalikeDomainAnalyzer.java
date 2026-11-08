package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.*;

@Component
public class LookalikeDomainAnalyzer implements SecurityAnalyzer {

    // Map of brand -> list of legitimate domains
    private static final Map<String, List<String>> BRAND_DOMAINS = Map.ofEntries(
            Map.entry("google", List.of("google.com", "google.co.in")),
            Map.entry("amazon", List.of("amazon.com", "amazon.in")),
            Map.entry("facebook", List.of("facebook.com")),
            Map.entry("microsoft", List.of("microsoft.com", "live.com", "outlook.com")),
            Map.entry("apple", List.of("apple.com", "icloud.com")),
            Map.entry("paypal", List.of("paypal.com")),
            Map.entry("netflix", List.of("netflix.com")),
            Map.entry("instagram", List.of("instagram.com")),
            Map.entry("whatsapp", List.of("whatsapp.com")),
            Map.entry("sbi", List.of("sbi.co.in", "onlinesbi.sbi")),
            Map.entry("hdfc", List.of("hdfcbank.com")),
            Map.entry("icici", List.of("icicibank.com")),
            Map.entry("paytm", List.of("paytm.com")),
            Map.entry("phonepe", List.of("phonepe.com")),
            Map.entry("gpay", List.of("pay.google.com"))
    );

    // Common character substitutions used in lookalike domains
    // Normalize only unambiguous lookalike glyphs. Mapping ordinary letters such as i/l
    // to each other also corrupted legitimate targets (for example g00gle -> googie).
    private static final Map<Character, Character> CHAR_SUBSTITUTIONS = Map.of(
            '0', 'o', '1', 'l', '3', 'e', '4', 'a', '5', 's', '7', 't', '9', 'g', '@', 'a', '$', 's'
    );

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        List<SecurityCheckResult> results = new ArrayList<>();
        String host = parsedUri.getHost();
        if (host == null) return results;

        String lowerHost = host.toLowerCase();

        // Check for Punycode (internationalized domain names)
        if (lowerHost.startsWith("xn--") || lowerHost.contains(".xn--")) {
            results.add(SecurityCheckResult.warning("Punycode Domain",
                    25,
                    "This domain uses Punycode (internationalized characters), which can be used to create visually identical lookalike domains.",
                    "Domain: " + host));
        }

        // Check each brand for lookalike
        for (Map.Entry<String, List<String>> entry : BRAND_DOMAINS.entrySet()) {
            String brand = entry.getKey();
            List<String> legitimateDomains = entry.getValue();

            // Skip if this IS the legitimate domain
            boolean isLegitimate = legitimateDomains.stream()
                    .anyMatch(d -> lowerHost.equals(d) || lowerHost.endsWith("." + d));
            if (isLegitimate) continue;

            // Check if domain contains the brand name but isn't the real domain
            if (lowerHost.contains(brand)) {
                results.add(SecurityCheckResult.warning("Possible Brand Impersonation",
                        30,
                        "The domain contains \"" + brand + "\" but does not match any known official " + brand + " domain. This could be an impersonation attempt.",
                        "Domain: " + host + " | Official: " + String.join(", ", legitimateDomains)));
                break; // Only report the first brand match
            }

            // Check for character-substitution lookalikes
            String normalizedHost = normalizeSubstitutions(lowerHost);
            if (normalizedHost.contains(brand) && !lowerHost.contains(brand)) {
                results.add(SecurityCheckResult.warning("Lookalike Domain Detected",
                        35,
                        "The domain appears to impersonate \"" + brand + "\" using character substitutions (e.g., replacing letters with numbers). This is a common phishing technique.",
                        "Domain: " + host + " | Looks like: " + brand));
                break;
            }
        }

        if (results.isEmpty()) {
            results.add(SecurityCheckResult.safe("Lookalike Domain Detection",
                    "No brand impersonation patterns were detected."));
        }

        return results;
    }

    private String normalizeSubstitutions(String domain) {
        StringBuilder normalized = new StringBuilder();
        for (char c : domain.toCharArray()) normalized.append(CHAR_SUBSTITUTIONS.getOrDefault(c, c));
        return normalized.toString();
    }
}
