import { ExternalLink, ShieldCheck, ShieldLogo } from "./icons/ClearScanIcons";

interface FooterProps {
  onNavigate?: (page: string) => void;
  privacyOpen?: boolean;
  onPrivacyOpenChange?: (open: boolean) => void;
}

export default function Footer({ onNavigate, privacyOpen = false, onPrivacyOpenChange }: FooterProps) {
  return (
    <footer className="relative z-10 h-9 xl:h-10 shrink-0 border-t border-[#d5ddda] bg-white px-4 sm:px-6 lg:px-7 flex items-center">
      <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 text-[11px] xl:text-xs text-[#4b5a53]">
        {/* Left Side */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-[#e4f0e9] text-[#176b50]">
            <ShieldLogo className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="font-bold text-[#24322c]">ClearScan</span>
          <span className="h-3 border-l border-[#d5ddda]" aria-hidden="true" />
          <span className="truncate text-[#65736d]">Scan safely. Browse confidently.</span>
        </div>

        {/* Right Side */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Privacy & Security */}
          <details
            id="privacy-security"
            open={privacyOpen}
            onToggle={(event) => onPrivacyOpenChange?.(event.currentTarget.open)}
            className="group relative"
          >
            <summary className="cursor-pointer list-none font-medium text-[#176b50] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]">
              Privacy &amp; security
            </summary>
            <div className="absolute bottom-full right-0 z-30 mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-[#d5ddda] bg-white p-3.5 text-xs leading-relaxed text-[#24322c] shadow-xl">
              <p className="font-bold text-[#24322c]">Security &amp; Privacy Notice</p>
              <p className="mt-1.5 text-[#4b5a53]">
                Never disclose OTPs, PINs, or passwords to receive money. Scan history stores only the destination origin locally in this browser. ClearScan never executes unauthorized downloads or initiates financial transactions.
              </p>
            </div>
          </details>

          <span className="hidden h-3 border-l border-[#d5ddda] sm:block" aria-hidden="true" />

          {/* Report suspicious content */}
          <span className="inline-flex items-center gap-1.5 text-[#65736d]">
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#176b50]" aria-hidden="true" />
            <span>Report suspicious content:</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-[#176b50] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </a>
          </span>

          {onNavigate && (
            <>
              <span className="hidden h-3 border-l border-[#d5ddda] sm:block" aria-hidden="true" />
              <span className="text-[#65736d]">Need help? Visit our</span>
              <button
                type="button"
                onClick={() => onNavigate("learn")}
                className="-ml-1.5 inline-flex items-center gap-0.5 font-semibold text-[#176b50] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
              >
                <span>Help section</span>
                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
