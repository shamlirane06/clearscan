import { useState } from "react";
import { Link2, LoaderCircle, ShieldAlert, ArrowRight, X } from "lucide-react";
import { validateAndNormalizeUrl } from "../utils/validation";

interface URLInputProps {
  onScan: (url: string) => Promise<void>;
  loading: boolean;
  initialUrl?: string;
  onInputChange?: () => void;
}

const DEMO_PRESETS = [
  {
    label: "Ordinary HTTPS",
    url: "https://www.wikipedia.org",
    badge: "HTTPS",
    badgeClass: "border-slate-700 text-slate-300 bg-slate-800",
  },
  {
    label: "Lookalike Domain",
    url: "https://g00gle.com/security/login",
    badge: "Lookalike",
    badgeClass: "border-amber-500/30 text-amber-300 bg-amber-500/10",
  },
  {
    label: "Shortened Redirect",
    url: "https://bit.ly/sbi-urgent-update",
    badge: "Shortened URL",
    badgeClass: "border-yellow-500/30 text-yellow-300 bg-yellow-500/10",
  },
  {
    label: "Fake Bank KYC",
    url: "http://sbi-kyc-update.xyz/verify",
    badge: "Suspicious signals",
    badgeClass: "border-rose-500/30 text-rose-300 bg-rose-500/10",
  },
  {
    label: "Safe Browsing test URL",
    url: "https://testsafebrowsing.appspot.com/malware",
    badge: "Requires live API",
    badgeClass: "border-rose-500/40 text-rose-300 bg-rose-500/20",
  },
  {
    label: "Localhost Blocked",
    url: "http://localhost:8080/secret",
    badge: "SSRF Shield",
    badgeClass: "border-slate-700 text-slate-300 bg-slate-800",
  },
];

export default function URLInput({ onScan, loading, initialUrl = "", onInputChange }: URLInputProps) {
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
        <div className="mb-2 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="url-field" className="text-xs font-medium text-slate-300">
            Paste an HTTP or HTTPS link
          </label>
          <span className="text-xs text-slate-400">
            UPI details are shown when read from a QR code
          </span>
        </div>

        <form onSubmit={handleSubmit} className="url-form relative flex items-center">
          <div className="url-field-wrap relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="url-field"
              type="text"
              value={url}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "url-validation-error" : undefined}
              onChange={(e) => {
                setUrl(e.target.value);
                onInputChange?.();
                if (validationError) setValidationError("");
              }}
              placeholder="Paste or enter a URL"
              className="url-input-control h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-28 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40"
            />
            {url && (
              <button
                type="button"
                aria-label="Clear URL"
                onClick={() => {
                  setUrl("");
                  onInputChange?.();
                }}
                className="url-clear-button absolute right-24 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="url-submit-button ink-action absolute right-1.5 inline-flex h-11 min-w-24 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
          <div id="url-validation-error" className="mt-2.5 flex items-center gap-2 text-xs text-rose-400" role="alert">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Preset test targets */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-2.5 sm:p-4">
        <div className="flex flex-col gap-0.5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-slate-300">
            Quick Scenario Presets
          </span>
          <span className="text-[11px] text-slate-400">Fill a sample link</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                handleSelectPreset(preset.url);
                onInputChange?.();
              }}
              className={`group flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
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
