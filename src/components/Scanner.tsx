import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  LoaderCircle,
  Sparkles,
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
          { fps: 10, qrbox: { width: 220, height: 220 } },
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
            "Camera access was blocked or not found. You can allow camera permissions or test with the synthetic QR samples below."
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
    <div className="rounded-2xl border border-emerald-900/10 bg-[#0b1f18] p-5 text-zinc-100 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">QR Security Scanner</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Real-time optical destination verification
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Active Shield
        </span>
      </div>

      {scanState === "scanning" && (
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60">
          <div id="qr-reader" className="h-full w-full overflow-hidden rounded-2xl" />

          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center">
              <Camera className="h-10 w-10 text-amber-400" />
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs">{cameraError}</p>
              <button
                onClick={handleReset}
                className="mt-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-emerald-400" />
                <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-emerald-400" />
                <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {scanState === "analyzing" && (
        <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6 text-center">
          <LoaderCircle className="mb-4 h-12 w-12 animate-spin text-emerald-400" />
          <h4 className="font-semibold text-white">Extracting &amp; Analyzing Link</h4>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs">
            Running 6-layer heuristic analysis and threat intelligence checks...
          </p>
        </div>
      )}

      {/* Synthetic QR Code Simulators for Desktop Hackathon Evaluation */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Test Optical QR Scenarios (Desktop Simulator)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <button
            onClick={() => handleSyntheticScan("https://www.wikipedia.org")}
            className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-left text-zinc-300 hover:border-emerald-400/50 hover:bg-white/10"
          >
            <span className="block font-medium text-emerald-400">QR: Official Site</span>
            <span className="text-[10px] text-zinc-500">wikipedia.org</span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://amaz0n-security-portal.xyz/verify")}
            className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-left text-zinc-300 hover:border-amber-400/50 hover:bg-white/10"
          >
            <span className="block font-medium text-amber-400">QR: Lookalike Fake</span>
            <span className="text-[10px] text-zinc-500">amaz0n.xyz</span>
          </button>

          <button
            onClick={() => handleSyntheticScan("https://testsafebrowsing.appspot.com/malware")}
            className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-left text-zinc-300 hover:border-rose-400/50 hover:bg-white/10"
          >
            <span className="block font-medium text-rose-400">QR: Malicious Test</span>
            <span className="text-[10px] text-zinc-500">Google SafeBrowsing demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
