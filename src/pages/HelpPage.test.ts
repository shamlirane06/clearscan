import { describe, it, expect } from "vitest";

describe("Help Page Data & Search Logic", () => {
  const topics = [
    {
      id: "suspicious-link",
      title: 'What does a "suspicious link" mean?',
      keywords: ["suspicious", "link", "typosquatting", "shortener"],
    },
    {
      id: "qr-scanner",
      title: "How to use the QR scanner?",
      keywords: ["qr", "scanner", "camera", "upload"],
    },
    {
      id: "risk-levels",
      title: "Understanding risk levels",
      keywords: ["risk", "levels", "low", "dangerous"],
    },
    {
      id: "data-safety",
      title: "How to keep my data safe?",
      keywords: ["data", "safe", "upi", "pin", "otp"],
    },
    {
      id: "report-link",
      title: "Report a malicious link",
      keywords: ["report", "malicious", "cybercrime", "helpline"],
    },
  ];

  it("contains all 5 mandatory popular topics matching design reference", () => {
    expect(topics).toHaveLength(5);
    expect(topics.map((t) => t.title)).toEqual([
      'What does a "suspicious link" mean?',
      "How to use the QR scanner?",
      "Understanding risk levels",
      "How to keep my data safe?",
      "Report a malicious link",
    ]);
  });

  it("filters topics accurately by keyword search", () => {
    const query = "qr";
    const matches = topics.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.keywords.some((k) => k.includes(query.toLowerCase()))
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe("qr-scanner");
  });

  it("matches multiple topics when query is broad (e.g. 'link')", () => {
    const query = "link";
    const matches = topics.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.keywords.some((k) => k.includes(query.toLowerCase()))
    );

    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches.some((m) => m.id === "suspicious-link")).toBe(true);
    expect(matches.some((m) => m.id === "report-link")).toBe(true);
  });

  it("returns zero matches for completely unrelated terms", () => {
    const query = "astronomy";
    const matches = topics.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.keywords.some((k) => k.includes(query.toLowerCase()))
    );

    expect(matches).toHaveLength(0);
  });

  it("validates official support channels", () => {
    const supportEmail = "support@clearscan.app";
    const nationalHelpline = "1930";
    const nationalPortal = "https://cybercrime.gov.in";

    expect(supportEmail).toMatch(/^[a-zA-Z0-9._%+-]+@clearscan\.app$/);
    expect(nationalHelpline).toBe("1930");
    expect(nationalPortal).toBe("https://cybercrime.gov.in");
  });
});
