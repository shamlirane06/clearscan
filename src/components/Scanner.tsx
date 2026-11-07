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
            "Camera sensor access restricted or offline. You can enable camera permission in your browser or trigger synthetic QR scenarios below."
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

  // Quick synthetic QR simulation for hackathon demo on desktops
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
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      {/* Terminal Viewfinder Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Optical QR Inspector
            </h3>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
            Real-time payload extraction &amp; destination validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            SHIELD ACTIVE
          </span>
        </div>
      </div>

      {/* Camera Viewfinder Viewport */}
      {scanState === "scanning" && (
        <div className="relative flex aspect-square sm:aspect-[4/3] max-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black/80">
          <div id="qr-reader" className="h-full w-full overflow-hidden rounded-xl" />

          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="max-w-xs font-mono text-xs leading-relaxed text-zinc-400">
                {cameraError}
              </p>
              <button
                onClick={handleReset}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 font-mono text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              {/* HUD Target Crosshairs & Brackets */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  {/* Top-Left */}
                  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  {/* Top-Right */}
                  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  {/* Bottom-Left */}
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  {/* Bottom-Right */}
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

                  {/* Scanning Laser Beam */}
                  <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-scanline" />

                  {/* Center reticle */}
                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/50" />
                </div>
              </div>

              {/* Viewport status banner */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 font-mono text-[10px] text-zinc-400 backdrop-blur">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  OPTICAL SENSOR ACTIVE
                </span>
                <span>CENTER QR IN RETICLE</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {scanState === "analyzing" && (
        <div className="flex aspect-square sm:aspect-[4/3] max-h-[360px] w-full flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/90 p-6 text-center">
          <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-emerald-400" />
          <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
            Extracting &amp; Auditing Destination
          </h4>
          <p className="mt-1 font-mono text-xs text-zinc-400 max-w-xs">
            Evaluating protocol, brand integrity, obfuscation, and reputation telemetry...
          </p>
        </div>
      )}

      {/* Quick synthetic test targets for instant desktop hackathon demo */}
      <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Quick Optical Target Simulation
          </span>
          <span className="text-[10px] text-zinc-500">Desktop Evaluation</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={() => handleSyntheticScan("https://www.wikipedia.org")}
            className="flex flex-col items-start rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 text-left transition-all hover:border-emerald-500/40 hover:bg-zinc-900"
          >
            <span className="font-mono text-[11px] font-semibold text-emerald-400">
              TARGET: SAFE HTTPS
            </span>
            <span className="font-mono text-[10px] text-zinc-500 truncate w-full">
              wikipedia.org
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://amaz0n-security-portal.xyz/verify")}
            className="flex flex-col items-start rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 text-left transition-all hover:border-amber-500/40 hover:bg-zinc-900"
          >
            <span className="font-mono text-[11px] font-semibold text-amber-400">
              TARGET: TYPOSQUAT
            </span>
            <span className="font-mono text-[10px] text-zinc-500 truncate w-full">
              amaz0n.xyz (Score: 75+)
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://testsafebrowsing.appspot.com/malware")}
            className="flex flex-col items-start rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 text-left transition-all hover:border-rose-500/40 hover:bg-zinc-900"
          >
            <span className="font-mono text-[11px] font-semibold text-rose-400">
              TARGET: SYNTHETIC MALWARE
            </span>
            <span className="font-mono text-[10px] text-zinc-500 truncate w-full">
              Google SafeBrowsing demo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
