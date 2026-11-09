import { useState } from "react";
import { Close, DashboardGrid, HelpCircle, InfoCircle, LinkChain, MenuBars, QrCodeMark, ReportDocument, ScanHistory, ShieldLogo } from "./icons/ClearScanIcons";

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
    { id: "dashboard", label: "Dashboard", icon: DashboardGrid },
    { id: "scanner", label: "QR scan", icon: QrCodeMark },
    { id: "manual", label: "Check a URL", icon: LinkChain },
    {
      id: "history",
      label: "History",
      icon: ScanHistory,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    { id: "reports", label: "Reports", icon: ReportDocument },
    { id: "learn", label: "Help", icon: HelpCircle },
    { id: "about", label: "About", icon: InfoCircle },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900">
      <div className="mx-auto flex h-14 w-full max-w-none items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:h-[84px] xl:pl-8 xl:pr-7">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={() => handleNavClick("dashboard")}
            className="navbar-brand flex items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-950 text-teal-700">
              <ShieldLogo className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-100">ClearScan</span>
              <span className="block text-xs text-slate-400">QR &amp; link safety</span>
            </span>
          </button>
        <div className="navbar-status hidden items-center gap-2 text-sm text-slate-400 lg:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="font-medium text-slate-300">Local checks ready</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:gap-5">
          <button
            type="button"
            onClick={() => handleNavClick("scanner")}
            aria-label="Scan QR code"
            className="ink-action inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:px-3.5 xl:min-h-11 xl:px-4 xl:text-sm"
          >
            <QrCodeMark className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-controls="mobile-navigation"
            className="navbar-mobile-menu inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <Close className="h-4 w-4" aria-hidden="true" /> : <MenuBars className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-slate-700 bg-slate-950 px-4 py-3 lg:hidden">
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`cs-nav-item flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border border-teal-600/15 bg-teal-500/10 text-teal-700"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-500"}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                  <span className="rounded-full bg-teal-950 px-2 py-0.5 text-xs font-semibold text-teal-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="mt-2 border-t border-slate-700 pt-2">
              <button
                type="button"
                onClick={() => handleNavClick("scanner")}
                className="ink-action flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <QrCodeMark className="h-4 w-4" aria-hidden="true" />
                <span>Launch Camera Scanner</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
