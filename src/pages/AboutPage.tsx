import { ShieldCheck, AlertTriangle, ExternalLink, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Overview Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
              System Architecture &amp; Specifications
            </h2>
            <p className="font-mono text-xs text-emerald-400 uppercase tracking-wider">
              Tagline: Scan Before You Trust 🛡️
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
          ClearScan is an intelligent, multi-layer QR code and destination inspection engine engineered
          for proactive cybersecurity defense. It prevents credential harvesting, payment reverse-intent fraud,
          and zero-trust bypasses across enterprise and citizen touchpoints.
        </p>
      </div>

      {/* Multi-Layer Detection Pipeline Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Layers className="h-4 w-4 text-emerald-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            6-Layer Heuristic &amp; Threat Intelligence Pipeline
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 1: URL &amp; SSRF Network Guard</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Enforces HTTP/HTTPS protocol integrity, detects raw IPv4/IPv6, blocks internal subnets (`127.0.0.1`, RFC 1918), and detects obfuscated URL encoding.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 2: Domain Reputation &amp; TLD Analyzer</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Audits deep subdomains (&gt;4 levels), phishing keywords (kyc, verify, secure, banking), and high-abuse top-level domains (.xyz, .tk, .top).
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 3: Typosquatting &amp; Brand Containment</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Algorithmic character substitution mapping (g00gle, amaz0n), unauthorized brand inclusion, and Punycode (`xn--`) homograph attacks.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 4: Redirect &amp; Shortener Cloaking</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Flags masked redirect services (`bit.ly`, `tinyurl`, `t.co`) so users are never blindly navigated to uninspected endpoints.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 5: URL Structural Anatomy</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Audits excessive URL length (&gt;200 chars), deceptive `@` symbol authorities, excessive query parameters (&gt;10), and sensitive path keywords.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 p-3.5 bg-zinc-950/60 space-y-1">
            <h4 className="font-mono font-bold text-zinc-200">Layer 6: Global Threat Feeds (Google Safe Browsing)</h4>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Backend integration with Google Safe Browsing API v4, with fail-safe fallback and synthetic CVE test indicators for deterministic evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Limitations & Transparency */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            Zero-Trust Disclosure &amp; Heuristic Limitations
          </h3>
        </div>
        <ul className="space-y-2 font-mono text-[11px] text-zinc-400 leading-relaxed">
          <li>
            &bull; <strong>Probabilistic Heuristics:</strong> A `LOW RISK` score signifies that known suspicious indicators were not detected. It is not an absolute guarantee against brand-new zero-day campaigns.
          </li>
          <li>
            &bull; <strong>Privacy-by-Design:</strong> Scanned destinations and session logs are retained locally on your client machine. No personal telemetry is sold or tracked on central servers.
          </li>
        </ul>
      </div>

      {/* Emergency Incident Response Hotline */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
          Emergency Incident Reporting
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          If you have been targeted by online fraud or financial deception in India, immediately contact the official government helplines:
        </p>
        <div className="flex flex-wrap gap-4 font-mono text-xs">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="text-zinc-500 block text-[10px] uppercase">National Cyber Helpline</span>
            <span className="text-base font-bold text-emerald-400">Dial 1930</span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="text-zinc-500 block text-[10px] uppercase">Official Web Portal</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1.5 pt-0.5"
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
