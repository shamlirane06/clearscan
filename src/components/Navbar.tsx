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
      label: "Scan History",
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    { id: "learn", label: "Learn to Stay Safe", icon: GraduationCap },
    { id: "about", label: "About ClearScan", icon: Info },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick("dashboard")}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-emerald-950">
              ClearScan
            </span>
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-emerald-700/80">
              Scan Before You Trust
            </span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-800" : "text-zinc-400"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Quick Scan */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick("scanner")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-800 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan QR Code
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-900/10 text-emerald-950 lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-emerald-900/10 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-800" : "text-zinc-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
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
