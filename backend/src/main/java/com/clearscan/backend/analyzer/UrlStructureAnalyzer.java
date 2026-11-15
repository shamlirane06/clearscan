package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;

@Component
public class UrlStructureAnalyzer implements SecurityAnalyzer {

    public static final int SUSPICIOUS_LENGTH = 200;
    public static final int MAX_QUERY_PARAMS = 10;
    public static final List<String> DEFAULT_SUSPICIOUS_PATH_KEYWORDS = List.of(
            "login", "signin", "verify", "account", "password", "secure", "update", "confirm", "banking"
    );

    private final List<String> suspiciousPathKeywords;

    public UrlStructureAnalyzer(
            @Value("${clearscan.security.suspicious-path-keywords:login,signin,verify,account,password,secure,update,confirm,banking}")
            List<String> suspiciousPathKeywords) {
        this.suspiciousPathKeywords = suspiciousPathKeywords != null && !suspiciousPathKeywords.isEmpty()
                ? suspiciousPathKeywords.stream().map(String::trim).map(String::toLowerCase).toList()
                : DEFAULT_SUSPICIOUS_PATH_KEYWORDS;
    }

    public UrlStructureAnalyzer() {
        this(DEFAULT_SUSPICIOUS_PATH_KEYWORDS);
    }

    public int countQueryParams(URI parsedUri) {
        if (parsedUri == null) {
            return 0;
        }
        String rawQuery = parsedUri.getRawQuery();
        if (rawQuery == null || rawQuery.isBlank()) {
            return 0;
        }
        try {
            MultiValueMap<String, String> queryParams = UriComponentsBuilder.fromUri(parsedUri).build().getQueryParams();
            return queryParams.values().stream().mapToInt(List::size).sum();
        } catch (Exception e) {
            int count = 0;
            String[] pairs = rawQuery.split("&");
            for (String pair : pairs) {
                if (!pair.isBlank()) {
                    count++;
                }
            }
            return count;
        }
    }

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
        int paramCount = countQueryParams(parsedUri);
        if (paramCount > MAX_QUERY_PARAMS) {
            results.add(SecurityCheckResult.warning("Excessive Query Parameters",
                    10,
                    "The URL contains " + paramCount + " query parameters, which is unusual and may indicate tracking or obfuscation.",
                    paramCount + " parameters detected"));
        }

        // Check for suspicious path keywords
        String path = parsedUri.getPath();
        if (path != null) {
            String lowerPath = path.toLowerCase();
            List<String> foundWords = new ArrayList<>();
            for (String word : suspiciousPathKeywords) {
                if (lowerPath.contains(word)) {
                    foundWords.add(word);
                }
            }
            if (!foundWords.isEmpty()) {
                results.add(SecurityCheckResult.warning("Suspicious Path Keywords",
                        15,
                        "The URL path contains sensitive keywords often used in phishing pages: " + String.join(", ", foundWords) + ".",
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
