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
  badgeColor = "bg-emerald-100 text-emerald-800",
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          <Icon className="h-5 w-5" />
        </span>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-0.5">
          {title}
        </h4>
        <p className="mt-2 text-xs text-zinc-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
