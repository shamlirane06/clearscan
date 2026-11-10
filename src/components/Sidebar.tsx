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
    <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-slate-700 bg-slate-900 px-3 py-3.5 lg:flex xl:w-60 xl:px-4 xl:py-4">
      <div>
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="mb-3.5 xl:mb-4 flex items-center gap-2.5 rounded-lg px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="ClearScan dashboard"
        >
          <span className="flex h-10 w-10 xl:h-11 xl:w-11 shrink-0 items-center justify-center rounded-xl bg-teal-950 text-teal-700">
            <ShieldLogo className="h-5 w-5 xl:h-5.5 xl:w-5.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-base xl:text-lg font-bold text-slate-100">ClearScan</span>
            <span className="mt-0.5 block text-[11px] xl:text-xs text-slate-400">QR &amp; link safety</span>
          </span>
        </button>

        <nav aria-label="Primary navigation" className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.id ||
              (item.id === "dashboard" && (activePage === "scanner" || activePage === "manual")) ||
              (item.id === "learn" && activePage === "help");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`cs-nav-item flex min-h-9 xl:min-h-9.5 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs xl:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "border border-teal-600/15 bg-teal-500/10 text-teal-700 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-teal-600" : "text-slate-500"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-700 pt-2.5">
        <button
          type="button"
          onClick={() => onNavigate("about")}
          aria-current={activePage === "about" ? "page" : undefined}
          className={`cs-nav-item flex min-h-9 xl:min-h-9.5 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs xl:text-sm font-medium transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${activePage === "about" ? "border border-teal-600/15 bg-teal-500/10 text-teal-700 font-semibold" : "text-slate-300"}`}
        >
          <InfoCircle className={`h-4 w-4 shrink-0 ${activePage === "about" ? "text-teal-600" : "text-slate-500"}`} aria-hidden="true" />
          <span>About ClearScan</span>
        </button>
      </div>
    </aside>
  );
}
