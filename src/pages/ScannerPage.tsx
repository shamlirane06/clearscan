import { useState } from "react";
import { QrCode, Link2 } from "lucide-react";
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            Security Inspector
          </h2>
          <p className="text-sm text-zinc-600">
            Scan physical QR codes via camera or paste suspicious URLs for real-time risk assessment.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-emerald-900/10 p-1">
          <button
            onClick={() => setTab("qr")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              tab === "qr"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-emerald-900/70 hover:text-emerald-950"
            }`}
          >
            <QrCode className="h-4 w-4" />
            QR Camera
          </button>
          <button
            onClick={() => setTab("url")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              tab === "url"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-emerald-900/70 hover:text-emerald-950"
            }`}
          >
            <Link2 className="h-4 w-4" />
            Manual URL
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        {tab === "qr" ? (
          <Scanner onScanComplete={onScanComplete} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
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
