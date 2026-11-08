import { useState } from "react";
import { QrCode, Link2, ScanLine } from "lucide-react";
import Scanner from "../components/Scanner";
import URLInput from "../components/URLInput";
import SecurityReport from "../components/SecurityReport";
import { scanUrl } from "../services/scanService";
import type { BackendScanResponse } from "../types/scan";

interface ScannerPageProps {
  onScanComplete: (response: BackendScanResponse) => void;
  defaultTab?: "qr" | "url";
}

export default function ScannerPage({
  onScanComplete,
  defaultTab = "qr",
}: ScannerPageProps) {
  const [tab, setTab] = useState<"qr" | "url">(defaultTab);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<BackendScanResponse | null>(null);

  const handleManualScan = async (url: string) => {
    setManualLoading(true);
    try {
      const result = await scanUrl(url);
      setManualResult(result);
      onScanComplete(result);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ScanLine className="h-5 w-5 text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Scan a QR code or check a link
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Review a destination for common warning signs before you open it.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setTab("qr")}
            aria-pressed={tab === "qr"}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
              tab === "qr"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrCode className="h-3.5 w-3.5 text-teal-400" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => setTab("url")}
            aria-pressed={tab === "url"}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
              tab === "url"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Link2 className="h-3.5 w-3.5 text-slate-400" />
            <span>URL Inspector</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        {tab === "qr" ? (
          <Scanner onScanComplete={onScanComplete} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
              <URLInput
                onScan={handleManualScan}
                loading={manualLoading}
                onInputChange={() => setManualResult(null)}
              />
            </div>

            {manualResult && (
              <SecurityReport report={manualResult} onReset={() => setManualResult(null)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
