import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Mail,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  MessageCircle,
  X,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";

interface HelpPageProps {
  onNavigate?: (page: string) => void;
}

interface PopularTopic {
  id: string;
  title: string;
  summary: string;
  details: string[];
  recommendation: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const POPULAR_TOPICS: PopularTopic[] = [
  {
    id: "suspicious-link",
    title: 'What does a "suspicious link" mean?',
    summary:
      'A link marked as "Suspicious" exhibits warning patterns commonly associated with deceptive websites, credential phishing, or evasion techniques.',
    details: [
      "Domain lookalikes (typosquatting): Characters swapped to mimic trusted brands (e.g., paypa1.com or g00gle.com).",
      "Uncommon or high-risk TLDs: Domains registered on cheap or free extensions (.xyz, .top, .tk) with no verified reputation.",
      "URL shorteners & redirects: Services like bit.ly or tinyurl that conceal the final web destination.",
      "Incomplete safety checks: The destination could not be fully verified against trusted threat feeds.",
    ],
    recommendation:
      "Avoid entering login credentials, card numbers, or personal data on suspicious links. Never approve downloads or account permissions.",
  },
  {
    id: "qr-scanner",
    title: "How to use the QR scanner?",
    summary:
      "ClearScan allows you to inspect QR codes without opening them blindly, keeping your mobile device safe from malicious redirects.",
    details: [
      "Camera scanning: Click 'Start Camera' to point your device camera at any physical or digital QR code.",
      "Image upload: Choose 'Upload QR Image' to decode a QR screenshot or photo directly from your device.",
      "Automatic payload check: ClearScan instantly distinguishes between web URLs, UPI payment requests, and plain text.",
      "Zero auto-open guarantee: ClearScan will never automatically launch or redirect your browser to a scanned URL.",
    ],
    recommendation:
      "Always inspect the destination hostname and risk score in ClearScan before deciding to open any link in your browser.",
  },
  {
    id: "risk-levels",
    title: "Understanding risk levels",
    summary:
      "ClearScan categorizes inspected destinations into clear risk levels based on multi-layered heuristic checks and threat intelligence.",
    details: [
      "Low Risk (Green): Standard protocols, recognized benign domains, valid SSL certificates, and clean reputation records.",
      "Suspicious (Amber): Warning indicators such as lookalike spelling, unverified redirects, or brand-new domain registrations.",
      "Dangerous (Red): High-confidence malicious sites identified in threat feeds, known malware distribution hosts, or fake banking portals.",
      "Unable to Verify: Network timeout or unreachable host. Exercise extreme caution when encountering unverified links.",
    ],
    recommendation:
      "Treat all 'Suspicious' and 'Dangerous' ratings as unsafe. ClearScan provides actionable warnings for every flagged indicator.",
  },
  {
    id: "data-safety",
    title: "How to keep my data safe?",
    summary:
      "Safeguarding personal and financial information requires adopting proactive verification habits whenever navigating links.",
    details: [
      "The Golden UPI Rule: You NEVER need to enter a UPI PIN or scan a QR code to RECEIVE money.",
      "Check the address bar: Verify that the domain directly preceding the first single slash (/) is the authentic brand website.",
      "Watch for urgent language: Scammers rely on artificial urgency ('Account suspended in 24 hours!') to induce panic.",
      "Enable Multi-Factor Authentication (MFA): Protect your accounts so stolen credentials alone cannot grant access.",
    ],
    recommendation:
      "Never disclose OTPs, PINs, or bank passwords over phone calls, SMS, or web forms provided in unsolicited messages.",
  },
  {
    id: "report-link",
    title: "Report a malicious link",
    summary:
      "Reporting fraudulent portals helps protect others and enables cybersecurity authorities to take down malicious infrastructure.",
    details: [
      "National Cyber Crime Reporting Portal: Indian residents can file complaints and report cyber fraud at cybercrime.gov.in.",
      "National Cyber Helpline: Call 1930 to report immediate financial cyber fraud in India.",
      "Google Safe Browsing: Submit deceptive phishing URLs directly to Google's public reporting portal.",
      "Targeted brand support: Inform the legitimate organization (e.g., your bank) about active lookalike domains.",
    ],
    recommendation:
      "Save screenshots and the exact URL of the deceptive site as evidence before reporting.",
  },
];

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is ClearScan?",
    answer:
      "ClearScan is a lightweight, privacy-first cybersecurity scanner that helps you analyze links and QR codes before opening them. It inspects destination URLs for deceptive heuristics, typosquatting patterns, and known security risks.",
    category: "General",
  },
  {
    id: "faq-2",
    question: "Does ClearScan track or save my personal browsing activity?",
    answer:
      "No. ClearScan does not track your web browsing. Scan history is stored locally in your browser's private local storage and never transmitted to external marketing or tracking services.",
    category: "Privacy",
  },
  {
    id: "faq-3",
    question: "Can ClearScan guarantee 100% protection against all online scams?",
    answer:
      "No automated security tool can guarantee 100% protection. While ClearScan checks for the most common attack vectors and lookalike domains, attackers continually evolve new techniques. Always exercise caution and common sense.",
    category: "Security",
  },
  {
    id: "faq-4",
    question: "What should I do if a link I need is marked as Suspicious?",
    answer:
      "Review the detailed security report in ClearScan to understand which specific checks triggered the warning. If you must access the service, navigate directly to the official website by typing its known address into your browser rather than clicking the link.",
    category: "Usage",
  },
  {
    id: "faq-5",
    question: "Why does my camera stay off until I click Start Camera?",
    answer:
      "By design, ClearScan enforces strict camera privacy. The camera stream is never initiated on page load; it only activates when you explicitly click 'Start Camera' and automatically stops as soon as a code is scanned.",
    category: "QR Scanner",
  },
  {
    id: "faq-6",
    question: "How do I report a cyber fraud incident in India?",
    answer:
      "You can report cyber incidents online at cybercrime.gov.in or call the national cyber financial helpline at 1930 for immediate assistance with unauthorized transactions.",
    category: "Support",
  },
];

