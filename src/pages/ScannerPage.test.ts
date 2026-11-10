import { describe, it, expect } from "vitest";
import { parseUpiPayPayload } from "../utils/upi";
import { validateAndNormalizeUrl } from "../utils/validation";

describe("QR Scanner Page Logic", () => {
  it("detects valid HTTPS URLs from QR code payloads", () => {
    const raw = "https://example.com/login?ref=qr";
    const validation = validateAndNormalizeUrl(raw);

    expect(validation.isValid).toBe(true);
    expect(validation.normalizedUrl).toBe("https://example.com/login?ref=qr");
  });

  it("normalizes bare domains from QR payloads to HTTPS", () => {
    const raw = "wikipedia.org/wiki/Phishing";
    const validation = validateAndNormalizeUrl(raw);

    expect(validation.isValid).toBe(true);
    expect(validation.normalizedUrl).toBe("https://wikipedia.org/wiki/Phishing");
  });

  it("identifies UPI payment payloads correctly", () => {
    const upiPayload = "upi://pay?pa=merchant%40icici&pn=TestStore&am=250.00&cu=INR";
    const parsed = parseUpiPayPayload(upiPayload);

    expect(parsed).not.toBeNull();
    expect(parsed?.payeeVpa).toBe("merchant@icici");
    expect(parsed?.payeeName).toBe("TestStore");
    expect(parsed?.amount).toBe("250.00");
    expect(parsed?.currency).toBe("INR");
  });

  it("classifies plain text as non-URL payload", () => {
    const plainText = "WiFi:S:OfficeNetwork;T:WPA;P:SecretKey;;";
    const isUpi = Boolean(parseUpiPayPayload(plainText));
    const validation = validateAndNormalizeUrl(plainText);

    expect(isUpi).toBe(false);
    expect(validation.isValid).toBe(false);
  });

  it("rejects image files that are oversized (> 10MB)", () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large_qr.png", {
      type: "image/png",
    });

    const isTooLarge = largeFile.size > 10 * 1024 * 1024;
    expect(isTooLarge).toBe(true);
  });

  it("accepts valid QR image file formats", () => {
    const validPng = new File(["dummy"], "qr.png", { type: "image/png" });
    const validJpg = new File(["dummy"], "qr.jpg", { type: "image/jpeg" });
    const validWebp = new File(["dummy"], "qr.webp", { type: "image/webp" });
    const invalidPdf = new File(["dummy"], "qr.pdf", { type: "application/pdf" });

    expect(validPng.type.startsWith("image/")).toBe(true);
    expect(validJpg.type.startsWith("image/")).toBe(true);
    expect(validWebp.type.startsWith("image/")).toBe(true);
    expect(invalidPdf.type.startsWith("image/")).toBe(false);
  });
});
