import { describe, expect, it } from "vitest";
import { parseUpiPayPayload } from "./upi";

describe("parseUpiPayPayload", () => {
  it("extracts payee and amount fields without opening a payment app", () => {
    expect(parseUpiPayPayload("upi://pay?pa=shop%40upi&pn=Corner%20Shop&am=12.50&cu=INR")).toMatchObject({
      payeeVpa: "shop@upi", payeeName: "Corner Shop", amount: "12.50", currency: "INR",
    });
  });
  it("allows partial fields and rejects malformed amounts", () => {
    expect(parseUpiPayPayload("upi://pay?pa=shop%40upi&am=1.234")).toMatchObject({ payeeVpa: "shop@upi", amount: undefined });
  });
  it("does not classify other schemes as a UPI payment payload", () => {
    expect(parseUpiPayPayload("https://example.com")).toBeNull();
    expect(parseUpiPayPayload("upi://collect?pa=shop%40upi")).toBeNull();
  });
  it("keeps hostile looking names as display text", () => {
    expect(parseUpiPayPayload("upi://pay?pn=%3Cscript%3Ealert(1)%3C%2Fscript%3E")?.payeeName).toBe("<script>alert(1)</script>");
  });
});
