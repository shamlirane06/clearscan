import { ShieldCheck, AlertTriangle, ExternalLink, Layers, PhoneCall, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Overview Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-400">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How ClearScan checks a link
            </h1>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mt-0.5">
              Zero-Trust Verification Engine &bull; Scan Before You Trust
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          ClearScan reviews QR destinations and unfamiliar links for common warning signs. It combines explainable local checks with the threat-intelligence response when the service is available. A low-risk result is context for your decision, not a guarantee of safety.
        </p>
      </div>

      {/* Multi-Layer Detection Pipeline Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3.5">
          <Layers className="h-5 w-5 text-teal-400" />
          <h2 className="text-xl font-semibold text-slate-200 sm:text-2xl">
            Six layers of link inspection
          </h2>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                1
              </span>
              <h3 className="font-semibold text-sm text-slate-200">URL &amp; SSRF Network Guard</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Enforces HTTP/HTTPS protocol integrity, detects raw IPv4/IPv6, blocks internal subnets (<code className="font-mono text-teal-300">127.0.0.1</code>, RFC 1918), and detects obfuscated percent-encoding.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                2
              </span>
              <h3 className="font-semibold text-sm text-slate-200">Domain Reputation &amp; TLD Analyzer</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Audits deep subdomains (&gt;4 levels), high-risk phishing keywords (kyc, verify, secure, banking), and high-abuse top-level domains (<code className="font-mono text-teal-300">.xyz</code>, <code className="font-mono text-teal-300">.tk</code>, <code className="font-mono text-teal-300">.top</code>).
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                3
              </span>
              <h3 className="font-semibold text-sm text-slate-200">Typosquatting &amp; Brand Containment</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Algorithmic character substitution mapping (g00gle, amaz0n), unauthorized brand inclusion in subdomains, and Punycode (<code className="font-mono text-teal-300">xn--</code>) homograph attacks.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                4
              </span>
              <h3 className="font-semibold text-sm text-slate-200">Redirect &amp; Shortener Cloaking</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Flags masked redirect services (<code className="font-mono text-teal-300">bit.ly</code>, <code className="font-mono text-teal-300">tinyurl</code>, <code className="font-mono text-teal-300">t.co</code>) so users are never navigated blindly to uninspected endpoints.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                5
              </span>
              <h3 className="font-semibold text-sm text-slate-200">URL Structural Anatomy</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Audits excessive URL length (&gt;200 chars), deceptive <code className="font-mono text-teal-300">@</code> symbol authorities, excessive query parameters (&gt;10), and sensitive credential path keywords.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 p-4 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-[11px] font-bold text-teal-300">
                6
              </span>
              <h3 className="font-semibold text-sm text-slate-200">Threat Feeds &amp; Safe Browsing</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Spring Boot backend integration with Google Safe Browsing API v4, with automatic fail-safe fallback to deterministic heuristic evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Limitations & Transparency */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-sm font-semibold">
            Zero-Trust Disclosure &amp; Heuristic Limitations
          </h2>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">&bull;</span>
            <span>
              <strong>Probabilistic Heuristics:</strong> A "Low Risk" classification indicates that known suspicious patterns were not detected. It is not a guarantee against newly registered zero-day campaign domains.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">&bull;</span>
            <span>
              <strong>Privacy-by-Design:</strong> Scanned destinations and session logs are retained in your browser's local client storage. No personal browsing history is tracked or sold.
            </span>
          </li>
        </ul>
      </div>

      {/* Emergency Incident Response Hotline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Emergency Incident Reporting
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          If you have been targeted by online fraud, financial deception, or unauthorized UPI transfers, contact the official cybercrime authorities immediately:
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <PhoneCall className="h-5 w-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">National Cyber Helpline</span>
              <span className="text-sm font-bold text-teal-300">Dial 1930 (Toll Free)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <Globe className="h-5 w-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Official Web Portal</span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-teal-300 hover:underline flex items-center gap-1.5"
              >
                cybercrime.gov.in
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
