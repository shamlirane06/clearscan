import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Upload,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  QrCode,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import SecurityReport from "../components/SecurityReport";
import { scanUrl } from "../services/scanService";
import { parseUpiPayPayload, type UpiPaymentDetails } from "../utils/upi";
import { validateAndNormalizeUrl } from "../utils/validation";
import type { BackendScanResponse } from "../types/scan";

interface ScannerPageProps {
  onScanComplete?: (response: BackendScanResponse) => void;
  defaultTab?: "qr" | "url";
}

export default function ScannerPage({ onScanComplete }: ScannerPageProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [imageError, setImageError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [processError, setProcessError] = useState("");
  const [scanResult, setScanResult] = useState<BackendScanResponse | null>(null);
  const [upiDetails, setUpiDetails] = useState<UpiPaymentDetails | null>(null);
  const [plainTextResult, setPlainTextResult] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const startingRef = useRef(false);
  const processedRef = useRef(false);

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // Ignore stop error
      }
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        void (async () => {
          try {
            if (scanner.isScanning) await scanner.stop();
          } catch {}
          try {
            await scanner.clear();
          } catch {}
          scannerRef.current = null;
        })();
      }
    };
  }, []);

  // Process decoded QR payload
  const handleDecodedText = useCallback(
    async (decodedText: string) => {
      const trimmed = decodedText.trim();
      if (!trimmed) return;

      // Stop camera once QR code is detected
      await stopCamera();

      // 1. Check for UPI payment QR
      const payment = parseUpiPayPayload(trimmed);
      if (payment) {
        setUpiDetails(payment);
        setScanResult(null);
        setPlainTextResult(null);
        return;
      }

      // 2. Check for URL
      const validation = validateAndNormalizeUrl(trimmed);
      const isLikelyUrl =
        validation.isValid ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/.*)?$/.test(trimmed);

      if (isLikelyUrl && validation.normalizedUrl) {
        setAnalyzing(true);
        setProcessError("");
        try {
          const response = await scanUrl(validation.normalizedUrl);
          setScanResult(response);
          setUpiDetails(null);
          setPlainTextResult(null);
          if (onScanComplete) {
            onScanComplete(response);
          }
        } catch {
          setProcessError("ClearScan could not complete destination analysis. Try again or check network connection.");
        } finally {
          setAnalyzing(false);
        }
        return;
      }

      // 3. Plain text / non-URL QR code
      setPlainTextResult(trimmed);
      setScanResult(null);
      setUpiDetails(null);
    },
    [onScanComplete, stopCamera]
  );

  // Start live camera
  const handleStartCamera = async () => {
    if (startingRef.current) return;
    if (cameraActive) {
      await stopCamera();
      return;
    }

    setCameraError("");
    setImageError("");
    setProcessError("");
    setCameraLoading(true);
    startingRef.current = true;
    processedRef.current = false;

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
      }

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
        },
        async (decodedText) => {
          if (processedRef.current) return;
          processedRef.current = true;
          await handleDecodedText(decodedText);
        },
        () => {
          // Frame callback - no-op
        }
      );

      setCameraActive(true);
      setCameraError("");
    } catch {
      setCameraActive(false);
      setCameraError(
        "Camera access is restricted or unavailable on this device. You can grant camera permission in your browser or upload a QR image instead."
      );
    } finally {
      startingRef.current = false;
      setCameraLoading(false);
    }
  };

  // Upload and decode image file
  const handleImageFileChange = async (file?: File) => {
    if (!file) return;
    setImageError("");
    setProcessError("");

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setImageError("Please choose an image file (PNG, JPG, WEBP) smaller than 10 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Stop active camera first
    await stopCamera();

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
      }

      const decoded = await scanner.scanFile(file, false);
      await handleDecodedText(decoded);
    } catch {
      setImageError("No readable QR code was found in this image. Try a clear, well-lit image with the full code in frame.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Reset scan state
  const handleReset = () => {
    setScanResult(null);
    setUpiDetails(null);
    setPlainTextResult(null);
    setProcessError("");
    setImageError("");
    setCameraError("");
    processedRef.current = false;
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* 1. Page Heading */}
      <header>
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#24322c] leading-tight">
          Scan a QR code or check a link
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#65736d]">
          Review a destination for common warning signs before you open it.
        </p>
      </header>

      {/* 2. Main QR Scanner Card */}
      <section
        className="rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 lg:p-7 shadow-xs"
        aria-label="QR Scanner Section"
      >
        {/* Card Header */}
        <div className="flex items-start gap-3 mb-4 sm:mb-5">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center text-[#176b50]">
            {/* 4 corner brackets reticle with center dash matching reference */}
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#24322c] leading-tight">
              QR Scanner
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#65736d]">
              Scan a QR code using your camera or upload an image
            </p>
          </div>
        </div>

        {/* Inner Pale Green Scanner Panel */}
        <div className="rounded-xl border border-[#d0e2d6] bg-[#edf5f0] p-5 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Scanner Preview */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[440px] aspect-[4/3] sm:aspect-[16/10] max-h-[290px] flex flex-col items-center justify-center rounded-xl overflow-hidden bg-transparent">
                {/* 4 Dark-Green Rounded Corner Brackets */}
                <div
                  className="pointer-events-none absolute left-4 top-4 h-9 w-9 sm:h-10 sm:w-10 rounded-tl-xl border-l-[3px] border-t-[3px] border-[#176b50] z-20"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute right-4 top-4 h-9 w-9 sm:h-10 sm:w-10 rounded-tr-xl border-r-[3px] border-t-[3px] border-[#176b50] z-20"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute bottom-4 left-4 h-9 w-9 sm:h-10 sm:w-10 rounded-bl-xl border-b-[3px] border-l-[3px] border-[#176b50] z-20"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute bottom-4 right-4 h-9 w-9 sm:h-10 sm:w-10 rounded-br-xl border-b-[3px] border-r-[3px] border-[#176b50] z-20"
                  aria-hidden="true"
                />

                {/* Html5Qrcode video container (active during live streaming) */}
                <div
                  id="qr-reader"
                  className={`w-full h-full object-cover overflow-hidden rounded-xl ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />

                {/* Live Scanning Reticle Overlay */}
                {cameraActive && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#176b50]/90 px-3 py-1 text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Camera Active • Point at QR</span>
                    </span>

                    {/* Subtle scanning laser line */}
                    <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#176b50] to-transparent shadow-[0_0_8px_#176b50] animate-pulse" />

                    <span className="text-[11px] font-medium text-[#24322c]/80 bg-white/80 px-2.5 py-0.5 rounded-full">
                      Center QR code in frame
                    </span>
                  </div>
                )}

                {/* Camera Inactive Placeholder */}
                {!cameraActive && !cameraError && (
                  <div className="flex flex-col items-center justify-center text-center p-6 z-10">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center text-[#176b50]">
                      <Camera className="h-11 w-11 sm:h-13 sm:w-13 stroke-[1.5]" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-sm sm:text-base font-bold text-[#24322c]">
                      Point your camera at a QR code
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#65736d]">
                      or upload an image
                    </p>
                  </div>
                )}

                {/* Camera Permission / Device Error */}
                {cameraError && (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-white/90 rounded-xl z-20 max-w-sm">
                    <AlertCircle className="h-8 w-8 text-[#c2621a] mb-2" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-[#24322c] font-medium">
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#176b50] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#155d46] transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:flex items-center justify-center lg:col-span-1 self-stretch">
              <div className="w-px h-full bg-[#d5ddda]" aria-hidden="true" />
            </div>

            {/* Right Column: Scanning Options */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center py-2">
              <h3 className="text-sm sm:text-base font-bold text-[#24322c] mb-4">
                Or choose an option
              </h3>

              <div className="w-full max-w-[280px] space-y-3">
                {/* 1. Start / Stop Camera Button */}
                <button
                  type="button"
                  onClick={handleStartCamera}
                  disabled={cameraLoading}
                  className={`w-full h-11 sm:h-12 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50] disabled:opacity-70 ${
                    cameraActive
                      ? "bg-[#c2410c] hover:bg-[#9a3412] text-white"
                      : "bg-[#176b50] hover:bg-[#155d46] text-white"
                  }`}
                >
                  {cameraLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Starting Camera...</span>
                    </>
                  ) : cameraActive ? (
                    <>
                      <CameraOff className="h-4.5 w-4.5" />
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4.5 w-4.5" />
                      <span>Start Camera</span>
                    </>
                  )}
                </button>

                {/* 2. Upload QR Image Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="sr-only"
                  aria-label="Upload QR code image"
                  onChange={(e) => void handleImageFileChange(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-11 sm:h-12 flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#176b50] bg-white text-[#176b50] hover:bg-[#f4f9f6] font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b50]"
                >
                  <Upload className="h-4.5 w-4.5" />
                  <span>Upload QR Image</span>
                </button>
              </div>

              {/* Upload or process feedback */}
              {imageError && (
                <div
                  className="mt-3.5 max-w-[280px] flex items-center gap-1.5 text-left text-xs text-[#c2621a] bg-amber-50 border border-amber-200/80 rounded-lg p-2.5"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {processError && (
                <div
                  className="mt-3.5 max-w-[280px] flex items-center gap-1.5 text-left text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{processError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Notice Strip inside Main Card */}
        <div className="mt-4 sm:mt-5 flex items-center gap-2.5 rounded-xl bg-[#e4f0e9] border border-[#d0e2d6]/70 px-4 py-2.5 text-xs sm:text-[13px] text-[#24322c]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#176b50]" aria-hidden="true" />
          <span>Your camera stays off until you choose to scan.</span>
        </div>
      </section>

      {/* 3. Security at a Glance Card */}
      <section
        className="rounded-xl border border-[#d5ddda] bg-white p-3.5 sm:p-4 shadow-xs flex items-center gap-3.5"
        aria-labelledby="security-glance-heading"
      >
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#e4f0e9] text-[#176b50]">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="security-glance-heading" className="text-sm sm:text-base font-bold text-[#24322c]">
            Security at a glance
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#65736d]">
            Scan with confidence. We'll check for malicious links, phishing attempts and more.
          </p>
        </div>
      </section>

      {/* Analyzing Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#d5ddda] bg-white p-8 shadow-2xl text-center max-w-sm w-full">
            <Loader2 className="h-10 w-10 animate-spin text-[#176b50] mb-3" />
            <h4 className="text-base font-bold text-[#24322c]">Analyzing Destination</h4>
            <p className="mt-1 text-xs text-[#65736d]">
              Evaluating protocol integrity, domain heuristics, and security risks...
            </p>
          </div>
        </div>
      )}

      {/* Scan Result Modal Dossier (Full SecurityReport) */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d5ddda] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8edeb]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50]">
                  <QrCode className="h-4 w-4" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                  QR Destination Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 text-[#65736d] hover:bg-[#f4f6f5] hover:text-[#24322c] transition-colors"
                aria-label="Close report"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <SecurityReport report={scanResult} onReset={handleReset} />
          </div>
        </div>
      )}

      {/* UPI Payment Request Modal */}
      {upiDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#d5ddda] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8edeb]">
              <h3 className="text-base sm:text-lg font-bold text-[#24322c]">QR Payment Request</h3>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 text-[#65736d] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#4b5a53]">
              This QR code contains a UPI payment request. ClearScan has inspected the visible parameters; verify the recipient’s identity before proceeding.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {upiDetails.payeeName && (
                <div className="rounded-lg border border-[#d5ddda] bg-[#f4f6f5] p-3">
                  <dt className="text-[#65736d]">Payee Name</dt>
                  <dd className="font-semibold text-[#24322c] mt-0.5 truncate">{upiDetails.payeeName}</dd>
                </div>
              )}
              {upiDetails.payeeVpa && (
                <div className="rounded-lg border border-[#d5ddda] bg-[#f4f6f5] p-3">
                  <dt className="text-[#65736d]">UPI ID (VPA)</dt>
                  <dd className="font-semibold text-[#24322c] mt-0.5 truncate">{upiDetails.payeeVpa}</dd>
                </div>
              )}
              {upiDetails.amount && (
                <div className="rounded-lg border border-[#d5ddda] bg-[#f4f6f5] p-3 col-span-2">
                  <dt className="text-[#65736d]">Requested Amount</dt>
                  <dd className="font-semibold text-[#24322c] mt-0.5">{upiDetails.currency || "INR"} ₹{upiDetails.amount}</dd>
                </div>
              )}
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46]"
              >
                Scan Another QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plain Text QR Modal */}
      {plainTextResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#d5ddda] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e8edeb]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50]">
                  <QrCode className="h-4 w-4" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#24322c]">
                  Decoded QR Content (Plain Text)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 text-[#65736d] hover:bg-[#f4f6f5] hover:text-[#24322c]"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#4b5a53]">
              This QR code contains plain text rather than a web link or payment request. ClearScan performs automated security audits exclusively on web destinations.
            </p>

            <div className="mt-4 rounded-xl border border-[#d5ddda] bg-[#f4f6f5] p-3.5">
              <p className="text-[11px] font-semibold text-[#65736d] uppercase tracking-wider mb-1">
                Raw Decoded Text
              </p>
              <pre className="font-mono text-xs sm:text-sm text-[#24322c] whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {plainTextResult}
              </pre>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-[#176b50] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#155d46]"
              >
                Scan Another QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
