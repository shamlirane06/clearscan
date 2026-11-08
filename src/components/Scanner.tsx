import { useCallback, useEffect, useRef, useState } from "react";
import {
  LoaderCircle,
  Sparkles,
  RefreshCw,
  Scan,
  AlertCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import type { BackendScanResponse } from "../types/scan";
import { scanUrl } from "../services/scanService";
import SecurityReport from "./SecurityReport";

interface ScannerProps {
  onScanComplete?: (response: BackendScanResponse) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "analyzing" | "result">("scanning");
  const [cameraError, setCameraError] = useState("");
  const [scanResult, setScanResult] = useState<BackendScanResponse | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const processedRef = useRef(false);

  const handleProcessUrl = useCallback(
    async (url: string) => {
      setScanState("analyzing");
      try {
        const response = await scanUrl(url);
        setScanResult(response);
        setScanState("result");
        if (onScanComplete) {
          onScanComplete(response);
        }
      } catch {
        setScanState("result");
      }
    },
    [onScanComplete]
  );

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (startingRef.current) return;
      startingRef.current = true;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (cancelled || processedRef.current) return;
            processedRef.current = true;

            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch {
              // Ignore stop errors
            }

            if (cancelled) return;
            await handleProcessUrl(decodedText);
          },
          () => {}
        );
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera access is restricted or unavailable on this device. You can grant camera permission in your browser or select a test scenario below."
          );
        }
      } finally {
        startingRef.current = false;
      }
    }

    if (scanState === "scanning") {
      void startCamera();
    }

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        void (async () => {
          try {
            if (scanner.isScanning) await scanner.stop();
          } catch {}
          try {
            await scanner.clear();
          } catch {}
          if (scannerRef.current === scanner) scannerRef.current = null;
        })();
      }
    };
  }, [scanState, handleProcessUrl]);

  function handleReset() {
    setScanResult(null);
    setCameraError("");
    processedRef.current = false;
    setScanState("scanning");
  }

  // Quick synthetic QR simulation for testing on desktop
  const handleSyntheticScan = async (mockUrl: string) => {
    processedRef.current = true;
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
      } catch {}
    }
    await handleProcessUrl(mockUrl);
  };

  if (scanState === "result" && scanResult) {
    return <SecurityReport report={scanResult} onReset={handleReset} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg backdrop-blur-sm">
      {/* Viewfinder Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Optical QR Scanner
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time payload extraction &amp; destination verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Scanner Active
          </span>
        </div>
      </div>

      {/* Camera Viewfinder Viewport */}
      {scanState === "scanning" && (
        <div className="relative flex aspect-square sm:aspect-[4/3] max-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <div id="qr-reader" className="h-full w-full overflow-hidden rounded-xl" />

          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-slate-300">
                {cameraError}
              </p>
              <button
                onClick={handleReset}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : (
            <>
              {/* Subtle Framing Reticle */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  {/* Top-Left */}
                  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-teal-400" />
                  {/* Top-Right */}
                  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-teal-400" />
                  {/* Bottom-Left */}
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-teal-400" />
                  {/* Bottom-Right */}
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-teal-400" />
                </div>
              </div>

              {/* Viewport status banner */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-sm">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  <span>Camera Ready</span>
                </span>
                <span className="text-slate-400">Center QR in frame</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {scanState === "analyzing" && (
        <div className="flex aspect-square sm:aspect-[4/3] max-h-[360px] w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/90 p-6 text-center">
          <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-teal-400" />
          <h4 className="text-base font-semibold text-white">
            Auditing Destination Security
          </h4>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Evaluating protocol integrity, domain reputation, typosquatting heuristics, and known threat feeds...
          </p>
        </div>
      )}

      {/* Synthetic test targets */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Simulation Fixtures</span>
          </span>
          <span className="text-[11px] text-slate-400">Desktop Evaluation</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={() => handleSyntheticScan("https://www.wikipedia.org")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-semibold text-emerald-400">
              Clean Destination
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate w-full mt-0.5">
              wikipedia.org
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://amaz0n-security-portal.xyz/verify")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-amber-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-semibold text-amber-400">
              Typosquatted Brand
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate w-full mt-0.5">
              amaz0n.xyz (Score: 75+)
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://testsafebrowsing.appspot.com/malware")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-rose-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-semibold text-rose-400">
              Known Malware URL
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate w-full mt-0.5">
              SafeBrowsing demo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
