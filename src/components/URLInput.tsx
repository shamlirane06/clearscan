import { useState } from "react";
import { Link2, LoaderCircle, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";
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
    type: "safe",
  },
  {
    label: "Lookalike Domain",
    url: "https://g00gle.com/security/login",
    type: "warning",
  },
  {
    label: "Shortened URL",
    url: "https://bit.ly/sbi-urgent-update",
    type: "warning",
  },
  {
    label: "Fake Bank KYC",
    url: "http://sbi-kyc-update.xyz/verify",
    type: "danger",
  },
  {
    label: "Synthetic Threat",
    url: "https://testsafebrowsing.appspot.com/malware",
    type: "danger",
  },
  {
    label: "Localhost Blocked",
    url: "http://localhost:8080/secret",
    type: "blocked",
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
        <label htmlFor="url-field" className="text-sm font-semibold text-emerald-950">
          Enter or Paste URL
        </label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Analyze destination safety before clicking or navigating.
        </p>

        <form onSubmit={handleSubmit} className="mt-2.5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="url-field"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g. https://amazon.com or g00gle.com"
              className="h-11 w-full rounded-xl border border-emerald-900/15 bg-white pl-10 pr-4 text-sm text-zinc-800 shadow-inner outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Scan URL
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {validationError && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-rose-600">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Synthetic Hackathon Demonstration Presets */}
      <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/50 p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-950">
          <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
          Hackathon Demo Scenarios (One-Click Test)
        </div>
        <p className="mt-1 text-[11px] text-zinc-600">
          Click any preset to test ClearScan’s multi-layer detection engine with synthetic indicators:
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                url === preset.url
                  ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                  : "border-emerald-900/10 bg-white text-zinc-700 hover:border-emerald-700 hover:bg-emerald-50/60"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
