package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class UrlValidationAnalyzer implements SecurityAnalyzer {

    private static final Pattern IPV4_PATTERN = Pattern.compile("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$");
    private static final Pattern SUSPICIOUS_ENCODING = Pattern.compile("%(?:00|0[aAdD]|25|3[cCeE]|2[27])", Pattern.CASE_INSENSITIVE);

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        List<SecurityCheckResult> results = new ArrayList<>();

        // Check protocol
        String scheme = parsedUri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            results.add(SecurityCheckResult.warning("URL Validation",
                    25, "URL uses a non-standard or missing protocol.",
                    "Protocol: " + (scheme != null ? scheme : "none")));
        } else if (scheme.equalsIgnoreCase("http")) {
            results.add(SecurityCheckResult.warning("URL Validation",
                    10, "URL uses unencrypted HTTP instead of HTTPS. Data sent to this site is not encrypted.",
                    "Protocol: http"));
        } else {
            results.add(SecurityCheckResult.safe("URL Validation", "URL uses HTTPS with a valid structure."));
        }

        // Check for IP-based host
        String host = parsedUri.getHost();
        if (host != null && IPV4_PATTERN.matcher(host).matches()) {
            results.add(SecurityCheckResult.warning("IP Address Detection",
                    20, "URL uses a raw IP address instead of a domain name. Legitimate websites typically use domain names.",
                    "Host: " + host));
        }

        // Check for unusual port
        int port = parsedUri.getPort();
        if (port != -1 && port != 80 && port != 443) {
            results.add(SecurityCheckResult.warning("Unusual Port",
                    15, "URL specifies a non-standard port. Most legitimate websites use standard ports (80 or 443).",
                    "Port: " + port));
        }

        // Check for suspicious URL encoding
        if (SUSPICIOUS_ENCODING.matcher(rawUrl).find()) {
            results.add(SecurityCheckResult.warning("Suspicious Encoding",
                    20, "URL contains suspicious encoded characters that may be used to disguise the true destination.",
                    "Suspicious encoding detected in URL"));
        }

        return results;
    }
}
