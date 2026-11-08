import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  badgeColor = "bg-teal-500/10 text-teal-300 border-teal-500/20",
}: DashboardCardProps) {
  return (
    <div className="group relative min-w-0 p-4 transition-colors hover:bg-slate-950/60 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 transition-colors group-hover:text-white">
          <Icon className="h-4 w-4" />
        </span>
        {badge && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
        <h3 className="text-sm font-semibold text-slate-200">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed pt-1">{description}</p>
      </div>
    </div>
  );
}
