package com.clearscan.backend.security;

import org.springframework.stereotype.Component;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class SsrfProtection {
    private static final Pattern IPV4 = Pattern.compile("^[0-9]{1,3}(\\.[0-9]{1,3}){3}$");
    private static final Pattern AMBIGUOUS_NUMERIC = Pattern.compile("(?i)^(?:0x[0-9a-f]+|[0-9]+)(?:\\.(?:0x[0-9a-f]+|[0-9]+))*$");

    /**
     * Scanning analyzes the submitted string and never connects to its destination. We reject
     * private/special-use literals locally and intentionally do not resolve hostnames here.
     */
    public String validate(URI uri) {
        String host = uri.getHost();
        if (host == null || host.isBlank()) return "URL has no valid host.";
        String normalized = host.toLowerCase(Locale.ROOT).replaceAll("^\\[|\\]$", "").replaceAll("\\.$", "");
        if (normalized.equals("localhost") || normalized.endsWith(".localhost") || normalized.endsWith(".local")
                || normalized.equals("metadata.google.internal") || normalized.endsWith(".internal")
                || normalized.equals("home.arpa")) {
            return "URLs targeting localhost or internal services are not allowed.";
        }

        if (IPV4.matcher(normalized).matches()) {
            String[] octets = normalized.split("\\.");
            int[] ip = new int[4];
            for (int i = 0; i < 4; i++) {
                if (octets[i].length() > 1 && octets[i].startsWith("0")) return "Ambiguous numeric IP address formats are not allowed.";
                try { ip[i] = Integer.parseInt(octets[i]); }
                catch (NumberFormatException e) { return "URL contains an invalid IP address."; }
                if (ip[i] > 255) return "URL contains an invalid IP address.";
            }
            if (isBlockedIpv4(ip)) {
                return "URLs targeting private, loopback, link-local, or reserved IP addresses are not allowed.";
            }
        } else if (AMBIGUOUS_NUMERIC.matcher(normalized).matches()) {
            return "Ambiguous numeric IP address formats are not allowed.";
        } else if (normalized.contains(":")) {
            if (normalized.contains("%")) return "IPv6 zone identifiers are not allowed.";
            try {
                InetAddress address = InetAddress.getByName(normalized);
                byte[] bytes = address.getAddress();
                if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                        || address.isSiteLocalAddress()) {
                    return "URLs targeting private, loopback, link-local, or wildcard IP addresses are not allowed.";
                }
                if (bytes.length == 4) {
                    int[] embedded = new int[]{bytes[0] & 255, bytes[1] & 255, bytes[2] & 255, bytes[3] & 255};
                    if (isBlockedIpv4(embedded)) return "URLs targeting private, loopback, link-local, multicast, or reserved IP addresses are not allowed.";
                }
                if (bytes.length == 16) {
                    int first = bytes[0] & 255;
                    int second = bytes[1] & 255;
                    boolean mappedIpv4 = true;
                    for (int i = 0; i < 10; i++) mappedIpv4 &= bytes[i] == 0;
                    mappedIpv4 &= bytes[10] == (byte) 0xff && bytes[11] == (byte) 0xff;
                    boolean compatibleIpv4 = true;
                    for (int i = 0; i < 12; i++) compatibleIpv4 &= bytes[i] == 0;
                    if (compatibleIpv4 && isBlockedIpv4(new int[]{bytes[12] & 255, bytes[13] & 255, bytes[14] & 255, bytes[15] & 255})) {
                        return "IPv6 addresses embedding a private or reserved IPv4 destination are not allowed.";
                    }
                    String ipv6 = address.getHostAddress().toLowerCase(Locale.ROOT);
                    if ((first & 0xfe) == 0xfc || first == 0xff || mappedIpv4
                            || ipv6.startsWith("2001:db8:") || ipv6.startsWith("2001:10:")
                            || ipv6.startsWith("2002:") || ipv6.startsWith("64:ff9b:")
                            || ipv6.startsWith("100:")) {
                        return "URLs targeting private, loopback, link-local, multicast, or mapped IP addresses are not allowed.";
                    }
                }
            } catch (UnknownHostException e) {
                return "URL contains an invalid IPv6 address.";
            }
        }
        return null;
    }

    private boolean isBlockedIpv4(int[] ip) {
        return ip[0] == 0 || ip[0] == 10 || ip[0] == 127 || ip[0] >= 224
                || (ip[0] == 100 && ip[1] >= 64 && ip[1] <= 127)
                || (ip[0] == 169 && ip[1] == 254)
                || (ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31)
                || (ip[0] == 192 && (ip[1] == 0 || ip[1] == 168))
                || (ip[0] == 192 && ip[1] == 88 && ip[2] == 99)
                || (ip[0] == 198 && (ip[1] == 18 || ip[1] == 19 || ip[1] == 51 && ip[2] == 100))
                || (ip[0] == 203 && ip[1] == 0 && ip[2] == 113);
    }
}
