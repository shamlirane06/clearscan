import { ClipboardPaste, Eye, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Scan a QR or paste a link",
    body: "ClearScan reads a QR destination or a web address without opening the destination.",
  },
  {
    icon: Eye,
    title: "Review the warning signs",
    body: "See risk level, common scam patterns, a plain-language explanation, and practical next steps.",
  },
  {
    icon: ShieldCheck,
    title: "Decide before you trust it",
    body: "Use official apps, known phone numbers, and extra caution. Results are indicators, not a verdict.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-emerald-900/10 bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
          How it works
        </p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-emerald-950">
          A pause before you open a link or follow a QR.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Review the real URL checks ClearScan completed, plus whether its
          backend and Google Safe Browsing were available for this scan.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-emerald-900/10 bg-[#f6faf7] p-5 shadow-sm"
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-semibold text-emerald-700">Step {index + 1}</p>
              <h3 className="mt-1 font-semibold text-emerald-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
