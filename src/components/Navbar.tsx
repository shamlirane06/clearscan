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
    { id: "manual", label: "Manual URL Check", icon: Link2 },
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
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Workspace Indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavClick("dashboard")}
            className="flex items-center gap-2.5 text-left group"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all group-hover:border-emerald-500/50">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-tight text-white">
                  ClearScan
                </span>
                <span className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.2 font-mono text-[9px] font-semibold text-zinc-400">
                  v2.4
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase block">
                Security Assistant
              </span>
            </div>
          </button>

          {/* Engine Status Tag */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CORE ENGINE: LIVE</span>
          </div>
        </div>

        {/* Desktop Segmented Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick("scanner")}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 font-mono text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/20"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>LAUNCH SCANNER</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
