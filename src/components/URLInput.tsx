import { useState } from "react";
import { Link2, LoaderCircle, Sparkles, ShieldAlert, CornerDownLeft, X } from "lucide-react";
import { validateAndNormalizeUrl } from "../utils/validation";

interface URLInputProps {
  onScan: (url: string) => Promise<void>;
  loading: boolean;
  initialUrl?: string;
}

const DEMO_PRESETS = [
  {
    label: "Safe HTTPS",
    url: "https://www.wikipedia.org",
    badge: "0 · Clean",
    badgeClass: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10",
  },
  {
    label: "Lookalike Domain",
    url: "https://g00gle.com/security/login",
    badge: "55 · Typosquat",
    badgeClass: "border-amber-500/20 text-amber-400 bg-amber-500/10",
  },
  {
    label: "Shortened Redirect",
    url: "https://bit.ly/sbi-urgent-update",
    badge: "25 · Masked",
    badgeClass: "border-yellow-500/20 text-yellow-400 bg-yellow-500/10",
  },
  {
    label: "Fake Bank KYC",
    url: "http://sbi-kyc-update.xyz/verify",
    badge: "75 · Phishing",
    badgeClass: "border-rose-500/20 text-rose-400 bg-rose-500/10",
  },
  {
    label: "Synthetic Threat",
    url: "https://testsafebrowsing.appspot.com/malware",
    badge: "95 · Malicious",
    badgeClass: "border-rose-500/30 text-rose-400 bg-rose-500/20",
  },
  {
    label: "Localhost Blocked",
    url: "http://localhost:8080/secret",
    badge: "SSRF Shield",
    badgeClass: "border-zinc-700 text-zinc-400 bg-zinc-800",
  },
];

export default function URLInput({ onScan, loading, initialUrl = "" }: URLInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError("");

    const validation = validateAndNormalizeUrl(url);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || "Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    await onScan(validation.normalizedUrl);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setValidationError("");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="url-field" className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Target URL Inspector
          </label>
          <span className="font-mono text-[10px] text-zinc-500">
            Protocol: HTTP / HTTPS
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="url-field"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g. https://domain.com or paste raw link..."
              className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-24 font-mono text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                title="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-1.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 font-mono text-xs font-semibold text-zinc-950 shadow-sm transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>ANALYZE</span>
                <CornerDownLeft className="h-3 w-3 opacity-60" />
              </>
            )}
          </button>
        </form>

        {validationError && (
          <div className="mt-2 flex items-center gap-2 font-mono text-xs text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Preset synthetic scenarios */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Test Scenarios &bull; Quick Fixtures
          </span>
          <span className="text-[10px] text-zinc-500">1-click audit simulation</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              className={`group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-all ${
                url === preset.url
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span>{preset.label}</span>
              <span className={`rounded-md border px-1.5 py-0.2 text-[9px] font-semibold ${preset.badgeClass}`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
