import { ExternalLink, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: string) => void;
  privacyOpen?: boolean;
  onPrivacyOpenChange?: (open: boolean) => void;
}

export default function Footer({ onNavigate, privacyOpen = false, onPrivacyOpenChange }: FooterProps) {
  return (
    <footer className="relative z-10 min-h-16 border-t border-slate-700 bg-slate-900 px-4 py-3 sm:px-6 lg:px-7">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-950 text-teal-700">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-slate-100">ClearScan</span>
          <span className="h-4 border-l border-slate-700" aria-hidden="true" />
          <span className="truncate text-sm text-slate-400">Scan safely. Browse confidently.</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <details
            id="privacy-security"
            open={privacyOpen}
            onToggle={(event) => onPrivacyOpenChange?.(event.currentTarget.open)}
            className="group relative"
          >
            <summary className="cursor-pointer list-none font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
              Privacy &amp; security
            </summary>
            <div className="absolute bottom-full right-0 z-20 mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm leading-5 text-slate-300 shadow-sm">
              <p className="font-semibold text-slate-100">Security notice</p>
              <p className="mt-2">
                Never disclose OTPs, PINs, or UPI passwords to receive money. Scan history stores only the destination origin in this browser. The full URL is sent to the ClearScan backend and, when configured, Google Safe Browsing for a threat lookup. ClearScan never opens URLs or starts payments.
              </p>
            </div>
          </details>

          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" />
            <span>Report suspicious content:</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </span>

          {onNavigate && (
            <>
              <span className="hidden h-4 border-l border-slate-700 sm:block" aria-hidden="true" />
              <span className="text-slate-400">Need help? Visit our</span>
              <button
                type="button"
                onClick={() => onNavigate("learn")}
                className="-ml-2 inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Help section</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
