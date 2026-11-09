import type { ComponentType, SVGProps } from "react";

type DashboardIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: DashboardIcon;
  tone?: "brand" | "warning";
  trend: number[];
}

export default function DashboardCard({ title, value, description, icon: Icon, tone = "brand", trend }: DashboardCardProps) {
  const iconStyle = tone === "warning"
    ? "bg-amber-950 text-amber-300"
    : "bg-teal-950 text-teal-700";
  const maximum = Math.max(1, ...trend);
  const points = trend.map((value, index) => ({
    x: 3 + (index * 106) / Math.max(1, trend.length - 1),
    y: 30 - (value / maximum) * 23,
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? 109} 33 L 3 33 Z`;
  const lineColor = tone === "warning" ? "var(--cs-warning)" : "var(--cs-brand)";
  const fillColor = tone === "warning" ? "var(--cs-warning-subtle)" : "var(--cs-brand-subtle)";

  return (
    <div className="dashboard-stat-card relative flex min-w-0 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 xl:px-4 xl:py-5">
      <div className="flex w-full min-w-0 items-start gap-2.5">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconStyle}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-300 xl:text-base">{title}</p>
          <p className="mt-0.5 text-2xl font-semibold leading-none tracking-tight text-slate-100 tabular-nums xl:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-400 xl:text-sm">{description}</p>
        </div>
      </div>
      <svg className="dashboard-sparkline absolute right-4 top-4 hidden h-12 w-44 2xl:block" viewBox="0 0 112 36" aria-hidden="true">
        <path d={areaPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={lineColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
