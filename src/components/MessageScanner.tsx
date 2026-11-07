import { LoaderCircle } from "lucide-react";
import { MESSAGE_CHAR_LIMIT, MESSAGE_EXAMPLES } from "../data/demoResults";

type MessageScannerProps = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onExample: (id: string, text: string) => void;
  onAnalyze: () => void;
};

export default function MessageScanner({
  value,
  loading,
  onChange,
  onExample,
  onAnalyze,
}: MessageScannerProps) {
  const remaining = MESSAGE_CHAR_LIMIT - value.length;

  return (
    <div>
      <label htmlFor="message-input" className="text-sm font-semibold text-emerald-950">
        Suspicious message
      </label>
      <p className="mt-1 text-sm text-zinc-500">
        Paste an SMS, WhatsApp, or email text. Do not include OTPs or passwords.
      </p>

      <textarea
        id="message-input"
        value={value}
        maxLength={MESSAGE_CHAR_LIMIT}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Your KYC is expiring. Update now or your account will be blocked..."
        className="mt-3 min-h-44 w-full resize-y rounded-xl border border-emerald-900/15 bg-white px-4 py-3 text-sm leading-6 text-zinc-800 shadow-inner outline-none transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15"
      />

      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
        <span>Keep personal numbers and OTPs out of this box.</span>
        <span className={remaining < 40 ? "font-semibold text-amber-700" : ""}>
          {value.length}/{MESSAGE_CHAR_LIMIT}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Quick examples
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MESSAGE_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => onExample(example.id, example.text)}
              className="rounded-full border border-emerald-900/15 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-900 transition-colors hover:bg-emerald-100"
            >
              {example.label}
            </button>
          ))}
        </div>
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
            Analysing
          </>
        ) : (
          "Analyze Message"
        )}
      </button>
    </div>
  );
}
