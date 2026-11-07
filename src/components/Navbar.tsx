import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5" onClick={close}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-emerald-950">
              ClearScan
            </span>
            <span className="block text-[11px] font-medium text-emerald-700/80">
              India
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-800"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#scan"
            className="inline-flex h-10 items-center rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900"
          >
            Scan
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-900/10 text-emerald-900 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-emerald-900/10 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#scan"
              onClick={close}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white"
            >
              Scan
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
