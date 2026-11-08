import { ShieldCheck, ExternalLink, Terminal, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-white tracking-tight">
              ClearScan &bull; Zero-Trust Destination Intelligence
            </span>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-slate-400">
            Engineered for proactive zero-trust defense against quishing, disguised payment mandates,
            and typosquatted credential harvesting before navigation.
          </p>
          <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-teal-400" />
              <span>Local Client Privacy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span>Spring Boot + React Engine</span>
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-400">
          <p>
            <strong className="text-slate-300">Security Notice: </strong>
            Never disclose OTPs, PINs, or UPI passwords to receive money.
            ClearScan heuristics provide proactive guidance against known attack patterns.
          </p>
          <p className="flex items-center gap-1.5 pt-1">
            <span>In an emergency, report cyber fraud immediately to</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-teal-400 hover:underline font-medium"
            >
              <span>cybercrime.gov.in (Helpline: 1930)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
