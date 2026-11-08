import {
  CircleHelp,
  FileText,
  LayoutDashboard,
  History,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  historyCount: number;
}

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "Scan History", icon: History },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "learn", label: "Help", icon: CircleHelp },
];

export default function Sidebar({ activePage, onNavigate, historyCount }: SidebarProps) {
  return (
    <aside className="hidden w-44 shrink-0 border-r border-slate-800 bg-slate-900/55 px-3 py-4 lg:block xl:w-48">
      <nav aria-label="Primary navigation" className="sticky top-20 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === "dashboard" && activePage === "dashboard");
          const content = (
            <>
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#bd522e]" : "text-slate-500"}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.id === "history" && historyCount > 0 && (
                <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  {historyCount}
                </span>
              )}
            </>
          );
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-7 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isActive
                  ? "border border-teal-500/15 bg-teal-500/10 text-[#a84c2e]"
                  : "text-slate-300 hover:bg-slate-800/75 hover:text-slate-100"
              }`}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
