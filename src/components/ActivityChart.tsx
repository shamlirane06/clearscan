import { useState } from "react";
import { BarChart2, ChevronDown } from "lucide-react";
import type { ScanHistoryItem } from "../types/scan";

interface ActivityChartProps {
  history: ScanHistoryItem[];
}

type DayRange = 7 | 30 | 90;

function getActivityDays(history: ScanHistoryItem[], dayCount: DayRange) {
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

    let label = "";
    if (dayCount === 7) {
      label = date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (dayCount === 30) {
      if (index % 5 === 0 || index === dayCount - 1) {
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } else {
      if (index % 15 === 0 || index === dayCount - 1) {
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }

    return {
      date,
      count,
      label,
    };
  });
}

export default function ActivityChart({ history }: ActivityChartProps) {
  const [dayRange, setDayRange] = useState<DayRange>(7);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const days = getActivityDays(history, dayRange);
  const maxActual = Math.max(...days.map((d) => d.count), 0);
  // Keep the scale clean like the reference screenshot (0, 5, 10 or scale up by multiples of 5)
  const scaleMax = Math.max(10, Math.ceil(maxActual / 5) * 5);
  const scaleMid = Math.round(scaleMax / 2);
  const ticks = [scaleMax, scaleMid, 0];

  const chart = { left: 28, right: 580, top: 12, bottom: 94 };
  const step = (chart.right - chart.left) / Math.max(1, days.length - 1);

  const points = days.map((day, idx) => ({
    x: chart.left + idx * step,
    y: chart.bottom - (day.count / scaleMax) * (chart.bottom - chart.top),
    ...day,
  }));

  const linePath = points.reduce((acc, point, idx) => {
    if (idx === 0) return `M ${point.x} ${point.y}`;
    const prev = points[idx - 1];
    const midX = (prev.x + point.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chart.bottom} L ${points[0].x} ${chart.bottom} Z`;

  const rangeLabels: Record<DayRange, string> = {
    7: "Last 7 days",
    30: "Last 30 days",
    90: "Last 90 days",
  };

  return (
    <section
      className="flex h-full flex-col justify-between rounded-xl border border-[#d5ddda] bg-white p-3.5 sm:p-4 shadow-xs min-h-0"
      aria-labelledby="activity-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8.5 w-8.5 xl:h-9 xl:w-9 shrink-0 items-center justify-center rounded-full bg-[#e4f0e9] text-[#176b50]">
            <BarChart2 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="activity-title" className="text-base sm:text-lg font-bold text-[#24322c] leading-tight">
              Scan activity
            </h2>
            <p className="text-xs text-[#65736d] mt-0.5">
              Your scanning activity over the last {dayRange} days
            </p>
          </div>
        </div>

        {/* Date-range Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex h-8 xl:h-8.5 items-center gap-2 rounded-lg border border-[#d5ddda] bg-white px-3 text-xs sm:text-sm font-medium text-[#24322c] hover:bg-[#f4f6f5] focus:outline-none focus:ring-2 focus:ring-[#176b50]/20 transition-colors"
            aria-expanded={dropdownOpen}
            aria-label="Select date range"
          >
            <span>{rangeLabels[dayRange]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#65736d]" aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-[#d5ddda] bg-white p-1 shadow-lg text-left">
              {([7, 30, 90] as DayRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setDayRange(r);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    dayRange === r
                      ? "bg-[#e4f0e9] font-medium text-[#176b50]"
                      : "text-[#24322c] hover:bg-[#f4f6f5]"
                  }`}
                >
                  <span>{rangeLabels[r]}</span>
                  {dayRange === r && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="min-h-0 flex-1 flex flex-col justify-end pt-1">
        <svg
          className="h-auto w-full min-h-[135px] xl:min-h-[160px] max-h-[220px] overflow-visible"
          viewBox="0 0 600 118"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="activity-chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#176b50" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#176b50" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines & Y labels */}
          {ticks.map((tick) => {
            const y = chart.bottom - (tick / scaleMax) * (chart.bottom - chart.top);
            return (
              <g key={tick}>
                <line
                  x1={chart.left}
                  x2={chart.right}
                  y1={y}
                  y2={y}
                  stroke="#e8edeb"
                  strokeWidth="1"
                />
                <text
                  x={chart.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#65736d"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#activity-chart-gradient)" />

          {/* Main stroke line */}
          <path
            d={linePath}
            fill="none"
            stroke="#176b50"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />

          {/* Data points and X-axis labels */}
          {points.map((point, idx) => (
            <g key={idx}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="#176b50"
                stroke="#ffffff"
                strokeWidth="1.8"
              />
              {point.label && (
                <text
                  x={point.x}
                  y="112"
                  textAnchor="middle"
                  fill="#65736d"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
