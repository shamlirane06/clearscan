import { useState } from "react";
import {
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  QrCode,
  Link2,
  History,
  GraduationCap,
  Info,
} from "lucide-react";

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  historyCount?: number;
}

export default function Navbar({
  activePage,
  onNavigate,
  historyCount = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "scanner", label: "QR Scanner", icon: QrCode },
    { id: "manual", label: "URL Inspector", icon: Link2 },
    {
      id: "history",
      label: "Audit Logs",
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    { id: "learn", label: "Threat Academy", icon: GraduationCap },
    { id: "about", label: "Architecture", icon: Info },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNavClick("dashboard")}
            className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-400 transition-colors group-hover:border-teal-500/50 group-hover:bg-teal-500/15">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  ClearScan
                </span>
                <span className="rounded border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                  v2.4
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">
                Zero-Trust Verification
              </span>
            </div>
          </button>

          {/* Real-time system status */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-300">Engine Active</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-teal-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick("scanner")}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3.5 text-xs font-semibold text-teal-300 transition-colors hover:bg-teal-500/20 hover:border-teal-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/60"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-xs font-semibold text-teal-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="mt-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleNavClick("scanner")}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span>Launch Camera Scanner</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
