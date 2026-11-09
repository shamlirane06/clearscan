import { useState } from "react";
import { ArrowRight, ChevronDown, Close, LinkChain, LoadingCircle, WarningShield } from "./icons/ClearScanIcons";
import { validateAndNormalizeUrl } from "../utils/validation";

interface URLInputProps {
  onScan: (url: string) => Promise<void>;
  loading: boolean;
  initialUrl?: string;
  onInputChange?: () => void;
}

const QUICK_LINKS = [
  { label: "Google", url: "https://www.google.com" },
  { label: "YouTube", url: "https://www.youtube.com" },
  { label: "WhatsApp", url: "https://www.whatsapp.com" },
  { label: "Facebook", url: "https://www.facebook.com" },
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
    <div className="space-y-2">
      <div>
        <label htmlFor="url-field" className="sr-only">Paste an HTTP or HTTPS link</label>
        <span className="sr-only">Your link is not opened</span>

        <form onSubmit={handleSubmit} className="url-form flex items-center gap-2.5">
          <div className="url-field-wrap relative flex-1">
            <LinkChain className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              placeholder="Paste or enter a URL..."
              className="url-input-control h-10 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 xl:h-12"
            />
            {url && (
              <button
                type="button"
                aria-label="Clear URL"
                onClick={() => {
                  setUrl("");
                  onInputChange?.();
                }}
                className="url-clear-button absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 xl:h-11 xl:w-11"
                title="Clear input"
              >
                <Close className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="url-submit-button ink-action inline-flex h-10 min-w-32 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 xl:h-12 xl:min-w-44 xl:px-5 xl:text-base"
          >
            {loading ? (
              <>
                <LoadingCircle className="h-4 w-4 animate-spin" />
                <span>Checking</span>
              </>
            ) : (
              <>
                <span>Analyze URL</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {validationError && (
          <div id="url-validation-error" className="mt-2.5 flex items-center gap-2 text-xs text-rose-400" role="alert">
            <WarningShield className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 pt-2">
        <div className="quick-links-row flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          <span className="quick-links-label inline-flex min-h-8 shrink-0 items-center whitespace-nowrap text-xs font-medium text-slate-400 xl:text-sm">
            <ChevronDown className="quick-links-chevron" aria-hidden="true" />
            Try quick links:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                aria-pressed={url === link.url}
                onClick={() => {
                  handleSelectPreset(link.url);
                  onInputChange?.();
                }}
                className={`min-h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 xl:text-sm ${
                  url === link.url
                    ? "border-teal-600 bg-teal-950 text-teal-700"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
