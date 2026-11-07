import type { MessageExample, ScanResult } from "../types/scan";

export const MESSAGE_CHAR_LIMIT = 2000;

export const MESSAGE_EXAMPLES: MessageExample[] = [
  {
    id: "kyc",
    label: "Bank KYC scam",
    text: "Dear customer, your SBI KYC is expiring today. Update now or your account will be blocked: http://sbi-kyc-update.secure-login.xyz/verify",
  },
  {
    id: "parcel",
    label: "Fake parcel message",
    text: "Your Amazon parcel is held at customs. Pay Rs 47 delivery fee immediately or it will be returned. Pay here: http://amazon-delivery-pay.tk/fee",
  },
  {
    id: "job",
    label: "Suspicious job offer",
    text: "Congratulations! You are selected for a work-from-home job paying Rs 45,000/week. Pay Rs 999 registration fee on UPI 9876543210@ybl to receive your offer letter.",
  },
  {
    id: "upi",
    label: "UPI scam",
    text: "Your UPI mandate of Rs 14,999 will be auto-debited in 10 minutes. If this was not you, click to cancel: http://upi-helpdesk-cancel.in/stop",
  },
];

const DEMO_ACTIONS = [
  "Do not tap the link or share OTPs, PINs, or UPI PINs.",
  "Verify using an official app or a number you already trust.",
  "If money or data may be at risk, contact your bank and report on cybercrime.gov.in.",
];

const EXAMPLE_RESULTS: Record<string, Omit<ScanResult, "source" | "inputPreview" | "isDemo">> = {
  kyc: {
    riskLevel: "HIGH",
    title: "Sample: urgent KYC / account-block pattern",
    warningSigns: [
      "Threat of immediate account blocking",
      "Asks you to complete KYC through a link",
      "Domain does not match the bank's official website",
    ],
    explanation:
      "Banks do not ask you to complete KYC through random SMS or WhatsApp links. This sample matches a common India-based phishing pattern that impersonates a bank to steal login details.",
    actions: DEMO_ACTIONS,
  },
  parcel: {
    riskLevel: "HIGH",
    title: "Sample: fake delivery / customs fee pattern",
    warningSigns: [
      "Unexpected parcel and a tiny fee to release it",
      "Short deadline language to create panic",
      "Payment requested outside the official shopping app",
    ],
    explanation:
      "Delivery companies and marketplaces do not collect customs or delivery fees through one-off SMS links. This sample looks like a fee-trap used to steal card or UPI details.",
    actions: DEMO_ACTIONS,
  },
  job: {
    riskLevel: "HIGH",
    title: "Sample: job offer that asks for payment",
    warningSigns: [
      "High pay with almost no hiring process",
      "Registration or training fee before joining",
      "Payment requested over UPI to a personal handle",
    ],
    explanation:
      "Legitimate employers do not ask candidates to pay to receive an offer letter. This sample matches advance-fee job fraud that is common on messaging apps.",
    actions: DEMO_ACTIONS,
  },
  upi: {
    riskLevel: "HIGH",
    title: "Sample: fake UPI mandate / cancel-debit pattern",
    warningSigns: [
      "Claim that money will be auto-debited soon",
      "Asks you to click a link to cancel a payment",
      "Impersonates a payment helpdesk",
    ],
    explanation:
      "UPI apps do not send random cancel-debit links over SMS. Clicking them can expose your details or trick you into approving a payment. This is a labelled demo result.",
    actions: DEMO_ACTIONS,
  },
};

function genericMessageResult(text: string): ScanResult {
  return {
    source: "message",
    inputPreview: text,
    isDemo: true,
    riskLevel: "MEDIUM",
    title: "Sample result for a custom message",
    warningSigns: [
      "Urgency, fear, or a prize used to rush you",
      "A shortened or unfamiliar link",
      "A request for OTP, KYC, UPI PIN, or a small fee",
    ],
    explanation:
      "ClearScan is not analysing this message yet. This panel shows the kind of warning signs a later version will highlight so you can practise checking a text before you trust it.",
    actions: [
      "Pause and re-read the message on a trusted channel.",
      "Open official apps directly instead of tapping links.",
      "Never share OTPs or approve unexpected UPI requests.",
    ],
  };
}

export function getDemoMessageResult(text: string, exampleId?: string): ScanResult {
  const trimmed = text.trim();

  if (exampleId && EXAMPLE_RESULTS[exampleId]) {
    return {
      ...EXAMPLE_RESULTS[exampleId],
      source: "message",
      inputPreview: trimmed,
      isDemo: true,
    };
  }

  const matchedExample = MESSAGE_EXAMPLES.find((example) => example.text === trimmed);
  if (matchedExample) {
    return getDemoMessageResult(trimmed, matchedExample.id);
  }

  return genericMessageResult(trimmed);
}

export function getDemoUrlResult(url: string): ScanResult {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  const looksSuspicious =
    lower.includes("login") ||
    lower.includes("kyc") ||
    lower.includes("bit.ly") ||
    lower.includes("ngrok") ||
    lower.includes(".xyz") ||
    lower.includes(".tk");

  if (looksSuspicious) {
    return {
      source: "url",
      inputPreview: trimmed,
      isDemo: true,
      riskLevel: "HIGH",
      title: "Sample: link that resembles a phishing pattern",
      warningSigns: [
        "Unusual domain or URL shortener",
        "Words often used in phishing pages (login, KYC, verify)",
        "You were asked to open it from a message, not from an official app",
      ],
      explanation:
        "This is a labelled sample result, not a live reputation check. Links that mimic banks, deliveries, or login pages are a common way to steal credentials in India.",
      actions: [
        "Do not open the link from this message.",
        "Type the official website yourself or use the official app.",
        "If you already entered details, change passwords and alert your bank.",
      ],
    };
  }

  return {
    source: "url",
    inputPreview: trimmed,
    isDemo: true,
    riskLevel: "LOW",
    title: "Sample: no obvious demo warning patterns",
    warningSigns: [
      "No demo keywords such as KYC, login, or a known shortener were found",
    ],
    explanation:
      "This is a placeholder preview. A low sample score only means the demo rules did not flag the text of the URL. It is not a guarantee that the destination is safe.",
    actions: [
      "Still check the domain spelling before you sign in.",
      "Prefer official apps for banking, UPI, and deliveries.",
      "When unsure, ask someone you trust before tapping.",
    ],
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
