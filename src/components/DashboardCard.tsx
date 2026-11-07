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
  badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}: DashboardCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 transition-all hover:border-zinc-700/80">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400">
          <Icon className="h-4 w-4" />
        </span>
        {badge && (
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3.5 space-y-1">
        <p className="font-mono text-2xl font-bold tracking-tight text-white">{value}</p>
        <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h4>
        <p className="text-xs text-zinc-500 leading-relaxed pt-1">{description}</p>
      </div>
    </div>
  );
}
