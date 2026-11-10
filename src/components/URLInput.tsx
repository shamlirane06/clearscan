import { useState } from "react";
import { ArrowRight, ChevronDown, Link2, Loader2, X, AlertTriangle } from "lucide-react";
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

export default function URLInput({
  onScan,
  loading,
  initialUrl = "",
  onInputChange,
}: URLInputProps) {
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
    onInputChange?.();
  };

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9a92]" />
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
            className="h-8 xl:h-8.5 w-full rounded-lg border border-[#d5ddda] bg-white pl-8 pr-7 text-xs sm:text-[13px] text-[#24322c] placeholder:text-[#8a9a92] outline-none focus:border-[#176b50] focus:ring-1 focus:ring-[#176b50] transition-colors shadow-2xs"
          />
          {url && (
            <button
              type="button"
              aria-label="Clear URL"
              onClick={() => {
                setUrl("");
                onInputChange?.();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#65736d] hover:text-[#24322c]"
              title="Clear input"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex h-8 xl:h-8.5 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#176b50] hover:bg-[#155d46] px-3.5 text-xs sm:text-[13px] font-semibold text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing...</span>
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
        <div id="url-validation-error" className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium" role="alert">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Quick links row */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
        <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-medium text-[#65736d]">
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
          Try quick links:
        </span>
        <div className="flex flex-wrap gap-1">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleSelectPreset(link.url)}
              className={`rounded-full border border-[#d5ddda] px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                url === link.url
                  ? "bg-[#e4f0e9] text-[#176b50] border-[#176b50] font-semibold"
                  : "bg-[#f4f6f5] text-[#24322c] hover:bg-[#e8edeb]"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
