export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SafetyTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  takeaway: string;
}

export const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: "quishing",
    title: "What is QR Code Phishing ('Quishing')?",
    category: "Threat Overview",
    summary:
      "Quishing is social engineering where cybercriminals replace legitimate QR codes with malicious ones, or send fake QR codes via email, WhatsApp, or flyers to bypass email security filters and trick users into opening phishing websites.",
    keyPoints: [
      "Physical tampering: Attackers stick fraudulent QR stickers over legitimate restaurant menus, parking meters, and merchant payment posters.",
      "Filter evasion: QR codes cannot be easily parsed by standard text-based spam filters, making them popular in spear-phishing emails.",
      "Mobile vulnerability: Mobile browsers truncate long or tricky URLs on small screens, making malicious domains harder to spot.",
    ],
    takeaway: "Always preview the destination URL before entering credentials or approving permissions.",
  },
  {
    id: "fake-payment-qr",
    title: "How Fake Payment & UPI QR Codes Work",
    category: "Financial Security",
    summary:
      "A common scam in India and global payment systems involves tricking victims into scanning a QR code or entering a PIN under the pretext of 'receiving' money.",
    keyPoints: [
      "The Golden Rule: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.",
      "Reversed Intent: Scammers send a collect request disguised as a refund or prize claim.",
      "Overlaid stickers: Physical merchant stands are sometimes covered with fraudster QR stickers overnight.",
    ],
    takeaway: "If someone tells you scanning a QR code will credit money into your bank account, it is always a scam.",
  },
  {
    id: "lookalike-domains",
    title: "Understanding Domain Impersonation (Typosquatting)",
    category: "Link Analysis",
    summary:
      "Attackers register domains that look almost identical to trusted brands like Google, Amazon, SBI, or HDFC by swapping letters with similar-looking characters or numbers.",
    keyPoints: [
      "Character substitution: Replacing 'o' with '0' (g00gle.com) or 'l' with '1' (paypa1.com).",
      "Punycode / Homograph attacks: Using characters from Cyrillic or Greek alphabets that look identical to Latin letters.",
      "Subdomain trickery: Using trusted names as subdomains (e.g., sbi.com.secure-login-portal.xyz).",
    ],
    takeaway: "Always check the domain name immediately before the first single slash (/) to identify the actual host.",
  },
  {
    id: "url-shorteners",
    title: "Why Shortened URLs Can Be Risky",
    category: "URL Hygiene",
    summary:
      "Services like bit.ly, tinyurl, and t.co condense long links for convenience, but they completely conceal the destination domain, IP, and query parameters.",
    keyPoints: [
      "Cloaked destinations: You cannot know where the link leads until your browser sends an HTTP request.",
      "Redirect chains: Attackers may chain multiple shorteners to evade security scanners.",
      "Scam prevalence: Shorteners are overrepresented in unsolicited SMS, Telegram, and WhatsApp fraud.",
    ],
    takeaway: "Use an inspection tool like ClearScan to evaluate shortened links before opening them.",
  },
  {
    id: "fake-login-pages",
    title: "Recognizing Fake Login & KYC Portals",
    category: "Credential Protection",
    summary:
      "Fraudulent portals replicate the exact look and feel of bank login pages, EPFO, parcel trackers, or email sign-ins to harvest passwords and 2FA tokens in real time.",
    keyPoints: [
      "Urgency cues: Claims of 'Account blocked in 24 hours' or 'Electricity disconnected tonight' are designed to trigger panic.",
      "Disposable domains: Free or cheap TLDs (.xyz, .tk, .top) and unusual subdomains are primary red flags.",
      "Unsolicited KYC requests: Banks and official agencies will never ask for complete credentials or OTPs via SMS links.",
    ],
    takeaway: "Whenever an urgent message arrives, open your trusted official app directly instead of clicking provided links.",
  },
  {
    id: "post-scan-action",
    title: "What To Do If You Scanned a Suspicious QR Code",
    category: "Incident Response",
    summary:
      "Quick action can limit damage if you scanned or interacted with a malicious QR code.",
    keyPoints: [
      "1. Do NOT submit data: Immediately close the browser tab without entering OTPs, passwords, or personal details.",
      "2. Check app permissions: If an APK or file downloaded, do not install it; delete it from Downloads.",
      "3. Compromised credentials? Change your password immediately from another known secure device.",
      "4. Financial emergency: Contact your bank helpline immediately and report fraud to the cybercrime portal (in India: 1930 or cybercrime.gov.in).",
    ],
    takeaway: "Speed is crucial. Disconnect unauthorized bank mandates and report incidents immediately.",
  },
];

