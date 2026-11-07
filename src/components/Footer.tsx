import { ShieldCheck, ExternalLink, Terminal, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-8 text-zinc-400 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-sm font-bold text-white tracking-tight">
              ClearScan &bull; Scan Before You Trust
            </span>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-zinc-500">
            Engineered for proactive zero-trust defense against quishing, disguised payment mandates,
            and typosquatted credential harvesting.
          </p>
          <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              Local Client Privacy
            </span>
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3 text-zinc-400" />
              Spring Boot + Vite Architecture
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-zinc-500">
          <p>
            <strong className="text-zinc-300 font-mono">Zero-Trust Notice: </strong>
            Never disclose OTPs, PINs, UPI passwords, or biometric authentication on unverified third-party pages.
            Analysis results are heuristic threat indicators, not absolute guarantees.
          </p>
          <p className="flex items-center gap-1.5 pt-1">
            <span>In an emergency, report cyber fraud immediately to</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-mono"
            >
              cybercrime.gov.in (Helpline: 1930)
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
