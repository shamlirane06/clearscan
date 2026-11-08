import type { ScanHistoryItem } from "../types/scan";

interface ActivityChartProps {
  history: ScanHistoryItem[];
}

function getLastSevenDays(history: ScanHistoryItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const count = history.filter((item) => {
      const timestamp = new Date(item.timestamp);
      return !Number.isNaN(timestamp.getTime()) && timestamp >= date && timestamp < nextDate;
    }).length;

    return {
      date,
      count,
      label: index === 6 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
}

export default function ActivityChart({ history }: ActivityChartProps) {
  const days = getLastSevenDays(history);
  const weekTotal = days.reduce((sum, day) => sum + day.count, 0);
  const scaleMax = Math.max(4, ...days.map((day) => day.count));
  const chart = { left: 38, top: 14, width: 560, height: 132 };
  const barWidth = 36;
  const gap = (chart.width - barWidth * days.length) / (days.length - 1);
  const ticks = [scaleMax, Math.ceil(scaleMax / 2), 0];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6" aria-labelledby="activity-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="activity-title" className="text-lg font-semibold text-white sm:text-xl">Security activity</h2>
          <p className="mt-1 text-xs text-slate-400">Scans stored in this browser · last 7 days</p>
        </div>
        <span className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-300">
          {weekTotal} {weekTotal === 1 ? "scan" : "scans"}
        </span>
      </div>

      {weekTotal === 0 ? (
        <div className="mt-5 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-5 text-center text-sm text-slate-400">
          No scan activity in this browser during the last 7 days.
        </div>
      ) : (
        <figure className="mt-5" role="img" aria-label={`Scan activity for the last seven days. ${weekTotal} total scans.`}>
          <svg className="h-auto w-full overflow-visible" viewBox="0 0 640 196" aria-hidden="true">
            {ticks.map((tick) => {
              const y = chart.top + chart.height - (tick / scaleMax) * chart.height;
              return (
                <g key={tick}>
                  <line x1={chart.left} x2={chart.left + chart.width} y1={y} y2={y} stroke="var(--color-slate-800)" strokeDasharray="3 6" />
                  <text x="24" y={y + 4} textAnchor="end" fill="var(--color-slate-400)" fontSize="11">{tick}</text>
                </g>
              );
            })}
            {days.map((day, index) => {
              const x = chart.left + index * (barWidth + gap);
              const height = (day.count / scaleMax) * chart.height;
              const y = chart.top + chart.height - height;
              return (
                <g key={day.date.toISOString()}>
                  <rect
                    x={x}
                    y={day.count > 0 ? y : chart.top + chart.height - 2}
                    width={barWidth}
                    height={Math.max(height, 2)}
                    rx="6"
                    fill="var(--color-teal-500)"
                    opacity={day.count > 0 ? 0.9 : 0.25}
                  />
                  {day.count > 0 && (
                    <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="var(--color-slate-300)" fontSize="11" fontWeight="600">
                      {day.count}
                    </text>
                  )}
                  <text x={x + barWidth / 2} y="176" textAnchor="middle" fill="var(--color-slate-400)" fontSize="11">
                    {day.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>
      )}
    </section>
  );
}
