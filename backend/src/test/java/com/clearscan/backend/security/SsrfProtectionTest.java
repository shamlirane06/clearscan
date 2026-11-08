package com.clearscan.backend.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;

class SsrfProtectionTest {

    private final SsrfProtection ssrfProtection = new SsrfProtection();

    @Test
    @DisplayName("Public URL should be allowed")
    void publicUrl() {
        assertNull(ssrfProtection.validate(URI.create("https://www.google.com")));
    }

    @Test
    @DisplayName("localhost should be blocked")
    void localhost() {
        assertNotNull(ssrfProtection.validate(URI.create("http://localhost:8080")));
    }

    @Test
    @DisplayName("127.0.0.1 should be blocked")
    void loopback() {
        assertNotNull(ssrfProtection.validate(URI.create("http://127.0.0.1")));
    }

    @Test
    @DisplayName("Private IP 192.168.x.x should be blocked")
    void privateIp192() {
        assertNotNull(ssrfProtection.validate(URI.create("http://192.168.1.1")));
    }

    @Test
    @DisplayName("Private IP 10.x.x.x should be blocked")
    void privateIp10() {
        assertNotNull(ssrfProtection.validate(URI.create("http://10.0.0.1")));
    }

    @Test
    @DisplayName("IPv6 loopback should be blocked")
    void ipv6Loopback() {
        assertNotNull(ssrfProtection.validate(URI.create("http://[::1]:8080")));
    }

    @Test void blocksMetadataAndLinkLocal() {
        assertNotNull(ssrfProtection.validate(URI.create("http://169.254.169.254/latest/meta-data/")));
        assertNotNull(ssrfProtection.validate(URI.create("http://[fe80::1]/")));
    }

    @Test void blocksIpv6UniqueLocalAndMappedAddresses() {
        assertNotNull(ssrfProtection.validate(URI.create("http://[fd00::1]/")));
        assertNotNull(ssrfProtection.validate(URI.create("http://[::ffff:127.0.0.1]/")));
    }

    @Test void blocksCarrierGradeNatAndAmbiguousNumericIp() {
        assertNotNull(ssrfProtection.validate(URI.create("http://100.64.0.1/")));
        assertNotNull(ssrfProtection.validate(URI.create("http://2130706433/")));
    }

    @Test void rejectsIpv4OctalAndIpv6CompatiblePrivateTargets() {
        assertNotNull(ssrfProtection.validate(URI.create("http://0177.0.0.1/")));
        assertNotNull(ssrfProtection.validate(URI.create("http://[::127.0.0.1]/")));
    }

    @Test void allowsOrdinaryHostnamesWithoutPerformingDnsResolution() {
        assertNull(ssrfProtection.validate(URI.create("https://not-resolved.invalid/")));
    }
}
