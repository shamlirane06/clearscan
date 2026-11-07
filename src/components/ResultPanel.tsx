import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { PanelState, ScanResult } from "../types/scan";

type ResultPanelProps = {
  state: PanelState;
  result: ScanResult | null;
  error: string;
};

const riskStyles: Record<
  ScanResult["riskLevel"],
  { wrap: string; badge: string; label: string; icon: typeof ShieldAlert }
> = {
  HIGH: {
    wrap: "border-red-200 bg-red-50/80",
    badge: "bg-red-100 text-red-800",
    label: "High risk",
    icon: ShieldAlert,
  },
  MEDIUM: {
    wrap: "border-amber-200 bg-amber-50/80",
    badge: "bg-amber-100 text-amber-900",
    label: "Medium risk",
    icon: AlertTriangle,
  },
  LOW: {
    wrap: "border-emerald-200 bg-emerald-50/80",
    badge: "bg-emerald-100 text-emerald-900",
    label: "Low risk",
    icon: ShieldCheck,
  },
};

export default function ResultPanel({ state, result, error }: ResultPanelProps) {
  return (
    <aside className="h-fit rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950">Scan result</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Warning signs, explanation, and what to do next.
          </p>
        </div>
        {state === "result" && result ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
            Sample
          </span>
        ) : null}
      </div>

      {state === "empty" && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-emerald-900/15 bg-emerald-50/40 px-4 py-12 text-center">
          <CircleHelp className="mb-3 h-8 w-8 text-emerald-800/70" />
          <p className="font-medium text-emerald-950">No scan yet</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-600">
            Paste a message or link, or try a quick example. Day 1 shows labelled
            sample results, not live scam detection.
          </p>
        </div>
      )}

      {state === "loading" && (
        <div className="flex flex-col items-center rounded-xl border border-emerald-900/10 bg-emerald-50/50 px-4 py-12 text-center">
          <LoaderCircle className="mb-3 h-8 w-8 animate-spin text-emerald-800" />
          <p className="font-medium text-emerald-950">Preparing a sample result</p>
          <p className="mt-2 text-sm text-zinc-600">
            This is a temporary demo state while the UI is reviewed.
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
            <div>
              <p className="font-semibold text-red-900">Could not show a result</p>
              <p className="mt-1 text-sm leading-6 text-red-800/90">{error}</p>
            </div>
          </div>
        </div>
      )}

      {state === "result" && result && <ResultBody result={result} />}
    </aside>
  );
}

function ResultBody({ result }: { result: ScanResult }) {
  const styles = riskStyles[result.riskLevel];
  const Icon = styles.icon;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${styles.wrap}`}>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <span
              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
            >
              {styles.label}
            </span>
            <h3 className="mt-2 font-semibold text-emerald-950">{result.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Labelled sample result — not a guarantee of safety or fraud.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-900/10 bg-zinc-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Checked {result.source}
        </p>
        <p className="mt-1 break-all text-sm leading-6 text-zinc-700">
          {result.inputPreview}
        </p>
      </div>

      <section>
        <h4 className="text-sm font-semibold text-emerald-950">Warning signs</h4>
        <ul className="mt-2 space-y-2">
          {result.warningSigns.map((sign) => (
            <li key={sign} className="flex gap-2 text-sm leading-6 text-zinc-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              {sign}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-emerald-950">Why this matters</h4>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{result.explanation}</p>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-emerald-950">Recommended safety actions</h4>
        <ul className="mt-2 space-y-2">
          {result.actions.map((action) => (
            <li key={action} className="flex gap-2 text-sm leading-6 text-zinc-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              {action}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
