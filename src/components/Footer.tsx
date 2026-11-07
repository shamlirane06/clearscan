import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-emerald-900/10 bg-emerald-950 px-4 py-10 text-emerald-50 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold">ClearScan India</span>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/80">
            A hackathon project to help people look twice at suspicious messages
            and links. Built for awareness, not as a replacement for your bank,
            UPI app, or the police.
          </p>
        </div>

        <div className="space-y-4 text-sm leading-6 text-emerald-100/85">
          <p>
            <span className="font-semibold text-white">Privacy notice. </span>
            Do not paste OTPs, PINs, passwords, Aadhaar numbers, or card details.
            Message and link checks on this page are local sample previews and
            are not stored by a live detection service yet.
          </p>
          <p>
            <span className="font-semibold text-white">Disclaimer. </span>
            Results are indicators, not a guarantee. A “low risk” sample does not
            mean a message is safe, and a “high risk” sample does not prove a
            crime. When in doubt, use official apps and report suspected fraud
            through trusted channels.
          </p>
        </div>
      </div>
    </footer>
  );
}
