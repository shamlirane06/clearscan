import type { ComponentType, SVGProps } from "react";

type DashboardIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: DashboardIcon;
  tone?: "brand" | "warning";
  trend?: number[];
}

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "brand",
  trend,
}: DashboardCardProps) {
  const isWarning = tone === "warning";
  const iconStyle = isWarning
    ? "bg-[#fef3c7] text-[#b45309]"
    : "bg-[#e4f0e9] text-[#176b50]";

  const lineColor = isWarning ? "#b45309" : "#176b50";
  const fillColor = isWarning ? "#b45309" : "#176b50";

  // Calculate sparkline path from trend if available and non-empty
  let linePath = "M 2 26 C 20 27, 34 18, 54 20 C 74 22, 84 10, 96 12 C 102 13, 106 6, 109 4";
  let areaPath = "M 2 26 C 20 27, 34 18, 54 20 C 74 22, 84 10, 96 12 C 102 13, 106 6, 109 4 L 109 34 L 2 34 Z";

  if (trend && trend.length > 1) {
    const maximum = Math.max(1, ...trend);
    const points = trend.map((val, idx) => ({
      x: 3 + (idx * 104) / Math.max(1, trend.length - 1),
      y: 28 - (val / maximum) * 22,
    }));
    const lineSegments = points.reduce((acc, point, idx) => {
      if (idx === 0) return `M ${point.x} ${point.y}`;
      const prev = points[idx - 1];
      const midX = (prev.x + point.x) / 2;
      return `${acc} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
    }, "");
    linePath = lineSegments;
    areaPath = `${lineSegments} L ${points[points.length - 1].x} 34 L ${points[0].x} 34 Z`;
  }

  return (
    <div className="relative flex min-w-0 items-center justify-between rounded-xl border border-[#d5ddda] bg-white p-2.5 sm:p-3 xl:p-3.5 shadow-xs overflow-hidden">
      <div className="flex min-w-0 items-center gap-2.5 xl:gap-3">
        <span className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${iconStyle}`}>
          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#65736d]">{title}</p>
          <p className="mt-0.5 text-xl sm:text-2xl xl:text-[26px] font-bold tracking-tight text-[#24322c] tabular-nums leading-tight">
            {value}
          </p>
          <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-[#65736d] leading-tight truncate max-w-[200px] xl:max-w-none">{description}</p>
        </div>
      </div>

      {/* Decorative sparkline on the right */}
      <svg
        className="hidden sm:block h-7 w-20 sm:w-24 shrink-0 overflow-visible ml-2"
        viewBox="0 0 110 34"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={areaPath}
          fill={fillColor}
          fillOpacity="0.08"
        />
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
}
