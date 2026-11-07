import { MessageSquareWarning, QrCode, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_top_right,rgba(6,95,70,0.08),transparent_42%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_36%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-800/15 bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Check before you tap, pay, or share
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">
            Check suspicious messages and links before you trust them.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            ClearScan India helps you pause on KYC texts, fake parcels, job
            offers, and UPI requests. Paste the message or link, review the
            warning signs, then decide with more context.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#scan"
              className="inline-flex h-11 items-center rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900"
            >
              Scan a message
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-xl border border-emerald-900/15 bg-white px-5 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <MessageSquareWarning className="mb-3 h-6 w-6 text-emerald-800" />
            <h2 className="font-semibold text-emerald-950">Messages &amp; links</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Paste an SMS or WhatsApp text, or a URL you were asked to open.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <QrCode className="mb-3 h-6 w-6 text-emerald-800" />
            <h2 className="font-semibold text-emerald-950">QR codes</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Use the existing camera scanner to check a QR destination before
              you follow it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
