import { describe, it, expect } from "vitest";
import { validateAndNormalizeUrl, sanitizeText } from "./validation";

describe("URL Validation & SSRF Sanitization Utilities", () => {
  it("should validate and normalize standard HTTPS URLs", () => {
    const result = validateAndNormalizeUrl("wikipedia.org");
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe("https://wikipedia.org");
  });

  it("should accept valid http and https protocols", () => {
    const httpsRes = validateAndNormalizeUrl("https://example.com/test");
    expect(httpsRes.isValid).toBe(true);

    const httpRes = validateAndNormalizeUrl("http://example.com/test");
    expect(httpRes.isValid).toBe(true);
  });

  it("should reject non-HTTP/HTTPS protocols", () => {
    const ftpRes = validateAndNormalizeUrl("ftp://ftp.is.co.za/linux");
    expect(ftpRes.isValid).toBe(false);
    expect(ftpRes.errorMessage).toContain("Only HTTP and HTTPS");

    const fileRes = validateAndNormalizeUrl("file:///C:/passwords.txt");
    expect(fileRes.isValid).toBe(false);
  });

  it("should reject empty or whitespace input", () => {
    const emptyRes = validateAndNormalizeUrl("   ");
    expect(emptyRes.isValid).toBe(false);
    expect(emptyRes.errorMessage).toContain("Please enter a URL");
  });

  it("should reject whitespace encoded into a hostname", () => {
    const result = validateAndNormalizeUrl("not a url");
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/valid web address/i);
  });

  it("should block localhost and loopback addresses to prevent SSRF", () => {
    const localhostRes = validateAndNormalizeUrl("http://localhost:8080/admin");
    expect(localhostRes.isValid).toBe(false);
    expect(localhostRes.errorMessage).toContain("localhost and private network");

    const ipLoopbackRes = validateAndNormalizeUrl("http://127.0.0.1:3000");
    expect(ipLoopbackRes.isValid).toBe(false);

    const ipv6Loopback = validateAndNormalizeUrl("http://[::1]:8080");
    expect(ipv6Loopback.isValid).toBe(false);
  });

  it("should block private RFC 1918 subnets (10.x, 192.168.x, 172.16-31.x, 169.254.x)", () => {
    expect(validateAndNormalizeUrl("http://192.168.1.1/router").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://10.0.0.1/secret").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://172.16.0.5/cloud").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://169.254.169.254/latest/meta-data").isValid).toBe(false);
  });

  it("should sanitize user text against XSS injection", () => {
    const raw = '<script>alert("xss")</script>';
    const sanitized = sanitizeText(raw);
    expect(sanitized).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });
});
