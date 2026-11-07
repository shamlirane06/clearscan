
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  LoaderCircle,
  RotateCcw,
  LockKeyhole,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

type ScanState = "scanning" | "loading" | "result";
type SecurityStatus = "SAFE" | "DANGEROUS";

export default function Scanner() {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [securityStatus, setSecurityStatus] =
    useState<SecurityStatus>("SAFE");
  const [scannedUrl, setScannedUrl] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const processedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
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
            setScannedUrl(decodedText);
            setScanError("");
            setScanState("loading");

            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch {
              // The scanner may already have stopped.
            }

            if (cancelled) return;

            try {
              const response = await fetch(
                "http://localhost:8081/api/scan",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ url: decodedText }),
                }
              );

              if (!response.ok) {
                throw new Error("Backend request failed");
              }

              const result: {
                url: string;
                status: SecurityStatus;
                message: string;
              } = await response.json();

              if (
                result.status !== "SAFE" &&
                result.status !== "DANGEROUS"
              ) {
                throw new Error("Unexpected backend response");
              }

              if (cancelled) return;

              setSecurityStatus(result.status);
              setResultMessage(result.message);
              setScanState("result");
            } catch {
              if (cancelled) return;

              setScanError(
                "Could not connect to the security checker. Make sure the backend is running on port 8081."
              );
              setScanState("result");
            }
          },
          () => {
            // Ignore frames where no QR code is detected.
          }
        );

        if (cancelled && scanner.isScanning) {
          await scanner.stop();
          await scanner.clear();
        }
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera access failed. Allow camera permission and try again."
          );
        }
      } finally {
        startingRef.current = false;
      }
    }

    if (scanState === "scanning") {
      void startScanner();
    }

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;

      if (scanner) {
        void (async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch {
            // Ignore cleanup errors.
          }

          try {
            await scanner.clear();
          } catch {
            // The scanner may already be cleared.
          }

          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        })();
      }
    };
  }, [scanState]);

  function resetScanner() {
    setCameraError("");
    setScanError("");
    setScannedUrl("");
    setResultMessage("");
    setSecurityStatus("SAFE");
    processedRef.current = false;
    setScanState("scanning");
  }

  return (
    <section className="relative w-full text-zinc-800">
        <div className="rounded-2xl border border-emerald-900/10 bg-[#0b1f18] p-5 text-zinc-100 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">QR Security Scanner</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Every link deserves a security check.
              </p>
            </div>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-400">
              ● Protected
            </span>
          </div>

          {scanState === "scanning" && (
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60">
              <div
                id="qr-reader"
                className="h-full w-full overflow-hidden rounded-2xl"
              />

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center">
                  <Camera className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-red-300">{cameraError}</p>
                  <button
                    onClick={resetScanner}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!cameraError && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56">
                    <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-xl border-l-2 border-t-2 border-emerald-400" />
                    <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-xl border-r-2 border-t-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-xl border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-xl border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {scanState === "loading" && (
            <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60">
              <LoaderCircle className="mb-5 h-12 w-12 animate-spin text-emerald-400" />
              <p className="font-medium">Checking your link...</p>
              <p className="mt-2 text-sm text-zinc-500">
                Sending URL to the security checker
              </p>
            </div>
          )}

          {scanState === "result" && (
            <div
              className={`rounded-2xl border p-5 ${
                scanError
                  ? "border-amber-400/30 bg-amber-400/[0.07]"
                  : securityStatus === "SAFE"
                    ? "border-emerald-400/30 bg-emerald-400/[0.07]"
                    : "border-red-400/30 bg-red-400/[0.07]"
              }`}
            >
              <div className="flex items-center gap-3">
                {scanError ? (
                  <ShieldAlert className="h-10 w-10 text-amber-400" />
                ) : securityStatus === "SAFE" ? (
                  <ShieldCheck className="h-10 w-10 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-10 w-10 text-red-400" />
                )}

                <div>
                  <h3
                    className={`font-bold ${
                      scanError
                        ? "text-amber-400"
                        : securityStatus === "SAFE"
                          ? "text-emerald-400"
                          : "text-red-400"
                    }`}
                  >
                    {scanError
                      ? "Security check unavailable"
                      : securityStatus === "SAFE"
                        ? "Link passed basic checks"
                        : "Suspicious link detected"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {scanError
                      ? scanError
                      : resultMessage ||
                        "The security checker returned a result."}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-2 text-xs text-zinc-500">
                  SCANNED URL / TEXT
                </p>
                <p className="break-all text-sm">{scannedUrl}</p>
              </div>

              <button
                onClick={resetScanner}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                Scan another QR code
              </button>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
            <LockKeyhole className="h-5 w-5 shrink-0 text-zinc-500" />
            <p className="text-xs leading-5 text-zinc-400">
              Check the destination before deciding to open a link.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-zinc-500">
          Uses the existing /api/scan checker when the backend is running.
        </p>
    </section>
  );
}
