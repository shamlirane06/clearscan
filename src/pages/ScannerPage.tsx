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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Live Threat Inspector
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-mono">
            Optical QR camera scanner and command-line destination analyzer
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            onClick={() => setTab("qr")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              tab === "qr"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <QrCode className="h-3.5 w-3.5 text-emerald-400" />
            <span>OPTICAL CAMERA</span>
          </button>
          <button
            onClick={() => setTab("url")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              tab === "url"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Link2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>COMMAND BAR</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        {tab === "qr" ? (
          <Scanner onScanComplete={onScanComplete} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl">
              <URLInput onScan={handleManualScan} loading={manualLoading} />
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
