package com.clearscan.backend.security;

import org.springframework.stereotype.Component;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;

@Component
public class SsrfProtection {

    /**
     * Validates that a URL does not target internal/private network resources.
     * Returns an error message if blocked, or null if the URL is allowed.
     */
    public String validate(URI uri) {
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return "URL has no valid host.";
        }

        String lowerHost = host.toLowerCase();

        // Block localhost variants
        if (lowerHost.equals("localhost") || lowerHost.equals("127.0.0.1") || lowerHost.equals("::1") || lowerHost.equals("[::1]")) {
            return "URLs targeting localhost are not allowed.";
        }

        // Block common internal hostnames
        if (lowerHost.equals("metadata.google.internal") || lowerHost.startsWith("169.254.")) {
            return "URLs targeting internal services are not allowed.";
        }

        // Attempt IP resolution and check for private/reserved ranges
        try {
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress()) {
                return "URLs targeting loopback addresses are not allowed.";
            }
            if (address.isSiteLocalAddress()) {
                return "URLs targeting private network addresses are not allowed.";
            }
            if (address.isLinkLocalAddress()) {
                return "URLs targeting link-local addresses are not allowed.";
            }
            if (address.isAnyLocalAddress()) {
                return "URLs targeting wildcard addresses are not allowed.";
            }
            // Check for 10.x.x.x, 172.16-31.x.x, 192.168.x.x explicitly
            byte[] addr = address.getAddress();
            if (addr.length == 4) {
                int first = addr[0] & 0xFF;
                int second = addr[1] & 0xFF;
                if (first == 10) return "URLs targeting private network (10.0.0.0/8) are not allowed.";
                if (first == 172 && second >= 16 && second <= 31) return "URLs targeting private network (172.16.0.0/12) are not allowed.";
                if (first == 192 && second == 168) return "URLs targeting private network (192.168.0.0/16) are not allowed.";
                if (first == 169 && second == 254) return "URLs targeting link-local addresses are not allowed.";
                if (first == 0) return "URLs targeting reserved addresses are not allowed.";
            }
        } catch (UnknownHostException e) {
            // If we can't resolve the host, that's fine for analysis (the URL might still be valid syntactically)
        }

        return null; // URL is allowed
    }
}
