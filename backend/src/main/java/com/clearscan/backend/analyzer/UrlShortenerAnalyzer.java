package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.*;

@Component
public class UrlShortenerAnalyzer implements SecurityAnalyzer {

    private static final Set<String> SHORTENER_DOMAINS = Set.of(
            "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
            "is.gd", "buff.ly", "rebrand.ly", "rb.gy",
            "short.io", "cutt.ly", "shorturl.at", "t.ly",
            "v.gd", "qr.ae", "lnkd.in", "db.tt", "j.mp",
            "amzn.to", "youtu.be", "surl.li"
    );

    @Override
    public List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri) {
        List<SecurityCheckResult> results = new ArrayList<>();
        String host = parsedUri.getHost();
        if (host == null) return results;

        String lowerHost = host.toLowerCase();

        boolean isShortener = SHORTENER_DOMAINS.stream()
                .anyMatch(s -> lowerHost.equals(s) || lowerHost.endsWith("." + s));

        if (isShortener) {
            results.add(SecurityCheckResult.warning("URL Shortener Detected",
                    20,
                    "This URL uses a URL-shortening service (\"" + host + "\"). The final destination is hidden and cannot be verified without following the redirect. Shortened URLs are frequently used to disguise malicious links.",
                    "Shortener: " + host));
        } else {
            results.add(SecurityCheckResult.safe("URL Shortener Detection",
                    "This URL does not use a known URL-shortening service."));
        }

        return results;
    }
}
