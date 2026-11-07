import { ShieldCheck, Cpu, AlertTriangle, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Overview Header */}
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
              About ClearScan
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Tagline: Scan Before You Trust 🛡️
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
          ClearScan is an intelligent, multi-layer cybersecurity assistant engineered to protect
          citizens and professionals from fraudulent QR codes, disguised phishing domains, and
          digital payment scams before navigating or submitting sensitive credentials.
        </p>
      </div>

      {/* Multi-Layer Detection Architecture */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-800" />
          Modular Architecture &amp; Detection Layers
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">1. URL Validation &amp; SSRF Shield</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Enforces HTTP/HTTPS protocol restrictions, blocks localhost, private IPv4/IPv6, and
              detects obfuscated URL encoding attempts.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">2. Suspicious Domain &amp; TLD Analysis</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Detects deep subdomains, suspicious keywords (kyc, verify, secure, banking), and
              high-abuse top-level domains (.xyz, .tk, .top).
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">3. Brand Lookalike (Typosquatting) Detection</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Identifies character substitutions (e.g. g00gle.com, amaz0n.com) and unauthorized brand
              containment across Indian and global banking/tech brands.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">4. URL Shortener Masking Inspection</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Flags masked redirect services (bit.ly, tinyurl, t.co) so users never unknowingly land
              on unverified destinations.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">5. Real Threat Intelligence Integration</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Backend integration with Google Safe Browsing API v4, with robust timeout and fallback
              protections that never mark a URL safe just because external APIs are unavailable.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50">
            <h4 className="font-bold text-zinc-900">6. Explainable Weighted Risk Scoring (0–100)</h4>
            <p className="mt-1 text-zinc-600 leading-relaxed">
              Transparent, audit-friendly mathematical scoring. Confirmed malicious threats always
              override lower heuristics and enforce a minimum score of 75.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Limitations & Disclaimers */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          Honest Security Limitations
        </h3>
        <ul className="space-y-2 text-xs text-amber-900 leading-relaxed">
          <li>
            &bull; <strong>Heuristics are indicators, not guarantees:</strong> A low risk score
            signifies that known suspicious characteristics were not found, but does not guarantee the
            site is 100% benign.
          </li>
          <li>
            &bull; <strong>Zero-Day Campaigns:</strong> Newly registered domains created minutes
            before a scam campaign may not appear immediately in global threat intelligence feeds.
          </li>
          <li>
            &bull; <strong>Privacy-First Storage:</strong> Scan history is stored locally in your
            browser session. ClearScan does not store your personal browsing records on external
            servers.
          </li>
        </ul>
      </div>

      {/* Incident Reporting Information */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
          Emergency Fraud Reporting
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed">
          If you have been targeted by online fraud or financial deception in India, immediately
          contact:
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <span className="text-zinc-500 block text-[10px]">National Cyber Helpline</span>
            <span className="text-base font-bold text-emerald-800">Dial 1930</span>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <span className="text-zinc-500 block text-[10px]">Official Web Portal</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-800 hover:underline flex items-center gap-1"
            >
              cybercrime.gov.in
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
