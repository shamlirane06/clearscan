import { Link2, LoaderCircle } from "lucide-react";

type UrlScannerProps = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onAnalyze: () => void;
};

export default function UrlScanner({
  value,
  loading,
  onChange,
  onAnalyze,
}: UrlScannerProps) {
  return (
    <div>
      <label htmlFor="url-input" className="text-sm font-semibold text-emerald-950">
        Suspicious link
      </label>
      <p className="mt-1 text-sm text-zinc-500">
        Paste a URL from a message, QR preview, or email before you open it.
      </p>

      <div className="relative mt-3">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          id="url-input"
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAnalyze();
            }
          }}
          placeholder="https://example.com/verify"
          className="h-12 w-full rounded-xl border border-emerald-900/15 bg-white pl-10 pr-4 text-sm text-zinc-800 shadow-inner outline-none placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15"
        />
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={loading}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Checking link
          </>
        ) : (
          "Check link"
        )}
      </button>
    </div>
  );
}
