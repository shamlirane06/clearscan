package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.*;

@Component
public class UrlStructureAnalyzer implements SecurityAnalyzer {

    private static final int SUSPICIOUS_LENGTH = 200;
    private static final int MAX_QUERY_PARAMS = 10;

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        List<SecurityCheckResult> results = new ArrayList<>();

        // Check URL length
        if (rawUrl.length() > SUSPICIOUS_LENGTH) {
            results.add(SecurityCheckResult.warning("Excessive URL Length",
                    10,
                    "This URL is unusually long (" + rawUrl.length() + " characters). Excessively long URLs may be used to hide malicious parameters.",
                    "Length: " + rawUrl.length() + " characters"));
        }

        // Check for @ symbol (can be used to mislead: http://trusted.com@evil.com)
        String authority = parsedUri.getAuthority();
        if (authority != null && authority.contains("@")) {
            results.add(SecurityCheckResult.warning("Misleading @ Symbol",
                    30,
                    "The URL contains an '@' symbol in the authority section. This can be used to make a URL appear to point to a trusted domain while actually redirecting to a different server.",
                    "Authority: " + authority));
        }

        // Check excessive query parameters
        String query = parsedUri.getQuery();
        if (query != null) {
            long paramCount = query.chars().filter(c -> c == '&').count() + 1;
            if (paramCount > MAX_QUERY_PARAMS) {
                results.add(SecurityCheckResult.warning("Excessive Query Parameters",
                        10,
                        "The URL contains " + paramCount + " query parameters, which is unusual and may indicate tracking or obfuscation.",
                        paramCount + " parameters detected"));
            }
        }

        // Check for suspicious path keywords
        String path = parsedUri.getPath();
        if (path != null) {
            String lowerPath = path.toLowerCase();
            List<String> suspiciousPathWords = new ArrayList<>();
            for (String word : List.of("login", "signin", "verify", "account", "password", "secure", "update", "confirm", "banking")) {
                if (lowerPath.contains(word)) {
                    suspiciousPathWords.add(word);
                }
            }
            if (!suspiciousPathWords.isEmpty()) {
                results.add(SecurityCheckResult.warning("Suspicious Path Keywords",
                        15,
                        "The URL path contains sensitive keywords often used in phishing pages: " + String.join(", ", suspiciousPathWords) + ".",
                        "Path: " + path));
            }
        }

        if (results.isEmpty()) {
            results.add(SecurityCheckResult.safe("URL Structure Analysis",
                    "No suspicious structural patterns detected in the URL."));
        }

        return results;
    }
}
