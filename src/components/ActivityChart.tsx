import { BarChart3, ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";
import type { ScanHistoryItem } from "../types/scan";

interface ActivityChartProps {
  history: ScanHistoryItem[];
}

function getActivityDays(history: ScanHistoryItem[], dayCount: 7 | 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (dayCount - 1 - index));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const count = history.filter((item) => {
      const timestamp = new Date(item.timestamp);
      return !Number.isNaN(timestamp.getTime()) && timestamp >= date && timestamp < nextDate;
    }).length;

    return {
      date,
      count,
      label: dayCount === 7
        ? date.toLocaleDateString(undefined, { weekday: "short" })
        : index % 5 === 0 || index === dayCount - 1
          ? date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
          : "",
    };
  });
}

export default function ActivityChart({ history }: ActivityChartProps) {
  const [dayCount, setDayCount] = useState<7 | 30>(7);
  const days = getActivityDays(history, dayCount);
  const weekTotal = days.reduce((sum, day) => sum + day.count, 0);
  const scaleMax = Math.max(10, Math.ceil(Math.max(...days.map((day) => day.count)) / 5) * 5);
  const chart = { left: 40, right: 614, top: 7, bottom: 70 };
  const step = (chart.right - chart.left) / (days.length - 1);
  const ticks = [scaleMax, Math.ceil(scaleMax / 10) * 5, 0];
  const points = days.map((day, index) => ({
    x: chart.left + index * step,
    y: chart.bottom - (day.count / scaleMax) * (chart.bottom - chart.top),
    ...day,
  }));
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;
    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = `${linePath} L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`;

  return (
    <section className="h-full rounded-2xl border border-slate-700 bg-slate-900 p-4 xl:p-5" aria-labelledby="activity-title">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-950 text-teal-700">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="activity-title" className="text-xl font-semibold text-slate-100">Scan activity</h2>
          <p className="mt-1 text-sm text-slate-400">Your scanning activity over the last {dayCount} days</p>
          </div>
        </div>
        <label className="relative inline-flex min-h-10 shrink-0 items-center rounded-lg border border-slate-700 bg-slate-900 pl-4 pr-9 text-sm font-medium text-slate-300 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-500/20">
          <span className="sr-only">Activity date range</span>
          <select
            aria-label="Activity date range"
            value={dayCount}
            onChange={(event) => setDayCount(Number(event.target.value) as 7 | 30)}
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <span>{dayCount === 7 ? "Last 7 days" : "Last 30 days"}</span>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" aria-hidden="true" />
        </label>
      </div>

      {weekTotal === 0 ? (
        <div className="flex min-h-24 items-center justify-center gap-3 border-t border-slate-700 px-1 py-5 text-sm text-slate-400" role="status">
          <Clock3 className="h-[18px] w-[18px] shrink-0 text-slate-500" aria-hidden="true" />
          <p>No scans saved in this browser during the last {dayCount} days.</p>
        </div>
      ) : (
        <figure className="mt-1" role="img" aria-label={`Scan activity for the last ${dayCount} days. ${weekTotal} total scans.`}>
          <svg className="h-auto w-full overflow-visible" viewBox="0 0 640 90" aria-hidden="true">
            {ticks.map((tick) => {
              const y = chart.bottom - (tick / scaleMax) * (chart.bottom - chart.top);
              return (
                <g key={tick}>
                  <line x1={chart.left} x2={chart.right} y1={y} y2={y} stroke="var(--cs-border)" />
                  <text x="28" y={y + 4} textAnchor="end" fill="var(--cs-text-muted)" fontSize="12">{tick}</text>
                </g>
              );
            })}
            {points.map((point) => (
              <line key={`day-grid-${point.date.toISOString()}`} x1={point.x} x2={point.x} y1={chart.top} y2={chart.bottom} stroke="var(--cs-border)" />
            ))}
            <path d={areaPath} fill="var(--cs-brand-subtle)" />
            <path d={linePath} fill="none" stroke="var(--cs-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            {points.map((point) => (
              <g key={point.date.toISOString()}>
                <circle cx={point.x} cy={point.y} r="4" fill="var(--cs-brand)" stroke="var(--cs-surface)" strokeWidth="2" />
                {point.label && <text x={point.x} y="84" textAnchor="middle" fill="var(--cs-text-muted)" fontSize="12">
                  {point.label}
                </text>}
              </g>
            ))}
          </svg>
        </figure>
      )}
    </section>
  );
}
