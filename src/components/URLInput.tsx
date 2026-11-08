import { useState } from "react";
import { Link2, LoaderCircle, ShieldAlert, ArrowRight, X } from "lucide-react";
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
    badgeClass: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
  },
  {
    label: "Lookalike Domain",
    url: "https://g00gle.com/security/login",
    badge: "55 · Typosquat",
    badgeClass: "border-amber-500/30 text-amber-300 bg-amber-500/10",
  },
  {
    label: "Shortened Redirect",
    url: "https://bit.ly/sbi-urgent-update",
    badge: "25 · Masked",
    badgeClass: "border-yellow-500/30 text-yellow-300 bg-yellow-500/10",
  },
  {
    label: "Fake Bank KYC",
    url: "http://sbi-kyc-update.xyz/verify",
    badge: "75 · Phishing",
    badgeClass: "border-rose-500/30 text-rose-300 bg-rose-500/10",
  },
  {
    label: "Synthetic Threat",
    url: "https://testsafebrowsing.appspot.com/malware",
    badge: "95 · Malicious",
    badgeClass: "border-rose-500/40 text-rose-300 bg-rose-500/20",
  },
  {
    label: "Localhost Blocked",
    url: "http://localhost:8080/secret",
    badge: "SSRF Shield",
    badgeClass: "border-slate-700 text-slate-300 bg-slate-800",
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
          <label htmlFor="url-field" className="text-xs font-medium text-slate-300">
            Target URL or QR Payload
          </label>
          <span className="text-[11px] text-slate-400">
            HTTP &bull; HTTPS &bull; UPI Schemes
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="url-field"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="Enter destination e.g. https://example.com or paste link..."
              className="h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-28 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-1.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {validationError && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400" role="alert">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Preset test targets */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            Quick Scenario Presets
          </span>
          <span className="text-[11px] text-slate-400">One-click threat verification</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              className={`group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                url === preset.url
                  ? "border-teal-500/50 bg-teal-500/15 text-teal-200"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span className="font-medium">{preset.label}</span>
              <span className={`rounded border px-1.5 py-0.2 text-[10px] font-medium ${preset.badgeClass}`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
