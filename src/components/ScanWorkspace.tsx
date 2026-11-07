import { useState } from "react";
import { Link2, MessageSquareText, QrCode } from "lucide-react";
import {
  getDemoMessageResult,
  getDemoUrlResult,
  wait,
} from "../data/demoResults";
import type { PanelState, ScanResult } from "../types/scan";
import MessageScanner from "./MessageScanner";
import ResultPanel from "./ResultPanel";
import Scanner from "./Scanner";
import UrlScanner from "./UrlScanner";

type ScanTab = "message" | "url" | "qr";

const tabs: { id: ScanTab; label: string; icon: typeof MessageSquareText }[] = [
  { id: "message", label: "Message", icon: MessageSquareText },
  { id: "url", label: "Link", icon: Link2 },
  { id: "qr", label: "QR code", icon: QrCode },
];

export default function ScanWorkspace() {
  const [tab, setTab] = useState<ScanTab>("message");
  const [message, setMessage] = useState("");
  const [exampleId, setExampleId] = useState<string | undefined>();
  const [url, setUrl] = useState("");
  const [panelState, setPanelState] = useState<PanelState>("empty");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const loading = panelState === "loading";

  async function showDemoResult(next: ScanResult) {
    setError("");
    setPanelState("loading");
    await wait(700);
    setResult(next);
    setPanelState("result");
  }

  function handleExample(id: string, text: string) {
    setExampleId(id);
    setMessage(text);
  }

  async function analyzeMessage() {
    const trimmed = message.trim();
    if (!trimmed) {
      setResult(null);
      setError("Paste a message, or choose a quick example, before analysing.");
      setPanelState("error");
      return;
    }

    await showDemoResult(getDemoMessageResult(trimmed, exampleId));
  }

  async function analyzeUrl() {
    const trimmed = url.trim();
    if (!trimmed) {
      setResult(null);
      setError("Paste a link before checking it.");
      setPanelState("error");
      return;
    }

    try {
      const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      setResult(null);
      setError("That does not look like a valid web link. Include the full URL and try again.");
      setPanelState("error");
      return;
    }

    await showDemoResult(getDemoUrlResult(trimmed));
  }

  return (
    <section id="scan" className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Scan
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-emerald-950">
            Check a message, link, or QR code
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Message and URL tools show labelled sample results for Day 1. The QR
            scanner is your existing camera flow and still talks to the backend
            URL check.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-emerald-50/80 p-1.5">
              {tabs.map((item) => {
                const selected = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-white text-emerald-950 shadow-sm"
                        : "text-emerald-900/70 hover:text-emerald-950"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {tab === "message" && (
              <MessageScanner
                value={message}
                loading={loading}
                onChange={(value) => {
                  setExampleId(undefined);
                  setMessage(value);
                }}
                onExample={handleExample}
                onAnalyze={() => {
                  void analyzeMessage();
                }}
              />
            )}

            {tab === "url" && (
              <UrlScanner
                value={url}
                loading={loading}
                onChange={setUrl}
                onAnalyze={() => {
                  void analyzeUrl();
                }}
              />
            )}

            {tab === "qr" && (
              <div>
                <p className="mb-4 text-sm text-zinc-600">
                  Point your camera at a QR code. Results from this tool use the
                  existing security checker on port 8081.
                </p>
                <div className="mx-auto max-w-md">
                  <Scanner />
                </div>
              </div>
            )}
          </div>

          {tab === "qr" ? (
            <aside className="h-fit rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-emerald-950">QR results</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                The camera scanner shows its own loading, error, and result
                states in the panel on the left so the original QR flow stays
                intact.
              </p>
            </aside>
          ) : (
            <ResultPanel state={panelState} result={result} error={error} />
          )}
        </div>
      </div>
    </section>
  );
}
