package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.*;

@Component
public class SuspiciousDomainAnalyzer implements SecurityAnalyzer {

    private static final Set<String> SUSPICIOUS_KEYWORDS = Set.of(
            "login", "verify", "secure", "update", "account", "banking",
            "confirm", "suspend", "alert", "urgent", "password", "signin",
            "credential", "wallet", "helpdesk", "support-team", "kyc"
    );

    private static final Set<String> SUSPICIOUS_TLDS = Set.of(
            ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".work",
            ".click", ".link", ".buzz", ".rest", ".icu", ".cam"
    );

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        List<SecurityCheckResult> results = new ArrayList<>();
        String host = parsedUri.getHost();
        if (host == null) return results;

        String lowerHost = host.toLowerCase();

        // Check suspicious keywords in domain
        List<String> foundKeywords = new ArrayList<>();
        for (String keyword : SUSPICIOUS_KEYWORDS) {
            if (lowerHost.contains(keyword)) {
                foundKeywords.add(keyword);
            }
        }
        if (!foundKeywords.isEmpty()) {
            int risk = Math.min(foundKeywords.size() * 12, 35);
            results.add(SecurityCheckResult.warning("Suspicious Domain Keywords",
                    risk,
                    "The domain contains keywords commonly used in phishing URLs: " + String.join(", ", foundKeywords) + ".",
                    "Domain: " + host));
        } else {
            results.add(SecurityCheckResult.safe("Suspicious Domain Keywords",
                    "No suspicious keywords detected in the domain."));
        }

        // Check excessive subdomains
        String[] parts = lowerHost.split("\\.");
        if (parts.length > 4) {
            results.add(SecurityCheckResult.warning("Excessive Subdomains",
                    20,
                    "The domain has " + parts.length + " levels, which is unusual. Attackers use deep subdomains to hide the real domain.",
                    "Domain: " + host));
        }

        // Check suspicious TLDs
        for (String tld : SUSPICIOUS_TLDS) {
            if (lowerHost.endsWith(tld)) {
                results.add(SecurityCheckResult.warning("Suspicious TLD",
                        15,
                        "The domain uses the \"" + tld + "\" top-level domain, which is frequently associated with malicious websites.",
                        "TLD: " + tld));
                break;
            }
        }

        return results;
    }
}