export default function HelpPage({ onNavigate }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<
    "guide" | "tips" | "faqs" | "support" | "chat" | null
  >(null);
  const [selectedTopic, setSelectedTopic] = useState<PopularTopic | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

  // Support contact form state
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Live chat simulation state
  const [chatMessages, setChatMessages] = useState<
    { sender: "bot" | "user"; text: string; time: string }[]
  >([
    {
      sender: "bot",
      text: "Hello! Welcome to ClearScan Support. How can we help you stay safe online today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Filter topics and FAQs based on search query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedTopics = POPULAR_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.details.some((d) => d.toLowerCase().includes(q))
    );

    const matchedFaqs = FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );

    return {
      topics: matchedTopics,
      faqs: matchedFaqs,
      totalCount: matchedTopics.length + matchedFaqs.length,
    };
  }, [searchQuery]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: now },
    ]);
    setChatInput("");

    // Automated assistance reply
    setTimeout(() => {
      let botReply =
        "Thank you for contacting ClearScan Support. For security issues, you can paste any suspicious URL into the Dashboard or email our team at support@clearscan.app.";
      const lower = userText.toLowerCase();

      if (lower.includes("qr") || lower.includes("camera")) {
        botReply =
          "To scan a QR code, open the QR Scanner from the top button or sidebar, then click 'Start Camera' or 'Upload QR Image'. ClearScan will analyze the destination safely!";
      } else if (lower.includes("phish") || lower.includes("fake") || lower.includes("scam")) {
        botReply =
          "If you suspect a link is a phishing scam, do not enter any credentials. You can inspect its risk score on our Dashboard and report malicious sites at cybercrime.gov.in.";
      } else if (lower.includes("upi") || lower.includes("pin") || lower.includes("payment")) {
        botReply =
          "Important safety rule: You never need to enter a UPI PIN or scan a QR code to RECEIVE money. Anyone asking you to do so is attempting fraud.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  const handleSupportFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportMessage("");
      setSupportEmail("");
      setActiveModal(null);
    }, 2500);
  };

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* 1. Page Heading */}
      <header>
        <p className="text-xs sm:text-sm font-semibold text-[#176b50]">Help</p>
        <h1 className="mt-0.5 text-2xl sm:text-[30px] font-bold tracking-tight text-[#24322c] leading-tight">
          How can we help you?
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#65736d]">
          Find answers, get support, and learn how to stay safer online.
        </p>
      </header>

      {/* 2. Help Search Bar */}
      <div className="relative w-full">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 sm:left-4 h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#8a9a92]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help topics..."
            className="h-11 sm:h-12 w-full rounded-xl border border-[#d5ddda] bg-white pl-10 sm:pl-11 pr-10 text-xs sm:text-sm text-[#24322c] placeholder:text-[#8a9a92] shadow-2xs outline-none transition-colors focus:border-[#176b50] focus:ring-1 focus:ring-[#176b50]"
            aria-label="Search for help topics"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 p-1 text-[#8a9a92] hover:text-[#24322c] transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchResults && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[#d5ddda] bg-white p-3 shadow-xl">
            {searchResults.totalCount === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs sm:text-sm font-medium text-[#24322c]">
                  No help topics found matching &quot;{searchQuery}&quot;
                </p>
                <p className="mt-1 text-xs text-[#65736d]">
                  Try searching for terms like &quot;QR&quot;, &quot;phishing&quot;, &quot;risk&quot;, or &quot;safe&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.topics.length > 0 && (
                  <div>
                    <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#176b50]">
                      Matching Topics
                    </p>
                    <ul className="space-y-1">
                      {searchResults.topics.map((topic) => (
                        <li key={topic.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopic(topic);
                              setSearchQuery("");
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs sm:text-sm text-[#24322c] hover:bg-[#edf5f0] transition-colors"
                          >
                            <span className="font-semibold">{topic.title}</span>
                            <ChevronRight className="h-4 w-4 text-[#8a9a92]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchResults.faqs.length > 0 && (
                  <div className="border-t border-[#edf2ef] pt-2">
                    <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#176b50]">
                      Frequently Asked Questions
                    </p>
                    <ul className="space-y-1">
                      {searchResults.faqs.map((faq) => (
                        <li key={faq.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal("faqs");
                              setExpandedFaqId(faq.id);
                              setSearchQuery("");
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs sm:text-sm text-[#24322c] hover:bg-[#edf5f0] transition-colors"
                          >
                            <span className="font-medium">{faq.question}</span>
                            <ChevronRight className="h-4 w-4 text-[#8a9a92]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Four Main Help Cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5"
        aria-label="Help categories"
      >
        {/* Card 1: Quick Start Guide */}
        <div
          onClick={() => setActiveModal("guide")}
          className="group flex flex-col items-center justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 text-center shadow-xs transition-all hover:border-[#176b50]/40 hover:shadow-sm cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveModal("guide")}
        >
          <div className="flex flex-col items-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50] transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5 stroke-[2]" aria-hidden="true" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#24322c]">
              Quick Start Guide
            </h2>
            <p className="mt-1 text-xs text-[#65736d] leading-relaxed">
              Learn the basics of ClearScan in minutes.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#176b50] group-hover:underline">
            <span>Read Guide</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>

        {/* Card 2: Safety Tips */}
        <div
          onClick={() => setActiveModal("tips")}
          className="group flex flex-col items-center justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 text-center shadow-xs transition-all hover:border-[#176b50]/40 hover:shadow-sm cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveModal("tips")}
        >
          <div className="flex flex-col items-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50] transition-transform group-hover:scale-105">
              <ShieldCheck className="h-5 w-5 stroke-[2]" aria-hidden="true" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#24322c]">
              Safety Tips
            </h2>
            <p className="mt-1 text-xs text-[#65736d] leading-relaxed">
              Simple tips to stay safe online.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#176b50] group-hover:underline">
            <span>View Tips</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>

        {/* Card 3: FAQs */}
        <div
          onClick={() => setActiveModal("faqs")}
          className="group flex flex-col items-center justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 text-center shadow-xs transition-all hover:border-[#176b50]/40 hover:shadow-sm cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveModal("faqs")}
        >
          <div className="flex flex-col items-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50] transition-transform group-hover:scale-105">
              <HelpCircle className="h-5 w-5 stroke-[2]" aria-hidden="true" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#24322c]">
              FAQs
            </h2>
            <p className="mt-1 text-xs text-[#65736d] leading-relaxed">
              Get answers to common questions.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#176b50] group-hover:underline">
            <span>View FAQs</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>

        {/* Card 4: Contact Support */}
        <div
          onClick={() => setActiveModal("support")}
          className="group flex flex-col items-center justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 text-center shadow-xs transition-all hover:border-[#176b50]/40 hover:shadow-sm cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveModal("support")}
        >
          <div className="flex flex-col items-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50] transition-transform group-hover:scale-105">
              <Mail className="h-5 w-5 stroke-[2]" aria-hidden="true" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#24322c]">
              Contact Support
            </h2>
            <p className="mt-1 text-xs text-[#65736d] leading-relaxed">
              Need more help? Reach out to our team.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#176b50] group-hover:underline">
            <span>Contact Us</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </section>

      {/* 4. Bottom Section: Popular Topics & Need More Help */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Popular Topics */}
        <section
          className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-xs"
          aria-labelledby="popular-topics-heading"
        >
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#edf2ef]">
              <BookOpen className="h-5 w-5 text-[#176b50]" aria-hidden="true" />
              <h2 id="popular-topics-heading" className="text-base sm:text-lg font-bold text-[#24322c]">
                Popular Topics
              </h2>
            </div>

            <ul className="divide-y divide-[#edf2ef]" aria-label="List of popular security topics">
              {POPULAR_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-[#176b50] group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[#176b50]">
                        <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#24322c] group-hover:text-[#176b50] truncate">
                        {topic.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#8a9a92] group-hover:text-[#176b50] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right Card: Need More Help? */}
        <section
          className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-xs overflow-hidden relative"
          aria-labelledby="need-help-heading"
        >
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-5 w-5 text-[#176b50]" aria-hidden="true" />
              <h2 id="need-help-heading" className="text-base sm:text-lg font-bold text-[#24322c]">
                Need More Help?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#65736d] mb-5">
              Our team is here to help you.
            </p>

            {/* Layout: Support Options on Left, Shield Illustration on Right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Support Options Column */}
              <div className="sm:col-span-7 space-y-3 z-10">
                {/* 1. Email Support Option */}
                <a
                  href="mailto:support@clearscan.app"
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-3.5 hover:bg-[#e4f0e9] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#176b50] shadow-2xs">
                      <Mail className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#24322c] leading-tight">
                        Email Support
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#65736d] mt-0.5 truncate">
                        support@clearscan.app
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8a9a92] group-hover:text-[#176b50] group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* 2. Live Chat Option */}
                <button
                  type="button"
                  onClick={() => setActiveModal("chat")}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-3.5 hover:bg-[#e4f0e9] transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#176b50] shadow-2xs">
                      <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#24322c] leading-tight">
                        Live Chat
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#65736d] mt-0.5 truncate">
                        Available 9 AM – 9 PM (IST)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8a9a92] group-hover:text-[#176b50] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Shield Illustration Column (matching reference) */}
              <div className="sm:col-span-5 flex items-center justify-center py-2 sm:py-0">
                <div className="relative flex items-center justify-center">
                  {/* Pale green circular background halo */}
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-[#edf5f0] flex items-center justify-center relative">
                    {/* Dark forest-green shield with checkmark */}
                    <div className="relative z-10 flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl bg-white border-2 border-[#176b50] shadow-sm">
                      <ShieldCheck className="h-9 w-9 sm:h-10 sm:w-10 text-[#176b50] stroke-[2.2]" />
                    </div>

                    {/* Radiating decorative spark strokes */}
                    <div className="absolute top-1 right-5 h-3.5 w-1 rounded-full bg-[#176b50] rotate-[30deg]" />
                    <div className="absolute top-5 -right-0.5 h-3.5 w-1 rounded-full bg-[#176b50] rotate-[75deg]" />
                    <div className="absolute top-12 -right-1 h-3 w-0.8 rounded-full bg-[#176b50] rotate-[105deg]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL 1: Popular Topic Detail Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0e9] text-[#176b50]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                  {selectedTopic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="rounded-lg p-1 text-[#8a9a92] hover:bg-[#f4f6f5] hover:text-[#24322c] transition-colors"
                aria-label="Close topic"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#4b5a53] leading-relaxed mb-4">
              {selectedTopic.summary}
            </p>

            <div className="rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-4 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#176b50] mb-2">
                Key Understanding &amp; Signals
              </h4>
              <ul className="space-y-2">
                {selectedTopic.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-[#24322c]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#176b50] shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 mb-5 flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Safety Recommendation</p>
                <p className="text-xs text-amber-800 mt-0.5">{selectedTopic.recommendation}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Start Guide Modal */}
      {activeModal === "guide" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0e9] text-[#176b50]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                    ClearScan Quick Start Guide
                  </h3>
                  <p className="text-xs text-[#65736d]">
                    Master link &amp; QR code verification in 3 simple steps
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-[#8a9a92] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-[#d5ddda] p-4 flex gap-3.5 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176b50] text-white text-xs font-bold">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#24322c]">Inspect Any Link or QR Code</h4>
                  <p className="text-xs text-[#65736d] mt-1 leading-relaxed">
                    Paste an unverified URL directly into the Dashboard search bar, or click &quot;Scan QR Code&quot; to point your device camera or upload a saved screenshot.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-[#d5ddda] p-4 flex gap-3.5 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176b50] text-white text-xs font-bold">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#24322c]">Review Automated Security Signals</h4>
                  <p className="text-xs text-[#65736d] mt-1 leading-relaxed">
                    ClearScan audits protocol security, checks for lookalike domain patterns (typosquatting), evaluates domain age, and queries verified threat intelligence feeds.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-[#d5ddda] p-4 flex gap-3.5 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176b50] text-white text-xs font-bold">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#24322c]">Act Safely &amp; Confidently</h4>
                  <p className="text-xs text-[#65736d] mt-1 leading-relaxed">
                    Examine the Risk Score: Low-risk links can be opened with confidence. If marked Suspicious or Dangerous, avoid opening or enter the official portal directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-3 border-t border-[#edf2ef]">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate("dashboard");
                  }}
                  className="text-xs font-semibold text-[#176b50] hover:underline flex items-center gap-1"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46] ml-auto"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Safety Tips Modal */}
      {activeModal === "tips" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0e9] text-[#176b50]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                    Essential Online Safety Tips
                  </h3>
                  <p className="text-xs text-[#65736d]">
                    Practical habits to stay protected from phishing and social engineering
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-[#8a9a92] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-3.5">
                <p className="text-xs font-bold text-[#176b50]">1. The Universal UPI Rule</p>
                <p className="text-xs text-[#24322c] mt-0.5">
                  You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money. A PIN is only entered to DEBIT money from your bank account.
                </p>
              </div>

              <div className="rounded-xl border border-[#d5ddda] bg-white p-3.5">
                <p className="text-xs font-bold text-[#24322c]">2. Scrutinize the Hostname</p>
                <p className="text-xs text-[#65736d] mt-0.5">
                  Look right before the first slash (/) in any address. For example, in <code>sbi.com.login-auth.xyz/verify</code>, the actual destination host is <code>login-auth.xyz</code>, not SBI.
                </p>
              </div>

              <div className="rounded-xl border border-[#d5ddda] bg-white p-3.5">
                <p className="text-xs font-bold text-[#24322c]">3. Beware of Artificial Urgency</p>
                <p className="text-xs text-[#65736d] mt-0.5">
                  Messages demanding immediate action (&quot;Electricity will be cut tonight&quot; or &quot;SIM card deactivated in 2 hours&quot;) are deliberately engineered to induce panic.
                </p>
              </div>

              <div className="rounded-xl border border-[#d5ddda] bg-white p-3.5">
                <p className="text-xs font-bold text-[#24322c]">4. Avoid Unsolicited Shortened Links</p>
                <p className="text-xs text-[#65736d] mt-0.5">
                  Always inspect bit.ly, tinyurl, or t.co links in ClearScan before clicking, especially when sent via SMS, WhatsApp, or Telegram.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FAQs Modal */}
      {activeModal === "faqs" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0e9] text-[#176b50]">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-[#65736d]">
                    Quick answers to common ClearScan and security questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-[#8a9a92] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-[#edf2ef]">
              {FAQS.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-3 text-left text-xs sm:text-sm font-bold text-[#24322c] hover:text-[#176b50]"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#8a9a92] transition-transform ${
                          isOpen ? "rotate-180 text-[#176b50]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs sm:text-[13px] text-[#4b5a53] leading-relaxed pr-6">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Contact Support Modal */}
      {activeModal === "support" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0e9] text-[#176b50]">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                    Contact Support
                  </h3>
                  <p className="text-xs text-[#65736d]">
                    Send a question or report an issue directly to our team
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-[#8a9a92] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {supportSubmitted ? (
              <div className="py-6 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-[#24322c]">Message Sent Successfully</h4>
                <p className="mt-1 text-xs text-[#65736d]">
                  Thank you! Our support team will review your message and reply via email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportFormSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="support-email" className="block text-xs font-semibold text-[#24322c] mb-1">
                    Your Email Address
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 w-full rounded-lg border border-[#d5ddda] bg-white px-3 text-xs sm:text-sm text-[#24322c] outline-none focus:border-[#176b50] focus:ring-1 focus:ring-[#176b50]"
                  />
                </div>

                <div>
                  <label htmlFor="support-message" className="block text-xs font-semibold text-[#24322c] mb-1">
                    How can we help?
                  </label>
                  <textarea
                    id="support-message"
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your question or the suspicious link you encountered..."
                    className="w-full rounded-lg border border-[#d5ddda] bg-white p-3 text-xs sm:text-sm text-[#24322c] outline-none focus:border-[#176b50] focus:ring-1 focus:ring-[#176b50]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="mailto:support@clearscan.app"
                    className="text-xs text-[#176b50] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Open in Email App</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46] transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: Live Chat Modal */}
      {activeModal === "chat" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md h-[500px] flex flex-col rounded-2xl border border-[#d5ddda] bg-white shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-[#edf5f0] border-b border-[#d0e2d6]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#176b50] text-white">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#24322c]">ClearScan Live Assistance</h3>
                  <p className="text-[11px] text-[#176b50] font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online (9 AM – 9 PM IST)</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-[#65736d] hover:bg-white/80 hover:text-[#24322c]"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfdfc]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#176b50] text-white rounded-br-none"
                        : "bg-white border border-[#d5ddda] text-[#24322c] rounded-bl-none shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#8a9a92] mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-[#edf2ef] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="h-10 flex-1 rounded-xl border border-[#d5ddda] bg-white px-3 text-xs sm:text-sm text-[#24322c] outline-none focus:border-[#176b50]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#176b50] text-white hover:bg-[#155d46] disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
