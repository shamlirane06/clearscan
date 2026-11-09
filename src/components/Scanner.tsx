import { useCallback, useEffect, useRef, useState } from "react";
import {
  LoaderCircle,
  RefreshCw,
  Scan,
  AlertCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import type { BackendScanResponse } from "../types/scan";
import { scanUrl } from "../services/scanService";
import SecurityReport from "./SecurityReport";
import { parseUpiPayPayload, type UpiPaymentDetails } from "../utils/upi";

interface ScannerProps {
  onScanComplete?: (response: BackendScanResponse) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "analyzing" | "result">("scanning");
  const [cameraError, setCameraError] = useState("");
  const [cameraRequested, setCameraRequested] = useState(false);
  const [imageError, setImageError] = useState("");
  const [processError, setProcessError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<BackendScanResponse | null>(null);
  const [upiDetails, setUpiDetails] = useState<UpiPaymentDetails | null>(null);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const startingRef = useRef(false);
  const processedRef = useRef(false);

  const handleProcessUrl = useCallback(
    async (url: string) => {
      setProcessError("");
      const payment = parseUpiPayPayload(url);
      if (payment) {
        setUpiDetails(payment);
        setScanResult(null);
        setScanState("result");
        return;
      }
      setScanState("analyzing");
      try {
        const response = await scanUrl(url);
        setScanResult(response);
        setScanState("result");
        if (onScanComplete) {
          onScanComplete(response);
        }
      } catch {
        setProcessError("ClearScan could not complete the analysis. Try again or check that the backend is running.");
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
        if (!cancelled) setCameraActive(true);
      } catch {
        setCameraActive(false);
        if (!cancelled) {
          setCameraError(
            "Camera access is restricted or unavailable on this device. You can grant camera permission in your browser or select a test scenario below."
          );
        }
      } finally {
        startingRef.current = false;
      }
    }

    if (scanState === "scanning" && cameraRequested) {
      void startCamera();
    }

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      setCameraActive(false);
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
  }, [scanState, cameraRequested, handleProcessUrl, cameraAttempt]);

  function handleReset() {
    setScanResult(null);
    setUpiDetails(null);
    setCameraError("");
    setImageError("");
    setProcessError("");
    setCameraRequested(false);
    processedRef.current = false;
    setScanState("scanning");
    setCameraAttempt((attempt) => attempt + 1);
  }

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setImageError("Choose an image file smaller than 10 MB.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    processedRef.current = true;
      const scanner = scannerRef.current ?? new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
    try {
      if (!scanner) throw new Error("The QR reader is not ready yet. Try again in a moment.");
      if (scanner.isScanning) await scanner.stop();
      const decoded = await scanner.scanFile(file, false);
      await handleProcessUrl(decoded);
    } catch {
      processedRef.current = false;
      setImageError("No readable QR code was found in that image. Try a clear, well-lit image with the full code in frame.");
      setCameraAttempt((attempt) => attempt + 1);
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

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

  if (scanState === "result" && upiDetails) {
    return (
      <section className="upi-review rounded-2xl border p-6 sm:p-8" aria-labelledby="upi-review-title">
        <p className="eyebrow">QR payment request</p>
        <h2 id="upi-review-title" className="mt-2 text-2xl font-semibold">Review the details before you continue</h2>
        <p className="mt-2 text-sm">This QR contains a UPI payment address. ClearScan has only read the visible payload; it has not checked the recipient’s identity.</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[['Payee VPA', upiDetails.payeeVpa], ['Payee name', upiDetails.payeeName], ['Amount', upiDetails.amount ? `${upiDetails.currency ?? ''} ${upiDetails.amount}`.trim() : undefined], ['Currency', upiDetails.currency]].filter((item) => item[1]).map(([label, value]) => (
            <div key={label} className="rounded-xl border p-4"><dt className="text-xs opacity-70">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>
          ))}
        </dl>
        <p role="note" className="mt-5 rounded-xl border p-4 text-sm font-medium">The recipient name and VPA are supplied by the QR and are not independently verified. Confirm them with the person or business through a trusted channel. ClearScan will not initiate or open a payment.</p>
        <button onClick={handleReset} className="ink-action mt-5 rounded-lg px-5 py-3 text-sm font-semibold">Scan another QR</button>
      </section>
    );
  }

  if (scanState === "result" && processError) {
    return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6" role="alert">
      <h2 className="text-xl font-semibold">Analysis unavailable</h2>
      <p className="mt-2 text-sm">{processError}</p>
      <button onClick={handleReset} className="ink-action mt-5 rounded-lg px-5 py-3 text-sm font-semibold">Try another scan</button>
    </section>;
  }

  return (
    <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm sm:p-6">
      {/* Viewfinder Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-teal-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Optical QR Scanner
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Reads QR contents and reviews web destinations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            QR camera
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
                onClick={() => {
                  setCameraError("");
                  setCameraRequested(true);
                  setCameraAttempt((attempt) => attempt + 1);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : !cameraRequested ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-6 text-center">
              <p className="max-w-xs text-sm text-slate-300">Your camera stays off until you choose to scan.</p>
              <button type="button" onClick={() => setCameraRequested(true)} className="ink-action rounded-lg px-5 py-3 text-sm font-semibold">Start camera</button>
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
                  <span>{cameraActive ? "Camera Ready" : "Starting camera…"}</span>
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
          <h3 className="text-base font-semibold text-white">
            Auditing Destination Security
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Evaluating protocol integrity, domain reputation, typosquatting heuristics, and known threat feeds...
          </p>
        </div>
      )}

      {/* Synthetic test targets */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Try a sample</span>
          <span className="text-[11px] text-slate-400">Example scans</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={() => handleSyntheticScan("https://www.wikipedia.org")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-emerald-500/40 hover:bg-slate-900"
          >
              <span className="text-xs font-semibold text-emerald-400">
              Safe example · HTTPS
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate w-full mt-0.5">
              wikipedia.org
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("http://sbi-kyc-update.xyz/verify")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-amber-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-semibold text-amber-400">
              Synthetic phishing · lookalike
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate w-full mt-0.5">
              sbi-kyc-update.xyz /verify
            </span>
          </button>

          <button
            onClick={() => handleSyntheticScan("upi://pay?pa=demostore%40upi&pn=Demo%20Store&am=100&cu=INR")}
            className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition-colors hover:border-rose-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-semibold text-rose-400">
              UPI payment QR · synthetic
            </span>
            <span className="text-[11px] text-slate-400 truncate w-full mt-0.5">
              Demo Store · ₹100 INR · review only
            </span>
          </button>
        </div>
        {imageError && <p className="text-xs text-rose-400" role="alert">{imageError}</p>}
        {scanState === "scanning" && (
          <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">Or choose a QR image from this device. The image is decoded in your browser.</p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Choose QR code image"
                onChange={(event) => void handleImageUpload(event.target.files?.[0])}
              />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-teal-500">
                Upload QR image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
