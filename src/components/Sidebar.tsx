import { DashboardGrid, HelpCircle, InfoCircle, ReportDocument, ScanHistory, ShieldLogo } from "./icons/ClearScanIcons";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const items = [
  { id: "dashboard", label: "Dashboard", icon: DashboardGrid },
  { id: "history", label: "Scan History", icon: ScanHistory },
  { id: "reports", label: "Reports", icon: ReportDocument },
  { id: "learn", label: "Help", icon: HelpCircle },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-700 bg-slate-900 px-3 py-5 lg:flex xl:w-[244px] xl:px-4">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="mb-5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label="ClearScan dashboard"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-950 text-teal-700">
          <ShieldLogo className="h-8 w-8" aria-hidden="true" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-xl font-semibold text-slate-100">ClearScan</span>
          <span className="mt-0.5 block text-sm text-slate-400">QR &amp; link safety</span>
        </span>
      </button>

      <nav aria-label="Primary navigation" className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`cs-nav-item flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isActive
                  ? "border border-teal-600/15 bg-teal-500/10 text-teal-700"
                  : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-teal-600" : "text-slate-500"}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-700 pt-4">
        <button
          type="button"
          onClick={() => onNavigate("about")}
          aria-current={activePage === "about" ? "page" : undefined}
          className={`cs-nav-item mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-medium transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${activePage === "about" ? "border border-teal-600/15 bg-teal-500/10 text-teal-700" : "text-slate-300"}`}
        >
          <InfoCircle className={`h-5 w-5 shrink-0 ${activePage === "about" ? "text-teal-600" : "text-slate-500"}`} aria-hidden="true" />
          <span>About ClearScan</span>
        </button>
      </div>
    </aside>
  );
}