export const PHISHING_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "You scan a QR code at a parking booth to pay Rs 50. The phone displays a prompt asking for your UPI PIN. Is this safe?",
    options: [
      "Yes, entering your UPI PIN is always required when paying money.",
      "No, scanning a QR code should immediately transfer money without any confirmation.",
      "Yes, but only if the payment amount displayed on your screen matches Rs 50 and the receiver name is verified.",
      "No, UPI payments never ask for PINs under any circumstances.",
    ],
    correctIndex: 2,
    explanation:
      "Correct! When paying, you MUST verify both the exact amount and the recipient name before entering your secret UPI PIN. If the amount or receiver looks incorrect, cancel immediately.",
  },
  {
    id: 2,
    question: "Someone on an online classifieds site wants to buy your used table. They send you a QR code claiming 'Scan this to receive Rs 2,500 advance.' What should you do?",
    options: [
      "Scan the QR code and enter your PIN to claim the money.",
      "Refuse and report them. You NEVER need to scan a QR code or enter a PIN to RECEIVE money.",
      "Scan it, but use a secondary account with zero balance.",
      "Share the QR code with a family member to claim the money for you.",
    ],
    correctIndex: 1,
    explanation:
      "Correct! This is one of the most common UPI frauds. Scanning a QR code or entering a UPI PIN only AUTHORIZES an outgoing payment (debit). You never scan or input PINs to receive incoming funds.",
  },
  {
    id: 3,
    question: "Which of the following URLs is a dangerous lookalike domain attempting to impersonate Google?",
    options: [
      "https://mail.google.com/mail/u/0/",
      "https://g00gle.com/security-login",
      "https://support.google.co.in",
      "https://maps.google.com",
    ],
    correctIndex: 1,
    explanation:
      "Correct! 'g00gle.com' uses zeros ('00') instead of the letter 'o'. This is classic typosquatting used to harvest credentials on phishing pages.",
  },
  {
    id: 4,
    question: "You receive an SMS: 'Your electricity power will be disconnected at 9:30 PM due to unpaid bill. Update via http://bit.ly/power-bill-pay'. What are the primary warning signs?",
    options: [
      "Artificial urgency (disconnection in hours) and an obscured shortened link (bit.ly).",
      "The message was sent via SMS instead of WhatsApp.",
      "The link uses HTTP instead of HTTPS.",
      "Both A and C are major red flags.",
    ],
    correctIndex: 3,
    explanation:
      "Correct! Panic-inducing countdowns, shortened masking URLs, and unencrypted HTTP connections are classic hallmarks of fake utility payment scams.",
  },
  {
    id: 5,
    question: "If a URL is flagged by ClearScan as 'LOW RISK', what does this guarantee?",
    options: [
      "It 100% guarantees the website is completely harmless, legitimate, and safe.",
      "It guarantees the site will never ask for money or credit cards.",
      "It indicates no configured heuristic threats were detected; however, user caution and source verification are still essential.",
      "It means the website is endorsed and verified by the government.",
    ],
    correctIndex: 2,
    explanation:
      "Correct! Security tools provide heuristic threat indicators, not absolute guarantees. Attackers regularly register new domains that haven't yet been blacklisted. Always verify the context.",
  },
];
